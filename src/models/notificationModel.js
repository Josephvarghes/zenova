// src/models/notificationModel.js
import mongoose from 'mongoose';
import toJSON from './plugins/toJSONPlugin';

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['Hydration', 'Meditation', 'Steps', 'Meal', 'Sleep', 'Mood', 'Menstrual', 'Screen Time'],
    required: true,
  },
  scheduledAt: {
    type: Date,
    required: true,
  },
  sentAt: {
    type: Date,
    default: null,
  },
  status: {
    type: String,
    enum: ['scheduled', 'sent', 'read', 'snoozed', 'dismissed'],
    default: 'scheduled',
  },
  action: {
    type: String,
    enum: ['track_now', 'remind_later', 'view_detail'],
    default: 'view_detail',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

notificationSchema.index({ userId: 1, scheduledAt: -1 });
notificationSchema.plugin(toJSON);

const Notification = mongoose.model('notifications', notificationSchema);
export default Notification;