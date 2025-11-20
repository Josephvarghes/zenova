import mongoose from 'mongoose';
import toJSON from './plugins/toJSONPlugin';

const bodyGoalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true,
    unique: true,
  },
  neck: { type: Number, min: 0 },
  chest: { type: Number, min: 0 },
  waist: { type: Number, min: 0 },
  hips: { type: Number, min: 0 },
  thigh: { type: Number, min: 0 },
  arm: { type: Number, min: 0 },
}, {
  timestamps: true,
});

bodyGoalSchema.plugin(toJSON);
const BodyGoal = mongoose.model('bodyGoals', bodyGoalSchema);
export default BodyGoal;