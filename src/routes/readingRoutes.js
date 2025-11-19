// src/routes/readingRoutes.js
import { Router } from 'express';
import catchAsync from '~/utils/catchAsync';
import validate from '~/middlewares/validate';
import authenticate from '~/middlewares/authenticate';
import readingValidation from '~/validations/readingValidation';
import readingController from '~/controllers/readingController';

const router = Router();

router.post('/goal', authenticate(), validate(readingValidation.setReadingGoal), catchAsync(readingController.setReadingGoal));
router.get('/goal', authenticate(), catchAsync(readingController.getReadingGoal));
router.post('/log', authenticate(), validate(readingValidation.logReadingTime), catchAsync(readingController.logReadingTime));
router.get('/summary', authenticate(), validate(readingValidation.getReadingSummary), catchAsync(readingController.getReadingSummary));
router.post('/reminder', authenticate(), validate(readingValidation.setReadingReminder), catchAsync(readingController.setReadingReminder));
router.get('/reminder', authenticate(), catchAsync(readingController.getReadingReminder));

export default router;