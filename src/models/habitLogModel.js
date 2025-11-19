// src/models/habitLogModel.js
import mongoose from 'mongoose';
import toJSON from './plugins/toJSONPlugin';

const habitLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  habitName: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Completed', 'Skipped'],
    required: true,
  },
  isOneTime: {
    type: Boolean,
    default: false,
  },
  loggedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

habitLogSchema.plugin(toJSON);
const HabitLog = mongoose.model('habitLogs', habitLogSchema);
export default HabitLog;