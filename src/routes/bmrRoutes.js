import { Router } from 'express';
import catchAsync from '~/utils/catchAsync';
import validate from '~/middlewares/validate';
import authenticate from '~/middlewares/authenticate';
import bmrValidation from '~/validations/bmrValidation';
import bmrController from '~/controllers/bmrController';

const router = Router();

router.post('/calculate', authenticate(), validate(bmrValidation.calculateBMR), catchAsync(bmrController.calculateAndLogBMR));
router.get('/progress', authenticate(), validate(bmrValidation.getBMRProgress), catchAsync(bmrController.getBMRProgress));

export default router;