import mongoose from 'mongoose';
import toJSON from './plugins/toJSONPlugin';

const measurementReminderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true,
    unique: true,
  },
  frequency: {
    type: String,
    enum: ['daily', 'weekly'],
    default: 'weekly',
  },
  day: {
    type: String, // e.g., "Sunday"
  },
  time: {
    type: String, // e.g., "09:00 AM"
  },
  enabled: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

measurementReminderSchema.plugin(toJSON);
const MeasurementReminder = mongoose.model('measurementReminders', measurementReminderSchema);
export default MeasurementReminder;