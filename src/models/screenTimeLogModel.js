import mongoose from 'mongoose';
import toJSON from './plugins/toJSONPlugin';

const screenTimeLogSchema = new mongoose.Schema({
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
  category: {
    type: String,
    enum: ['Social Media', 'Work Apps', 'Entertainment'],
    required: true,
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

screenTimeLogSchema.index({ userId: 1, loggedAt: -1 });
screenTimeLogSchema.plugin(toJSON);

const ScreenTimeLog = mongoose.model('screenTimeLogs', screenTimeLogSchema);
export default ScreenTimeLog;