// src/validations/stepValidation.js
import Joi from 'joi';

export const setStepGoal = {
  body: Joi.object().keys({
    stepGoal: Joi.number().min(0).required(),
  }),
};

export const logSteps = {
  body: Joi.object().keys({
    steps: Joi.number().min(0).required(),
    source: Joi.string().valid('manual', 'google_fit', 'apple_health').optional(),
  }),
};

export const getStepProgress = {
  query: Joi.object().keys({
    period: Joi.string().valid('today', 'weekly', 'monthly').optional(),
  }),
};

export default {
  setStepGoal,
  logSteps,
  getStepProgress,
};