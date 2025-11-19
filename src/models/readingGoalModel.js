// src/models/readingGoalModel.js
import mongoose from 'mongoose';
import toJSON from './plugins/toJSONPlugin';

const readingGoalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true,
    unique: true,
  },
  dailyTargetMinutes: {
    type: Number,
    required: true,
    min: 1,
  },
}, {
  timestamps: true,
});

readingGoalSchema.plugin(toJSON);
const ReadingGoal = mongoose.model('readingGoals', readingGoalSchema);
export default ReadingGoal;