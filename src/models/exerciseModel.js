// src/models/exerciseModel.js
import mongoose from 'mongoose';
import toJSON from './plugins/toJSONPlugin';

const exerciseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    enum: ['Back', 'Chest', 'Biceps', 'Triceps', 'Shoulder', 'Leg', 'Full Body', 'Core'],
    required: true,
  },
  videoUrl: {
    type: String,
    required: true,
    },
  durationMin: {
    type: Number,
    required: true,
    min: 1,
  },
  targetAreas: [String], // e.g., ['Legs', 'Core', 'Arms']
  videoUrl: {
    type: String,
    required: true,
  },
  defaultSets: {
    type: Number,
    default: 3,
  },
  defaultReps: {
    type: Number,
    default: 10,
  },
  defaultWeightKg: {
    type: Number,
    default: 0,
  },
  estimatedBurnPerMin: {
    type: Number,
    default: 5, // kcal per minute
  },
}, {
  timestamps: true,
});

exerciseSchema.plugin(toJSON);

const Exercise = mongoose.model('exercises', exerciseSchema);
export default Exercise;