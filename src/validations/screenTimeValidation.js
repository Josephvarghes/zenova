import Joi from 'joi';

export const setFocusGoal = {
  body: Joi.object().keys({
    dailyScreenTimeLimitMin: Joi.number().min(0).required(),
    focusModeTargetHours: Joi.number().min(0).required(),
  }),
};

export const logScreenTime = {
  body: Joi.object().keys({
    durationMin: Joi.number().min(0).required(),
    category: Joi.string().valid('Social Media', 'Work Apps', 'Entertainment').required(),
    source: Joi.string().valid('manual', 'auto').optional(),
  }),
};

export const getScreenTimeProgress = {
  query: Joi.object().keys({
    period: Joi.string().valid('today', 'weekly', 'monthly').optional(),
  }),
};

export default {
  setFocusGoal,
  logScreenTime,
  getScreenTimeProgress,
};