import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { updateUserLocation } from '../controllers/geospatial.controller.js';

const router = express.Router();

router.put('/location', protect, async (req, res) => {
  try {
    const { lng, lat } = req.body;
    
    if (lng === undefined || lat === undefined) {
      return res.status(400).json({ message: 'lng and lat are required' });
    }

    const updatedUser = await updateUserLocation(req.user.id, lng, lat);
    res.json({ message: 'Location updated', location: updatedUser.location });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
