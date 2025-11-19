import Joi from 'joi';

export const logMood = {
  body: Joi.object().keys({
    mood: Joi.string().valid('Very Unpleasant', 'Unpleasant', 'Neutral', 'Pleasant', 'Very Pleasant', 'Slightly Pleasant').required(),
  }),
};

export const getMoodSummary = {
  query: Joi.object().keys({
    period: Joi.string().valid('today', 'weekly', 'monthly').optional(),
  }),
};

export default {
  logMood,
  getMoodSummary,
};