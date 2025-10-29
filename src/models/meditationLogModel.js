// src/models/meditationLogModel.js
import mongoose from 'mongoose';
import toJSON from './plugins/toJSONPlugin';

const meditationLogSchema = new mongoose.Schema({
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

meditationLogSchema.index({ userId: 1, loggedAt: -1 });
meditationLogSchema.plugin(toJSON);

const MeditationLog = mongoose.model('meditationLogs', meditationLogSchema);
export default MeditationLog;