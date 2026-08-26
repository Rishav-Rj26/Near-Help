import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Incident } from '../models/incident.model.js';
import { ChatMessage } from '../models/chatMessage.model.js';

dotenv.config();

const resetDemoData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/nearhelp');
    console.log('MongoDB Connected...');

    const incidentResult = await Incident.deleteMany({});
    console.log(`Cleared ${incidentResult.deletedCount} incidents.`);

    const chatResult = await ChatMessage.deleteMany({});
    console.log(`Cleared ${chatResult.deletedCount} chat messages.`);

    console.log('Demo data reset successfully (users and emergency services preserved).');
    process.exit(0);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

resetDemoData();
