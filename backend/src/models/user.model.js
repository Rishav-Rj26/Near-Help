import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone: String,
  avatarUrl: String,
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: false,
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: false,
    },
  },
  skills: [String],
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  lastLocationUpdate: Date,
  trust: {
    responseCount: { type: Number, default: 0 },
    avgRating: { type: Number, default: 0 },
    falseAlertCount: { type: Number, default: 0 },
    isSuspended: { type: Boolean, default: false },
    suspendedUntil: { type: Date, default: null },
  }
}, { timestamps: true });

// 2dsphere index for geospatial queries
userSchema.index({ location: '2dsphere' });

export const User = mongoose.model('User', userSchema);
