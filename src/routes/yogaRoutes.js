// src/routes/yogaRoutes.js
import { Router } from 'express';
import catchAsync from '~/utils/catchAsync';
import validate from '~/middlewares/validate';
import authenticate from '~/middlewares/authenticate';
import yogaValidation from '~/validations/yogaValidation';
import yogaController from '~/controllers/yogaController';

const router = Router();

router.post('/log', authenticate(), validate(yogaValidation.logYoga), catchAsync(yogaController.logYoga));
router.get('/progress', authenticate(), validate(yogaValidation.getYogaProgress), catchAsync(yogaController.getYogaProgress));

export default router;