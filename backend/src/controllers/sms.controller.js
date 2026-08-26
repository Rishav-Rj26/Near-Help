import twilio from 'twilio';
import { User } from '../models/user.model.js';
import { Incident } from '../models/incident.model.js';
import { validateTwilioSignature } from '../services/sms/twilioClient.js';
import { createAndBroadcastIncident } from '../services/incident/createAndBroadcastIncident.js';
import { getIO } from '../socket/index.js';

// Fuzzy matcher for crisis types
const typeMap = {
  medical: 'medical',
  fire: 'fire',
  gasleak: 'gas_leak',
  'gas leak': 'gas_leak',
  gas_leak: 'gas_leak',
  accident: 'accident',
  threat: 'threat',
  other: 'other',
};

const sendTwiML = (res, message) => {
  const twiml = new twilio.twiml.MessagingResponse();
  twiml.message(message);
  res.type('text/xml').send(twiml.toString());
};

export const handleInboundSms = async (req, res) => {
  try {
    // 1. Validate signature
    if (process.env.NODE_ENV === 'production' || process.env.TWILIO_AUTH_TOKEN) {
      if (!validateTwilioSignature(req)) {
        return res.status(403).send('Forbidden: Invalid Twilio Signature');
      }
    }

    const from = req.body.From;
    const body = (req.body.Body || '').trim();

    // 2. User lookup
    const user = await User.findOne({ phone: from });
    if (!user) {
      return sendTwiML(res, "This number isn't registered with NearHelp. Open the app once to register before using SMS SOS.");
    }

    // 3. RESOLVED parser (Optional scope requested by user)
    const resolveMatch = body.match(/^RESOLVED\s+(\w+)$/i);
    if (resolveMatch) {
      const incidentId = resolveMatch[1];
      const incident = await Incident.findById(incidentId);
      
      if (!incident) {
        return sendTwiML(res, `Incident #${incidentId} not found.`);
      }
      
      if (incident.broadcaster.toString() !== user._id.toString()) {
        return sendTwiML(res, "You can only resolve your own incidents.");
      }

      if (incident.status === 'resolved') {
        return sendTwiML(res, `Incident #${incidentId} is already resolved.`);
      }

      incident.status = 'resolved';
      incident.resolvedAt = new Date();
      incident.resolvedBy = user._id;
      await incident.save();

      // Emit to room
      const io = getIO();
      if (io) {
        io.to(`incident:${incidentId}`).emit('sos:resolved', { incidentId });
        const room = `incident:${incidentId}`;
        const socketsInRoom = await io.in(room).fetchSockets();
        for (const s of socketsInRoom) {
          s.leave(room);
        }
      }

      return sendTwiML(res, `NearHelp: Incident #${incidentId} has been marked as resolved. Stay safe!`);
    }

    // 4. SOS parser
    const sosMatch = body.match(/^SOS\s+(\S+)\s*(.*)?$/i);
    if (!sosMatch) {
      return sendTwiML(res, "Text SOS <TYPE> <details> — e.g. SOS MEDICAL fell down the stairs. Types: medical, fire, gas leak, accident, threat.");
    }

    const typeArg = sosMatch[1].toLowerCase();
    const crisisType = typeMap[typeArg];
    if (!crisisType) {
      return sendTwiML(res, "Invalid crisis type. Text SOS <TYPE> <details>. Types: medical, fire, gas leak, accident, threat.");
    }
    const details = sosMatch[2] || '';

    // 5. Location check
    if (!user.location || !user.location.coordinates || user.location.coordinates.length < 2) {
      return sendTwiML(res, "We don't have a location on file for you yet — please open the NearHelp app once so we can save your location for SMS SOS to work.");
    }

    const [lng, lat] = user.location.coordinates;

    // 6. Create incident via shared service
    // We pass io=undefined and connectedUsers=undefined because we don't have them here easily,
    // wait, we can get io from socket/index.js. connectedUsers is harder to export.
    // The shared service safely skips fan-out if io/connectedUsers are not provided.
    // But wait, the whole point of creating the incident is to fan it out to nearby app users!
    // We *must* fan it out. Let's fix this.
    // We need to export connectedUsers from socket/index.js or expose a broadcast function.
    // I will export connectedUsers from socket/index.js.
    const { getConnectedUsers } = await import('../socket/index.js');
    const io = getIO();
    const connectedUsers = getConnectedUsers ? getConnectedUsers() : new Map();

    const result = await createAndBroadcastIncident({
      io,
      connectedUsers,
      broadcasterUserId: user._id,
      crisisType,
      location: { lng, lat },
      radiusMeters: 1000,
      details,
      isAnonymous: false,
      source: 'sms',
    });

    // 7. Success
    return sendTwiML(res, `NearHelp: Your ${typeArg.toUpperCase()} SOS has been sent to nearby responders. Ticket #${result.incident._id}. Reply RESOLVED ${result.incident._id} once it's handled.`);

  } catch (err) {
    console.error('SMS handle error:', err);
    
    // 8. Error handling
    if (err.code === 'DUPLICATE_SOS') {
      return sendTwiML(res, err.message);
    }
    if (err.code === 'RATE_LIMIT') {
      return sendTwiML(res, err.message);
    }
    if (err.code === 'SUSPENDED') {
      return sendTwiML(res, err.message);
    }

    return sendTwiML(res, "NearHelp: An internal error occurred while processing your request. Please try the app.");
  }
};
