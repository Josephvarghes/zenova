import mongoose from 'mongoose';
import toJSON from './plugins/toJSONPlugin';

const stepLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true,
  },
  steps: {
    type: Number,
    required: true,
    min: 0,
  },
  distanceKm: {
    type: Number,
    required: true,
    min: 0,
  },
  caloriesBurned: {
    type: Number,
    required: true,
    min: 0,
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

stepLogSchema.index({ userId: 1, loggedAt: -1 });
stepLogSchema.plugin(toJSON);

const StepLog = mongoose.model('stepLogs', stepLogSchema);
export default StepLog;