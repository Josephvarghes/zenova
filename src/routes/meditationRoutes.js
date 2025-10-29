import { Router } from 'express';
import catchAsync from '~/utils/catchAsync';
import validate from '~/middlewares/validate';
import authenticate from '~/middlewares/authenticate';
import meditationValidation from '~/validations/meditationValidation';
import meditationController from '~/controllers/meditationController';

const router = Router();

router.post('/log', authenticate(), validate(meditationValidation.logMeditation), catchAsync(meditationController.logMeditation));
router.get('/progress', authenticate(), validate(meditationValidation.getMeditationProgress), catchAsync(meditationController.getMeditationProgress));
router.post('/plan', authenticate(), validate(meditationValidation.generateMeditationPlan), catchAsync(meditationController.generateMeditationPlan));

export default router;