import mongoose from 'mongoose';
import toJSON from './plugins/toJSONPlugin';

const sleepGoalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true,
  },
  recommendedDurationMin: {
    type: Number,
    required: true,
    min: 0,
  },
  regularSleptAt: {
    type: Date,
    required: true,
  },
  regularWokeUpAt: {
    type: Date,
    required: true,
  },
}, {
  timestamps: true,
});

sleepGoalSchema.index({ userId: 1 });
sleepGoalSchema.plugin(toJSON);

const SleepGoal = mongoose.model('sleepGoals', sleepGoalSchema);
export default SleepGoal;