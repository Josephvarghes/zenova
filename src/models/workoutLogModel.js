import mongoose from 'mongoose';
import toJSON from './plugins/toJSONPlugin';

const workoutLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true,
  },
  workoutPlanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'workoutPlans',
    required: true,
  },
  exercisesCompleted: [
    {
      exerciseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'exercises',
        required: true,
      },
      sets: {
        type: Number,
        required: true,
      },
      reps: {
        type: Number,
        required: true,
      },
      weightKg: {
        type: Number,
        default: 0,
      },
      durationMin: {
        type: Number,
        required: true,
      },
      caloriesBurned: {
        type: Number,
        required: true,
      },
    }
  ],
  totalCaloriesBurned: {
    type: Number,
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

workoutLogSchema.index({ userId: 1, loggedAt: -1 });
workoutLogSchema.plugin(toJSON);

const WorkoutLog = mongoose.model('workoutLogs', workoutLogSchema);
export default WorkoutLog;