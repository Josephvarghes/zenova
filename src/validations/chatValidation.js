// src/validations/chatValidation.js
import Joi from 'joi';

export const sendMessage = {
  body: Joi.object().keys({
    message: Joi.string().trim().min(1).required(),
    bot: Joi.string().valid('calia', 'noura', 'aeron').optional(),
  }),
};

export const getChatHistory = {
  query: Joi.object().keys({
    // No query params needed
  }),
};

export const clearChatHistory = {
  query: Joi.object().keys({
    // No query params needed
  }),
};

export default {
  sendMessage,
  getChatHistory,
  clearChatHistory,
};