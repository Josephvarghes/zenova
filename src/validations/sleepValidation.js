// src/validations/sleepValidation.js
import Joi from 'joi';

export const setSleepGoal = {
  body: Joi.object().keys({
    recommendedDurationMin: Joi.number().min(0).required(),
    regularSleptAt: Joi.date().required(),
    regularWokeUpAt: Joi.date().required(),
  }),
};

export const logSleep = {
  body: Joi.object().keys({
    durationMin: Joi.number().min(0).required(),
    quality: Joi.string().valid('Excellent', 'Good', 'Fair', 'Poor').optional(),
    sleptAt: Joi.date().required(),
    wokeUpAt: Joi.date().required(),
    source: Joi.string().valid('manual', 'google_fit', 'apple_health').optional(),
  }),
};

export const getSleepProgress = {
  query: Joi.object().keys({
    period: Joi.string().valid('today', 'weekly', 'monthly').optional(),
  }),
};

export default {
  setSleepGoal,
  logSleep,
  getSleepProgress,
};