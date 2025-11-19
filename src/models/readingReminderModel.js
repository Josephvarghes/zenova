// src/models/readingReminderModel.js
import mongoose from 'mongoose';
import toJSON from './plugins/toJSONPlugin';

const readingReminderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true,
    unique: true,
  },
  time: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9] (AM|PM)$/,
  },
  enabled: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

readingReminderSchema.plugin(toJSON);
const ReadingReminder = mongoose.model('readingReminders', readingReminderSchema);
export default ReadingReminder;