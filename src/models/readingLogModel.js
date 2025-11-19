// src/models/readingLogModel.js
import mongoose from 'mongoose';
import toJSON from './plugins/toJSONPlugin';

const readingLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  minutes: {
    type: Number,
    required: true,
    min: 1,
  },
  loggedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

readingLogSchema.index({ userId: 1, date: 1 }, { unique: true });
readingLogSchema.plugin(toJSON);
const ReadingLog = mongoose.model('readingLogs', readingLogSchema);
export default ReadingLog;