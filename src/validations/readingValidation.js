// src/validations/readingValidation.js
import Joi from 'joi';

export const setReadingGoal = {
  body: Joi.object().keys({
    hours: Joi.number().integer().min(0).required(),
    minutes: Joi.number().integer().min(0).max(59).required(),
  }),
};

export const logReadingTime = {
  body: Joi.object().keys({
    hours: Joi.number().integer().min(0).required(),
    minutes: Joi.number().integer().min(0).max(59).required(),
  }),
};

export const getReadingSummary = {
  query: Joi.object().keys({
    period: Joi.string().valid('today', 'weekly', 'monthly').optional(),
  }),
};

export const setReadingReminder = {
  body: Joi.object().keys({
    time: Joi.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9] (AM|PM)$/).required(),
    enabled: Joi.boolean().optional(),
  }),
};

export default {
  setReadingGoal,
  logReadingTime,
  getReadingSummary,
  setReadingReminder,
};