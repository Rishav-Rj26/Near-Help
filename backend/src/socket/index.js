import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { Incident } from '../models/incident.model.js';
import { User } from '../models/user.model.js';
import { ChatMessage } from '../models/chatMessage.model.js';
import { findUsersNear, updateUserLocation } from '../controllers/geospatial.controller.js';
import { generateCrisisGuidance } from '../services/ai/crisisGuidance.service.js';
import { generateEmergencySummary } from '../services/ai/emergencySummary.service.js';
import { generateDebriefQuestions } from '../services/ai/debriefPrompt.service.js';

let io;
// In-memory store mapping userId -> socketId
const connectedUsers = new Map();

// Throttle map for responder:location — key: `${incidentId}:${userId}`, value: last timestamp
const locationThrottleMap = new Map();
const LOCATION_THROTTLE_MS = 3000; // 3 seconds

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*', // Adjust for production
      methods: ['GET', 'POST'],
    },
  });

  // Authentication Middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.data.user = decoded; // Attach { id, name, role }
      next();
    } catch (err) {
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.data.user.id;
    console.log(`User connected: ${userId} (Socket: ${socket.id})`);
    
    connectedUsers.set(userId, socket.id);

    // ─────────────────────────────────────────────
    // Phase 1: location:update
    // ─────────────────────────────────────────────
    socket.on('location:update', async ({ lng, lat }) => {
      try {
        await updateUserLocation(userId, lng, lat);
        console.log(`Updated location for user ${userId}`);
      } catch (err) {
        console.error('Error updating location:', err);
      }
    });

    // ─────────────────────────────────────────────
    // Phase 1: sos:trigger
    // ─────────────────────────────────────────────
    socket.on('sos:trigger', async (payload) => {
      try {
        const { crisisType, location, radius, isAnonymous, details } = payload;
        
        // 1. Identity from JWT
        const broadcasterId = userId;
        
        // 2. Create Incident
        const incident = await Incident.create({
          broadcaster: broadcasterId,
          crisisType,
          location: { type: 'Point', coordinates: [location.lng, location.lat] },
          radius: radius || 1000,
          isAnonymous: isAnonymous || false,
          details: details || '',
        });

        const broadcasterUser = await User.findById(broadcasterId);

        // 3. Find nearby users
        const nearbyUsers = await findUsersNear(location.lng, location.lat, incident.radius);

        // 4. Build payload with PII stripping
        const basePayload = {
          incidentId: incident._id,
          crisisType: incident.crisisType,
          location: incident.location,
          isAnonymous: incident.isAnonymous,
          radius: incident.radius,
          createdAt: incident.createdAt,
        };

        let emitPayload;
        if (incident.isAnonymous) {
          emitPayload = {
            ...basePayload,
            broadcasterName: 'Anonymous reporter',
          };
        } else {
          emitPayload = {
            ...basePayload,
            broadcasterName: broadcasterUser.name,
            broadcasterAvatar: broadcasterUser.avatarUrl,
          };
        }

        // 5. Emit sos:new to nearby connected users
        let notifiedCount = 0;
        nearbyUsers.forEach((u) => {
          // Don't send to self
          if (u._id.toString() !== broadcasterId.toString()) {
            const nearbySocketId = connectedUsers.get(u._id.toString());
            if (nearbySocketId) {
              io.to(nearbySocketId).emit('sos:new', emitPayload);
              notifiedCount++;
            }
          }
        });

        // 6. Join broadcaster to room
        socket.join(`incident:${incident._id}`);

        // 7. Emit success back to broadcaster
        socket.emit('sos:triggered', { ...emitPayload, notifiedCount });
        console.log(`SOS triggered by ${broadcasterId}, notified ${notifiedCount} users`);

        // Phase 3: AI generation — runs AFTER fan-out, never blocks broadcast
        (async () => {
          try {
            const [guidanceResult, summaryResult] = await Promise.all([
              generateCrisisGuidance({ crisisType, details: incident.details }),
              generateEmergencySummary({
                crisisType,
                location: { lng: location.lng, lat: location.lat },
                details: incident.details,
                radius: incident.radius,
                responderCount: 0,
              }),
            ]);
            
            incident.aiGuidance = guidanceResult;
            incident.aiSummary = summaryResult;
            await incident.save();

            io.to(`incident:${incident._id}`).emit('sos:ai_ready', {
              incidentId: incident._id,
              aiGuidance: guidanceResult,
              aiSummary: summaryResult,
            });
          } catch (err) {
            console.error('AI generation failed (non-blocking):', err);
          }
        })();

      } catch (err) {
        console.error('Error in sos:trigger:', err);
        socket.emit('error', { code: 'SOS_ERROR', message: err.message });
      }
    });

    // ─────────────────────────────────────────────
    // Phase 2: responder:join
    // ─────────────────────────────────────────────
    socket.on('responder:join', async ({ incidentId }) => {
      try {
        const incident = await Incident.findById(incidentId);
        if (!incident) {
          return socket.emit('error', { code: 'NOT_FOUND', message: 'Incident not found' });
        }

        // Reject if not active
        if (incident.status !== 'active') {
          return socket.emit('error', { code: 'INCIDENT_CLOSED', message: 'Incident is no longer active' });
        }

        // Reject if already a responder (idempotent — no error, just ack)
        const alreadyJoined = incident.responders.some(
          (r) => r.user.toString() === userId
        );
        if (alreadyJoined) {
          // Still join the socket room in case they reconnected
          socket.join(`incident:${incidentId}`);
          return socket.emit('responder:joined', {
            incidentId,
            responder: { id: userId, name: socket.data.user.name, hasRelevantSkill: false },
            alreadyJoined: true,
            aiGuidance: incident.aiGuidance,
            aiSummary: incident.aiSummary,
          });
        }

        // Push into responders array
        incident.responders.push({ user: userId, joinedAt: new Date() });
        await incident.save();

        // Join socket room
        socket.join(`incident:${incidentId}`);

        // Fetch user for name
        const responderUser = await User.findById(userId);

        // Emit to room — this is about the RESPONDER, not the broadcaster,
        // so no PII stripping needed even if the incident is anonymous
        io.to(`incident:${incidentId}`).emit('responder:joined', {
          incidentId,
          responder: {
            id: userId,
            name: responderUser?.name || socket.data.user.name,
            hasRelevantSkill: false,
          },
          aiGuidance: incident.aiGuidance,
          aiSummary: incident.aiSummary,
        });

        console.log(`Responder ${userId} joined incident ${incidentId}`);
      } catch (err) {
        console.error('Error in responder:join:', err);
        socket.emit('error', { code: 'JOIN_ERROR', message: err.message });
      }
    });

    // ─────────────────────────────────────────────
    // Phase 2: responder:location
    // ─────────────────────────────────────────────
    socket.on('responder:location', async ({ incidentId, lng, lat }) => {
      try {
        // Server-side throttle: ignore updates more frequent than 3s
        const throttleKey = `${incidentId}:${userId}`;
        const now = Date.now();
        const lastUpdate = locationThrottleMap.get(throttleKey) || 0;
        if (now - lastUpdate < LOCATION_THROTTLE_MS) {
          return; // silently ignore
        }
        locationThrottleMap.set(throttleKey, now);

        const incident = await Incident.findById(incidentId);
        if (!incident || incident.status !== 'active') {
          return; // silent no-op per PRD
        }

        // Update the matching responder's location in the subdocument
        const responderEntry = incident.responders.find(
          (r) => r.user.toString() === userId
        );
        if (!responderEntry) {
          return; // not a responder on this incident
        }

        responderEntry.lastLocation = {
          type: 'Point',
          coordinates: [parseFloat(lng), parseFloat(lat)],
        };
        responderEntry.lastLocationAt = new Date();
        await incident.save();

        // Broadcast to the incident room
        io.to(`incident:${incidentId}`).emit('responder:location:update', {
          incidentId,
          responderId: userId,
          coordinates: [parseFloat(lng), parseFloat(lat)],
          timestamp: responderEntry.lastLocationAt,
        });
      } catch (err) {
        console.error('Error in responder:location:', err);
        // Silent — don't crash on location pings
      }
    });

    // ─────────────────────────────────────────────
    // Phase 2: chat:message
    // ─────────────────────────────────────────────
    socket.on('chat:message', async ({ incidentId, responderId, text }) => {
      try {
        const senderId = userId; // from JWT, never from payload

        const incident = await Incident.findById(incidentId);
        if (!incident) {
          return socket.emit('error', { code: 'NOT_FOUND', message: 'Incident not found' });
        }

        // Validate sender is either the broadcaster OR the specific responderId
        const isBroadcaster = incident.broadcaster.toString() === senderId;
        const isResponder = responderId === senderId;

        if (!isBroadcaster && !isResponder) {
          return socket.emit('error', {
            code: 'CHAT_UNAUTHORIZED',
            message: 'You are not authorized to post in this chat thread',
          });
        }

        // Save message
        const chatMessage = await ChatMessage.create({
          incident: incidentId,
          responder: responderId,
          sender: senderId,
          text,
        });

        // Emit to room — the frontend handles anonymous rendering
        io.to(`incident:${incidentId}`).emit('chat:message:new', {
          incidentId,
          responderId,
          sender: senderId,
          text,
          sentAt: chatMessage.sentAt,
        });
      } catch (err) {
        console.error('Error in chat:message:', err);
        socket.emit('error', { code: 'CHAT_ERROR', message: err.message });
      }
    });

    // ─────────────────────────────────────────────
    // Phase 2: sos:resolve
    // ─────────────────────────────────────────────
    socket.on('sos:resolve', async ({ incidentId }) => {
      try {
        const incident = await Incident.findById(incidentId);
        if (!incident) {
          return socket.emit('error', { code: 'NOT_FOUND', message: 'Incident not found' });
        }

        // Authorization: only broadcaster or admin may resolve
        const isBroadcaster = incident.broadcaster.toString() === userId;
        const isAdmin = socket.data.user.role === 'admin';

        if (!isBroadcaster && !isAdmin) {
          return socket.emit('error', {
            code: 'RESOLVE_UNAUTHORIZED',
            message: 'Only the broadcaster or an admin can resolve this incident',
          });
        }

        // Set resolved
        incident.status = 'resolved';
        incident.resolvedAt = new Date();
        incident.resolvedBy = userId;
        await incident.save();

        // Emit to room
        io.to(`incident:${incidentId}`).emit('sos:resolved', { incidentId });

        // Phase 3: Generate debrief questions for the broadcaster
        (async () => {
          try {
            const debriefResult = await generateDebriefQuestions({ crisisType: incident.crisisType });
            socket.emit('sos:debrief_ready', {
              incidentId,
              questions: debriefResult.questions,
            });
          } catch (err) {
            console.error('Debrief generation failed (non-blocking):', err);
          }
        })();

        // Room cleanup: have all sockets leave
        const room = `incident:${incidentId}`;
        const socketsInRoom = await io.in(room).fetchSockets();
        for (const s of socketsInRoom) {
          s.leave(room);
        }

        // Clean up throttle entries for this incident
        for (const key of locationThrottleMap.keys()) {
          if (key.startsWith(`${incidentId}:`)) {
            locationThrottleMap.delete(key);
          }
        }

        console.log(`Incident ${incidentId} resolved by ${userId}`);
      } catch (err) {
        console.error('Error in sos:resolve:', err);
        socket.emit('error', { code: 'RESOLVE_ERROR', message: err.message });
      }
    });

    // ─────────────────────────────────────────────
    // Disconnect
    // ─────────────────────────────────────────────
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${userId}`);
      // Remove if this socket is still the active one for the user
      if (connectedUsers.get(userId) === socket.id) {
        connectedUsers.delete(userId);
      }
    });
  });
};

export const getIO = () => io;
