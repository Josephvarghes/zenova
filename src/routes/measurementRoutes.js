// src/routes/measurementRoutes.js
import { Router } from 'express';
import catchAsync from '~/utils/catchAsync';
import validate from '~/middlewares/validate';
import authenticate from '~/middlewares/authenticate';
import measurementValidation from '~/validations/measurementValidation';
import measurementController from '~/controllers/measurementController';

const router = Router();

router.post('/goals', authenticate(), validate(measurementValidation.setGoals), catchAsync(measurementController.setGoals));
router.get('/goals', authenticate(), catchAsync(measurementController.getGoals));
router.post('/log', authenticate(), validate(measurementValidation.logMeasurements), catchAsync(measurementController.logMeasurements));
router.get('/summary', authenticate(), validate(measurementValidation.getSummary), catchAsync(measurementController.getSummary));
router.post('/reminder', authenticate(), validate(measurementValidation.setReminder), catchAsync(measurementController.setReminder));
router.get('/reminder', authenticate(), catchAsync(measurementController.getReminder));

export default router;