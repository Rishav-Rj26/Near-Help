import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { updateUserLocation } from '../controllers/geospatial.controller.js';
import { VALID_SKILLS } from '../utils/skillMatch.js';
import { User } from '../models/user.model.js';
import { Incident } from '../models/incident.model.js';
import { parseCoordinates } from '../utils/validation.js';

const router = express.Router();

// GET /api/users/me
// Get current user profile and stats
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user,
      stats: {
        responseCount: user.trust?.responseCount || 0,
        avgRating: user.trust?.avgRating || 0,
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/users/skills
// Update user skills
router.put('/skills', protect, async (req, res) => {
  try {
    const { skills } = req.body;
    
    if (!Array.isArray(skills)) {
      return res.status(400).json({ message: 'skills must be an array' });
    }

    // Validate against enum
    const validSkillsSet = new Set(VALID_SKILLS);
    const isValid = skills.every(skill => validSkillsSet.has(skill));
    
    if (!isValid) {
      return res.status(400).json({ message: 'One or more invalid skills provided' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { skills },
      { new: true }
    ).select('-password');

    res.json({ message: 'Skills updated', skills: updatedUser.skills });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/location', protect, async (req, res) => {
  try {
    const { lng, lat } = req.body;
    
    if (lng === undefined || lat === undefined) {
      return res.status(400).json({ message: 'lng and lat are required' });
    }

    const coordinates = parseCoordinates(lng, lat);
    if (!coordinates) return res.status(400).json({ message: 'Provide valid longitude and latitude values' });

    const updatedUser = await updateUserLocation(req.user.id, coordinates.lng, coordinates.lat);
    res.json({ message: 'Location updated', location: updatedUser.location });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
