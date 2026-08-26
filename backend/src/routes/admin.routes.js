import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { isAdmin } from '../middleware/isAdmin.middleware.js';
import { Incident } from '../models/incident.model.js';
import { User } from '../models/user.model.js';

const router = express.Router();

// Apply middleware to all routes in this file
router.use(protect);
router.use(isAdmin);

// GET /api/admin/incidents/active
router.get('/incidents/active', async (req, res) => {
  try {
    const activeIncidents = await Incident.find({ status: 'active' })
      .populate('broadcaster', 'name email phone trust avatarUrl')
      .sort({ createdAt: -1 });
    
    // Note: Intentional NO PII stripping here for admin accountability requirement.
    res.json(activeIncidents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/admin/analytics
router.get('/analytics', async (req, res) => {
  try {
    // Active count
    const activeCount = await Incident.countDocuments({ status: 'active' });
    
    // Flagged user count
    const flaggedUserCount = await User.countDocuments({
      $or: [
        { 'trust.falseAlertCount': { $gt: 0 } },
        { 'trust.isSuspended': true }
      ]
    });

    // Avg response time (mean of firstResponder.joinedAt - incident.createdAt for resolved incidents in last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const resolvedIncidents = await Incident.find({
      status: 'resolved',
      createdAt: { $gte: sevenDaysAgo }
    });

    let totalResponseTimeMs = 0;
    let validIncidentCount = 0;

    resolvedIncidents.forEach(incident => {
      if (incident.responders && incident.responders.length > 0) {
        // Sort responders by joinedAt to find the first one
        const sortedResponders = [...incident.responders].sort((a, b) => a.joinedAt - b.joinedAt);
        const firstResponder = sortedResponders[0];
        
        const responseTimeMs = firstResponder.joinedAt.getTime() - incident.createdAt.getTime();
        if (responseTimeMs >= 0) {
          totalResponseTimeMs += responseTimeMs;
          validIncidentCount++;
        }
      }
    });

    const avgResponseTimeSec = validIncidentCount > 0 
      ? Math.round(totalResponseTimeMs / validIncidentCount / 1000) 
      : 0;

    res.json({
      activeCount,
      avgResponseTimeSec,
      flaggedUserCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/admin/flagged-users
router.get('/flagged-users', async (req, res) => {
  try {
    const flaggedUsers = await User.find({
      $or: [
        { 'trust.falseAlertCount': { $gt: 0 } },
        { 'trust.isSuspended': true }
      ]
    }).select('-password');
    
    res.json(flaggedUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /api/admin/users/:id/suspend
router.patch('/users/:id/suspend', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    if (!user.trust) user.trust = { responseCount: 0, avgRating: 0, falseAlertCount: 0 };
    user.trust.isSuspended = true;
    await user.save();
    
    res.json({ message: 'User suspended', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /api/admin/users/:id/unsuspend
router.patch('/users/:id/unsuspend', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    if (!user.trust) user.trust = { responseCount: 0, avgRating: 0 };
    user.trust.isSuspended = false;
    user.trust.falseAlertCount = 0; // Reset false alerts
    await user.save();
    
    res.json({ message: 'User unsuspended', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
