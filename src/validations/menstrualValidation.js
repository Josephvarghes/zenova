// src/validations/menstrualValidation.js
import Joi from 'joi';

export const logPeriod = {
  body: Joi.object().keys({
    startDate: Joi.date().required(),
    flow: Joi.string().valid('Light', 'Medium', 'Heavy').optional(),
  }),
};

export const getCycleSummary = {
  query: Joi.object().keys({
    // No query params needed
  }),
};

export default {
  logPeriod,
  getCycleSummary,
};