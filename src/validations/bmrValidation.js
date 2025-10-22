import Joi from 'joi';

export const calculateBMR = {
  body: Joi.object().keys({
    weight: Joi.number().min(0).max(300).optional(),
    height: Joi.number().min(50).max(300).optional(),
  }),
};

export const getBMRProgress = {
  query: Joi.object().keys({
    period: Joi.string().valid('today', 'weekly', 'monthly').optional(),
  }),
};

export default {
  calculateBMR,
  getBMRProgress,
};