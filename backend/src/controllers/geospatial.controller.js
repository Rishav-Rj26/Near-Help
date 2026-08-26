import { User } from '../models/user.model.js';
import { Incident } from '../models/incident.model.js';

/**
 * Find users within a certain radius of a location.
 */
export const findUsersNear = async (lng, lat, radiusMeters) => {
  return User.find({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [parseFloat(lng), parseFloat(lat)],
        },
        $maxDistance: parseInt(radiusMeters),
      },
    },
  });
};

/**
 * Find active incidents within a certain radius.
 */
export const findActiveIncidentsNear = async (lng, lat, radiusMeters) => {
  return Incident.find({
    status: 'active',
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [parseFloat(lng), parseFloat(lat)],
        },
        $maxDistance: parseInt(radiusMeters),
      },
    },
  });
};

/**
 * Update user's current location.
 */
export const updateUserLocation = async (userId, lng, lat) => {
  return User.findByIdAndUpdate(
    userId,
    {
      location: {
        type: 'Point',
        coordinates: [parseFloat(lng), parseFloat(lat)],
      },
      lastLocationUpdate: new Date(),
    },
    { new: true }
  );
};
