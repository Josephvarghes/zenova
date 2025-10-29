// src/models/yogaLogModel.js
import mongoose from 'mongoose';
import toJSON from './plugins/toJSONPlugin';

const yogaLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true,
  },
  durationMin: {
    type: Number,
    required: true,
    min: 1,
  },
  type: {
    type: String,
    enum: ['Zen Burn', 'Zen Hyper', 'Manual'],
    required: true,
  },
  mood: {
    type: String,
    enum: ['Tired', 'Neutral', 'Calm', 'Energized'],
    default: 'Neutral',
  },
  loggedAt: {
    type: Date,
    default: Date.now,
  },
  source: {
    type: String,
    enum: ['manual', 'auto'],
    default: 'manual',
  },
}, {
  timestamps: true,
});

yogaLogSchema.index({ userId: 1, loggedAt: -1 });
yogaLogSchema.plugin(toJSON);

const YogaLog = mongoose.model('yogaLogs', yogaLogSchema);
export default YogaLog;