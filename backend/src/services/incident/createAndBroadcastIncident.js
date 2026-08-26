import { User } from '../../models/user.model.js';
import { Incident } from '../../models/incident.model.js';
import { findUsersNear, findNearbyServices } from '../../controllers/geospatial.controller.js';
import { generateCrisisGuidance } from '../ai/crisisGuidance.service.js';
import { generateEmergencySummary } from '../ai/emergencySummary.service.js';

// Throttle map for sos:trigger — key: userId, value: last timestamp
export const triggerThrottleMap = new Map();
const TRIGGER_THROTTLE_MS = 30000; // 30 seconds

/**
 * Shared service for creating and broadcasting an SOS incident.
 * This can be called by both WebSocket handlers (app) and SMS webhook controllers.
 * 
 * Throws an Error with a `code` property if validation fails (e.g. DUPLICATE_SOS).
 */
export const createAndBroadcastIncident = async ({
  io,
  connectedUsers,
  broadcasterUserId,
  crisisType,
  location,
  radiusMeters = 1000,
  details = '',
  isAnonymous = false,
  source = 'socket' // 'socket' or 'sms'
}) => {
  // 1. Trust check: load user to see if they are suspended
  const userDoc = await User.findById(broadcasterUserId).select('trust name avatarUrl');
  if (userDoc?.trust?.isSuspended) {
    const err = new Error('Your account is suspended due to excessive false alerts. You cannot trigger SOS.');
    err.code = 'SUSPENDED';
    throw err;
  }

  // 2. Basic Rate Limiting: 30s per user
  const lastTrigger = triggerThrottleMap.get(broadcasterUserId);
  if (lastTrigger && Date.now() - lastTrigger < TRIGGER_THROTTLE_MS) {
    const err = new Error('Please wait before triggering another SOS.');
    err.code = 'RATE_LIMIT';
    throw err;
  }
  triggerThrottleMap.set(broadcasterUserId, Date.now());

  // 3. Duplicate SOS Prevention
  const existingActive = await Incident.findOne({ broadcaster: broadcasterUserId, status: 'active' });
  if (existingActive) {
    const err = new Error('You already have an active SOS.');
    err.code = 'DUPLICATE_SOS';
    throw err;
  }

  // 4. Create Incident
  const incident = await Incident.create({
    broadcaster: broadcasterUserId,
    crisisType,
    location: { type: 'Point', coordinates: [location.lng, location.lat] },
    radius: radiusMeters,
    isAnonymous,
    details,
  });

  // 5. Find nearby users
  const nearbyUsers = await findUsersNear(location.lng, location.lat, incident.radius);

  // 6. Build payload with PII stripping
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
      broadcasterName: userDoc.name,
      broadcasterAvatar: userDoc.avatarUrl,
    };
  }

  // 7. Emit sos:new to nearby connected users (Fan-out)
  let notifiedCount = 0;
  if (io && connectedUsers) {
    nearbyUsers.forEach((u) => {
      // Don't send to self
      if (u._id.toString() !== broadcasterUserId.toString()) {
        const nearbySocketId = connectedUsers.get(u._id.toString());
        if (nearbySocketId) {
          io.to(nearbySocketId).emit('sos:new', emitPayload);
          notifiedCount++;
        }
      }
    });
  }

  // 8. Phase 3: AI generation — runs AFTER fan-out, never blocks broadcast
  // We don't await this so it runs async.
  (async () => {
    try {
      const [guidanceResult, summaryResult, nearbyServicesResult] = await Promise.all([
        generateCrisisGuidance({ crisisType, details: incident.details }),
        generateEmergencySummary({
          crisisType,
          location: { lng: location.lng, lat: location.lat },
          details: incident.details,
          radius: incident.radius,
          responderCount: 0,
        }),
        findNearbyServices(location.lng, location.lat, incident.radius, 3), // Get top 3 nearby services
      ]);
      
      incident.aiGuidance = guidanceResult;
      incident.aiSummary = summaryResult;
      incident.nearbyServices = nearbyServicesResult.map(s => ({
        name: s.name,
        type: s.type,
        phone: s.phone,
        coordinates: s.location.coordinates,
      }));
      await incident.save();

      if (io) {
        io.to(`incident:${incident._id}`).emit('sos:ai_ready', {
          incidentId: incident._id,
          aiGuidance: guidanceResult,
          aiSummary: summaryResult,
          nearbyServices: incident.nearbyServices,
        });
      }
    } catch (err) {
      console.error('AI generation failed (non-blocking):', err);
    }
  })();

  return { incident, emitPayload, notifiedCount };
};
