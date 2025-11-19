// src/validations/medicineValidation.js
import Joi from 'joi';

export const addMedicine = {
  body: Joi.object().keys({
    name: Joi.string().trim().min(1).max(100).required(),
    startDate: Joi.date().required(),
    repeat: Joi.string().valid('Daily', 'Weekly', 'Monthly').optional(),
    times: Joi.array().items(Joi.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9] (AM|PM)$/)).min(1).required(),
    reminderEnabled: Joi.boolean().optional(),
  }),
};

export const logMedicineIntake = {
  body: Joi.object().keys({
    medicineId: Joi.string().hex().length(24).required(),
    date: Joi.date().required(),
    time: Joi.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9] (AM|PM)$/).required(),
    status: Joi.string().valid('Taken', 'Missed').required(),
  }),
};

export const getMedicineHistory = {
  query: Joi.object().keys({
    period: Joi.string().valid('today', 'weekly', 'monthly').optional(),
  }),
}; 

export const getMedicineList = {
  query: Joi.object().keys({
    // No query params needed
  }),
};

export default {
  addMedicine,
  logMedicineIntake,
  getMedicineHistory, 
  getMedicineList
};