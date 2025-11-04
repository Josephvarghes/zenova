// src/routes/sleepRoutes.js
import { Router } from 'express';
import catchAsync from '~/utils/catchAsync';
import validate from '~/middlewares/validate';
import authenticate from '~/middlewares/authenticate';
import sleepValidation from '~/validations/sleepValidation';
import sleepController from '~/controllers/sleepController';

const router = Router();

router.post('/goal', authenticate(), validate(sleepValidation.setSleepGoal), catchAsync(sleepController.setSleepGoal));
router.post('/log', authenticate(), validate(sleepValidation.logSleep), catchAsync(sleepController.logSleep));
router.get('/progress', authenticate(), validate(sleepValidation.getSleepProgress), catchAsync(sleepController.getSleepProgress));

export default router;