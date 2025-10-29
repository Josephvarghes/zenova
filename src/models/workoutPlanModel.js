// src/models/workoutPlanModel.js
import mongoose from 'mongoose';
import toJSON from './plugins/toJSONPlugin';

const workoutExerciseSchema = new mongoose.Schema({
  exerciseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'exercises',
    required: true,
  },
  sets: {
    type: Number,
    default: 3,
  },
  reps: {
    type: Number,
    default: 10,
  },
  weightKg: {
    type: Number,
    default: 0,
  },
  durationMin: {
    type: Number,
    default: 2,
  },
}, { _id: false });

const workoutPlanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ['AI Recommended', 'Custom'],
    required: true,
  },
  exercises: [workoutExerciseSchema],
  totalDurationMin: {
    type: Number,
    default: 0,
  },
  totalCaloriesBurned: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

workoutPlanSchema.index({ userId: 1, createdAt: -1 });
workoutPlanSchema.plugin(toJSON);

const WorkoutPlan = mongoose.model('workoutPlans', workoutPlanSchema);
export default WorkoutPlan;