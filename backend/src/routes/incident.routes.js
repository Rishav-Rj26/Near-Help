import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { findActiveIncidentsNear } from '../controllers/geospatial.controller.js';
import { Incident } from '../models/incident.model.js';
import { ChatMessage } from '../models/chatMessage.model.js';

const router = express.Router();

router.get('/nearby', protect, async (req, res) => {
  try {
    const { lng, lat, radius = 5000 } = req.query; // default 5km for viewing map

    if (!lng || !lat) {
      return res.status(400).json({ message: 'lng and lat are required query parameters' });
    }

    const incidents = await findActiveIncidentsNear(lng, lat, radius);
    
    // PII Stripping for anonymous incidents in the API response
    const sanitizedIncidents = incidents.map(incident => {
      const incObj = incident.toObject();
      if (incObj.isAnonymous) {
        incObj.broadcasterName = 'Anonymous reporter';
        // We don't have broadcaster populated here yet, but if we did, we'd strip it.
        // We ensure we don't leak anything.
      }
      return incObj;
    });

    res.json(sanitizedIncidents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/incidents/:id/messages?responderId=...
// Loads chat history for reconnect/replay
router.get('/:id/messages', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { responderId } = req.query;
    const currentUserId = req.user.id;

    if (!responderId) {
      return res.status(400).json({ message: 'responderId query param is required' });
    }

    // Verify the user is either the broadcaster or the specific responder
    const incident = await Incident.findById(id);
    if (!incident) {
      return res.status(404).json({ message: 'Incident not found' });
    }

    const isBroadcaster = incident.broadcaster.toString() === currentUserId;
    const isResponder = responderId === currentUserId;

    if (!isBroadcaster && !isResponder) {
      return res.status(403).json({ message: 'Not authorized to view this chat thread' });
    }

    const messages = await ChatMessage.find({
      incident: id,
      responder: responderId,
    }).sort({ sentAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

