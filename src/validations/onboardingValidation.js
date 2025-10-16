// validations/onboardingValidation.js
import Joi from 'joi';

export const saveProfile = {
  body: Joi.object().keys({
    name: Joi.string().trim().min(2).max(100).required(),
    dob: Joi.date().required(),
    height: Joi.number().min(50).max(300).required(), // cm
    weight: Joi.number().min(20).max(300).required(), // kg
    gender: Joi.string().valid('male', 'female', 'other').required(),
    dietType: Joi.string().valid('non-veg', 'veg', 'vegan').required(),
    lifestyle: Joi.string().valid('very_active', 'active', 'sedentary').required(),
    medicalCondition: Joi.string().optional(),
    location: Joi.object({
      type: Joi.string().valid('Point').default('Point'),
      coordinates: Joi.array().items(Joi.number()).length(2).optional(),
    }).optional(),
  }),
};

export default {
  saveProfile,
};