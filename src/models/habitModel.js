// src/models/habitModel.js
import mongoose from 'mongoose';
import toJSON from './plugins/toJSONPlugin';

const habitSchema = new mongoose.Schema({
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

habitSchema.plugin(toJSON);
const Habit = mongoose.model('habits', habitSchema);
export default Habit;