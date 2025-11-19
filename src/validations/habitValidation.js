// src/validations/habitValidation.js
import Joi from 'joi';

export const setHabitRoutine = {
  body: Joi.object().keys({
    habits: Joi.array().items(
      Joi.object().keys({
        name: Joi.string().trim().min(1).max(100).required(),
      })
    ).min(1).required(),
  }),
};

export const logHabit = {
  body: Joi.object().keys({
    habitName: Joi.string().trim().min(1).max(100).required(),
    date: Joi.date().required(),
    status: Joi.string().valid('Completed', 'Skipped').required(),
    isOneTime: Joi.boolean().optional(),
  }),
};

export const getHabitProgress = {
  query: Joi.object().keys({
    period: Joi.string().valid('today', 'weekly', 'monthly').optional(),
  }),
};

export default {
  setHabitRoutine,
  logHabit,
  getHabitProgress,
};