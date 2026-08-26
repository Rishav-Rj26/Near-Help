import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { EmergencyService } from '../models/emergencyService.model.js';

dotenv.config();

const DELHI_COORDS = [77.2090, 28.6139]; // [lng, lat]

const services = [
  {
    name: "Safdarjung Hospital",
    type: "hospital",
    phone: "+91-11-26165060",
    location: {
      type: "Point",
      coordinates: [77.2065, 28.5683],
    },
  },
  {
    name: "AIIMS New Delhi",
    type: "hospital",
    phone: "+91-11-26588500",
    location: {
      type: "Point",
      coordinates: [77.2084, 28.5659],
    },
  },
  {
    name: "Connaught Place Fire Station",
    type: "fire_station",
    phone: "101",
    location: {
      type: "Point",
      coordinates: [77.2183, 28.6329],
    },
  },
  {
    name: "Parliament Street Police Station",
    type: "police",
    phone: "112",
    location: {
      type: "Point",
      coordinates: [77.2120, 28.6250],
    },
  },
  {
    name: "RML Hospital",
    type: "hospital",
    phone: "+91-11-23365525",
    location: {
      type: "Point",
      coordinates: [77.1994, 28.6253],
    },
  },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/nearhelp');
    console.log('MongoDB Connected...');

    await EmergencyService.deleteMany();
    console.log('Cleared existing emergency services.');

    await EmergencyService.insertMany(services);
    console.log('Seeded 5 emergency services.');

    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedDB();
