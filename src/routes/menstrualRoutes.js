// src/routes/menstrualRoutes.js
import { Router } from 'express';
import catchAsync from '~/utils/catchAsync';
import validate from '~/middlewares/validate';
import authenticate from '~/middlewares/authenticate';
import menstrualValidation from '~/validations/menstrualValidation';
import menstrualController from '~/controllers/menstrualController';

const router = Router();

router.post('/log', authenticate(), validate(menstrualValidation.logPeriod), catchAsync(menstrualController.logPeriod));
router.get('/summary', authenticate(), validate(menstrualValidation.getCycleSummary), catchAsync(menstrualController.getCycleSummary));

export default router;