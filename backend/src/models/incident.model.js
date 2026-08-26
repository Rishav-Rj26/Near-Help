import mongoose from 'mongoose';

const incidentSchema = new mongoose.Schema({
  broadcaster: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  crisisType: {
    type: String,
    enum: ['medical', 'fire', 'gas_leak', 'accident', 'threat', 'other'],
    required: true,
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
  radius: {
    type: Number,
    enum: [500, 1000, 2000],
    default: 1000,
  },
  isAnonymous: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ['active', 'resolved'],
    default: 'active',
  },
  responders: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    joinedAt: { type: Date, default: Date.now },
    lastLocation: {
      type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
      },
    },
    lastLocationAt: Date,
    hasRelevantSkill: { type: Boolean, default: false },
    rating: { type: Number, min: 1, max: 5 },
  }],
  resolvedAt: Date,
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  details: {
    type: String,
    default: '',
  },
  aiGuidance: {
    steps: [String],
  },
  aiSummary: {
    summary: String,
  },
  debrief: {
    wasReal: Boolean,
    notes: String,
    submittedAt: Date,
  },
}, { timestamps: true });

// 2dsphere index for geospatial queries
incidentSchema.index({ location: '2dsphere' });

export const Incident = mongoose.model('Incident', incidentSchema);
