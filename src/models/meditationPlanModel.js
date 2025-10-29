// src/models/meditationPlanModel.js
import mongoose from 'mongoose';
import toJSON from './plugins/toJSONPlugin';

const meditationPlanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true,
  },
  date: {
    type: Date,
    required: true,
    index: true,
  },
  recommendedSession: {
    name: { type: String, required: true },
    durationMin: { type: Number, required: true },
    type: { type: String, required: true },
    rewards: {
      novaCoins: { type: Number, default: 0 },
      other: { type: Number, default: 0 },
    },
    videoUrl: { type: String },
  },
}, {
  timestamps: true,
});

meditationPlanSchema.index({ userId: 1, date: 1 }, { unique: true });
meditationPlanSchema.plugin(toJSON);

const MeditationPlan = mongoose.model('meditationPlans', meditationPlanSchema);
export default MeditationPlan;