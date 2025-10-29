// src/validations/meditationValidation.js
import Joi from 'joi';

export const logMeditation = {
  body: Joi.object().keys({
    durationMin: Joi.number().min(1).max(1440).required(),
    type: Joi.string().valid('Zen Burn', 'Zen Hyper', 'Manual').optional(),
    mood: Joi.string().valid('Tired', 'Neutral', 'Calm', 'Energized').optional(),
  }),
};

export const getMeditationProgress = {
  query: Joi.object().keys({
    period: Joi.string().valid('today', 'weekly', 'monthly').optional(),
  }),
};

export const generateMeditationPlan = {
  body: Joi.object().keys({
    date: Joi.date().optional(),
  }),
};

export default {
  logMeditation,
  getMeditationProgress,
  generateMeditationPlan
};