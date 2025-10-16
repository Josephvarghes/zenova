// routes/onboardingRoutes.js
import { Router } from 'express';
import catchAsync from '~/utils/catchAsync';
import validate from '~/middlewares/validate';
import authenticate from '~/middlewares/authenticate';
import onboardingValidation from '~/validations/onboardingValidation';
import onboardingController from '~/controllers/onboardingController';

const router = Router();

router.post('/profile', authenticate(), validate(onboardingValidation.saveProfile), catchAsync(onboardingController.saveProfile));

export default router;