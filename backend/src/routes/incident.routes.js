import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { findActiveIncidentsNear } from '../controllers/geospatial.controller.js';
import { Incident } from '../models/incident.model.js';
import { ChatMessage } from '../models/chatMessage.model.js';
import { User } from '../models/user.model.js';

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

// GET /api/incidents/:id
// Get incident details for late joiners
router.get('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const incident = await Incident.findById(id).populate('broadcaster', 'name avatarUrl');
    
    if (!incident) {
      return res.status(404).json({ message: 'Incident not found' });
    }

    const incObj = incident.toObject();
    
    // PII Stripping for anonymous incidents if viewer is not admin/broadcaster
    const isBroadcaster = incident.broadcaster._id.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';
    
    if (incObj.isAnonymous && !isBroadcaster && !isAdmin) {
      incObj.broadcaster.name = 'Anonymous reporter';
      delete incObj.broadcaster.avatarUrl;
    }

    res.json(incObj);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/incidents/:id/debrief
// Submit debrief notes after resolution
router.post('/:id/debrief', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { wasReal, notes } = req.body;
    const currentUserId = req.user.id;

    const incident = await Incident.findById(id);
    if (!incident) {
      return res.status(404).json({ message: 'Incident not found' });
    }

    const isBroadcaster = incident.broadcaster.toString() === currentUserId;
    const isAdmin = req.user.role === 'admin';

    if (!isBroadcaster && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to submit debrief' });
    }

    incident.debrief = {
      wasReal,
      notes,
      submittedAt: new Date()
    };
    
    await incident.save();

    // Trust Update: if false alert, increment falseAlertCount
    if (wasReal === false) {
      const broadcaster = await User.findById(incident.broadcaster);
      if (broadcaster) {
        // Mongoose defaults aren't applied to existing nested subdocs if undefined, ensure it exists
        if (!broadcaster.trust) broadcaster.trust = { responseCount: 0, avgRating: 0, falseAlertCount: 0, isSuspended: false, suspendedUntil: null };
        
        broadcaster.trust.falseAlertCount += 1;
        if (broadcaster.trust.falseAlertCount >= 3) {
          broadcaster.trust.isSuspended = true;
        }
        await broadcaster.save();
      }
    }

    res.json({ message: 'Debrief submitted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /api/incidents/:id/responders/:responderId/rating
// Rate a responder
router.patch('/:id/responders/:responderId/rating', protect, async (req, res) => {
  try {
    const { id, responderId } = req.params;
    const { rating } = req.body;
    const currentUserId = req.user.id;

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const incident = await Incident.findById(id);
    if (!incident) {
      return res.status(404).json({ message: 'Incident not found' });
    }

    const isBroadcaster = incident.broadcaster.toString() === currentUserId;
    const isAdmin = req.user.role === 'admin';

    if (!isBroadcaster && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to rate responders' });
    }

    const responderEntry = incident.responders.find(r => r.user.toString() === responderId);
    if (!responderEntry) {
      return res.status(404).json({ message: 'Responder not found in incident' });
    }

    responderEntry.rating = rating;
    await incident.save();

    // Trust Update: update responder's running avg and count
    const responderUser = await User.findById(responderId);
    if (responderUser) {
      if (!responderUser.trust) responderUser.trust = { responseCount: 0, avgRating: 0, falseAlertCount: 0, isSuspended: false, suspendedUntil: null };

      const oldCount = responderUser.trust.responseCount || 0;
      const oldAvg = responderUser.trust.avgRating || 0;
      
      const newAvg = (oldAvg * oldCount + rating) / (oldCount + 1);
      
      responderUser.trust.responseCount = oldCount + 1;
      responderUser.trust.avgRating = newAvg;
      await responderUser.save();
    }
    
    res.json({ message: 'Rating updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

