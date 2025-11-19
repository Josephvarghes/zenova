// src/routes/habitRoutes.js
import { Router } from 'express';
import catchAsync from '~/utils/catchAsync';
import validate from '~/middlewares/validate';
import authenticate from '~/middlewares/authenticate';
import habitValidation from '~/validations/habitValidation';
import habitController from '~/controllers/habitController';

const router = Router();

router.post('/routine', authenticate(), validate(habitValidation.setHabitRoutine), catchAsync(habitController.setHabitRoutine));
router.post('/log', authenticate(), validate(habitValidation.logHabit), catchAsync(habitController.logHabit));
router.get('/progress', authenticate(), validate(habitValidation.getHabitProgress), catchAsync(habitController.getHabitProgress));

export default router;