import mongoose from 'mongoose';
import toJSON from './plugins/toJSONPlugin';

const medicineSchema = new mongoose.Schema({
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
  startDate: {
    type: Date,
    required: true,
  },
  repeat: {
    type: String,
    enum: ['Daily', 'Weekly', 'Monthly'],
    default: 'Daily',
  },
  times: [{
    type: String, // e.g., "08:00 AM"
  }],
  reminderEnabled: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

medicineSchema.index({ userId: 1, startDate: -1 });
medicineSchema.plugin(toJSON);

const Medicine = mongoose.model('medicines', medicineSchema);
export default Medicine;