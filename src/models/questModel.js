import mongoose from 'mongoose';
import toJSON from './plugins/toJSONPlugin';

const questSchema = new mongoose.Schema({
  title: { type: String, required: true },          // "7-Day Streak"
  description: { type: String, required: true },    // "Log activity for 7 days straight"
  condition: {                                      // JSON rule
    type: String,                                   // e.g., "streakDays >= 7"
    required: true
  },
  rewardCoins: { type: Number, default: 0 },
  badge: {                                          // Optional badge
    name: String,
    icon: String,
  },
  isActive: { type: Boolean, default: true },
}, {
  timestamps: true,
});

export default mongoose.model('quests', questSchema);