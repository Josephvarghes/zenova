// src/models/menstrualCycleModel.js
import mongoose from 'mongoose';
import toJSON from './plugins/toJSONPlugin';

const menstrualCycleSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  flow: {
    type: String,
    enum: ['Light', 'Medium', 'Heavy'],
    default: 'Light',
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

menstrualCycleSchema.index({ userId: 1, startDate: -1 });
menstrualCycleSchema.plugin(toJSON);

const MenstrualCycle = mongoose.model('menstrualCycles', menstrualCycleSchema);
export default MenstrualCycle;