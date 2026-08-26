import mongoose from 'mongoose';

const emergencyServiceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['hospital', 'fire_station', 'police'],
    required: true,
  },
  phone: {
    type: String,
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
  },
}, { timestamps: true });

// 2dsphere index for geospatial queries
emergencyServiceSchema.index({ location: '2dsphere' });

export const EmergencyService = mongoose.model('EmergencyService', emergencyServiceSchema);
