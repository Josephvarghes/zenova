import mongoose from 'mongoose';
import toJSON from './plugins/toJSONPlugin';

const bodyLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  neck: { type: Number, min: 0 },
  chest: { type: Number, min: 0 },
  waist: { type: Number, min: 0 },
  hips: { type: Number, min: 0 },
  thigh: { type: Number, min: 0 },
  arm: { type: Number, min: 0 },
  loggedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

bodyLogSchema.index({ userId: 1, date: 1 }, { unique: true });
bodyLogSchema.plugin(toJSON);
const BodyLog = mongoose.model('bodyLogs', bodyLogSchema);
export default BodyLog;