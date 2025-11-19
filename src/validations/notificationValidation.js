// src/validations/notificationValidation.js
import Joi from 'joi';

export const scheduleNotification = {
  body: Joi.object().keys({
    title: Joi.string().trim().min(1).max(100).required(),
    body: Joi.string().trim().min(1).max(200).required(),
    category: Joi.string().valid('Hydration', 'Meditation', 'Steps', 'Meal', 'Sleep', 'Mood', 'Menstrual', 'Screen Time').required(),
    scheduledAt: Joi.date().required(),
  }),
};

export const sendPushNotification = {
  body: Joi.object().keys({
    notificationId: Joi.string().hex().length(24).required(),
  }),
};

export const getNotificationHistory = {
  query: Joi.object().keys({
    period: Joi.string().valid('today', 'yesterday', 'all').optional(),
  }),
};

export const updateNotificationAction = {
  body: Joi.object().keys({
    notificationId: Joi.string().hex().length(24).required(),
    action: Joi.string().valid('track_now', 'remind_later', 'view_detail').required(),
  }),
}; 

export const getScheduledNotifications = {
  query: Joi.object().keys({
    // No params needed
  }),
};

export default {
  scheduleNotification,
  sendPushNotification,
  getNotificationHistory,
  updateNotificationAction,
  getScheduledNotifications,
};