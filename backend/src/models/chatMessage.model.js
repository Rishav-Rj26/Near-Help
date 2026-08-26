import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema({
  incident: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Incident',
    required: true,
  },
  responder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  sentAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index for efficient chat history queries scoped to a responder thread
chatMessageSchema.index({ incident: 1, responder: 1, sentAt: 1 });

export const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);
