import mongoose from 'mongoose';
import toJSON from './plugins/toJSONPlugin';

const sleepLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true,
  },
  durationMin: {
    type: Number,
    required: true,
    min: 0,
  },
  quality: {
    type: String,
    enum: ['Excellent', 'Good', 'Fair', 'Poor'],
    default: 'Good',
  },
  sleptAt: {
    type: Date,
    required: true,
  },
  wokeUpAt: {
    type: Date,
    required: true,
  },
  loggedAt: {
    type: Date,
    default: Date.now,
  },
  source: {
    type: String,
    enum: ['manual', 'google_fit', 'apple_health'],
    default: 'manual',
  },
}, {
  timestamps: true,
});

sleepLogSchema.index({ userId: 1, loggedAt: -1 });
sleepLogSchema.plugin(toJSON);

const SleepLog = mongoose.model('sleepLogs', sleepLogSchema);
export default SleepLog;