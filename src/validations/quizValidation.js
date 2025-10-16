// src/validations/quizValidation.js
import Joi from 'joi';

const createQuiz = {
  body: Joi.object().keys({
    title: Joi.string().required(),
    description: Joi.string().allow('', null),
    questions: Joi.array().items(
      Joi.object({
        questionText: Joi.string().required(),
        options: Joi.array().items(Joi.string()).min(2).required(),
        correctAnswer: Joi.string().required()
      })
    ).min(1).required(),
  }),
};

const updateQuiz = {
  body: Joi.object().keys({
    title: Joi.string(),
    description: Joi.string().allow('', null),
    questions: Joi.array().items(
      Joi.object({
        questionText: Joi.string(),
        options: Joi.array().items(Joi.string()).min(2),
        correctAnswer: Joi.string(),
      })
    ),
  }),
};

export default {
  createQuiz,
  updateQuiz,
};
