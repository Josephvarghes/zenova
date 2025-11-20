// src/validations/measurementValidation.js
import Joi from 'joi';

export const setGoals = {
  body: Joi.object().keys({
    neck: Joi.number().min(0).optional(),
    chest: Joi.number().min(0).optional(),
    waist: Joi.number().min(0).optional(),
    hips: Joi.number().min(0).optional(),
    thigh: Joi.number().min(0).optional(),
    arm: Joi.number().min(0).optional(),
  }),
};

export const logMeasurements = {
  body: Joi.object().keys({
    neck: Joi.number().min(0).optional(),
    chest: Joi.number().min(0).optional(),
    waist: Joi.number().min(0).optional(),
    hips: Joi.number().min(0).optional(),
    thigh: Joi.number().min(0).optional(),
    arm: Joi.number().min(0).optional(),
  }),
};

export const getSummary = {
  query: Joi.object().keys({
    period: Joi.string().valid('today', 'weekly', 'monthly').optional(),
  }),
};

export const setReminder = {
  body: Joi.object().keys({
    frequency: Joi.string().valid('daily', 'weekly').optional(),
    day: Joi.string().optional(),
    time: Joi.string().optional(),
    enabled: Joi.boolean().optional(),
  }),
};

export default {
  setGoals,
  logMeasurements,
  getSummary,
  setReminder,
};