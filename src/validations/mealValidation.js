// src/validations/mealValidation.js
import Joi from 'joi';

export const generateMealPlan = {
  body: Joi.object().keys({
    date: Joi.date().optional(),
  }),
};

export const logMeal = {
  body: Joi.object().keys({
    food: Joi.string().trim().min(1).max(200).required(),
    calories: Joi.number().min(0).max(10000).required(),
    protein: Joi.number().min(0).max(1000).required(),
    carbs: Joi.number().min(0).max(1000).required(),
    fats: Joi.number().min(0).max(1000).required(),
    mealTime: Joi.string().valid('breakfast', 'lunch', 'dinner', 'snack').required(),
  }),
};

export const generateGroceryList = {
  body: Joi.object().keys({
    planId: Joi.string().hex().length(24).optional(), // if not provided, use today's plan
  }),
}; 

export const getMealLogs = {
  query: Joi.object().keys({
    startDate: Joi.date().optional(),
    endDate: Joi.date().optional(),
  }),
};

export default {
  generateMealPlan,
  logMeal,
  generateGroceryList,
  getMealLogs
};