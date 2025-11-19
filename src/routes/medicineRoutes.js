
import { Router } from 'express';
import catchAsync from '~/utils/catchAsync';
import validate from '~/middlewares/validate';
import authenticate from '~/middlewares/authenticate';
import medicineValidation from '~/validations/medicineValidation';
import medicineController from '~/controllers/medicineController';

const router = Router();

router.post('/add', authenticate(), validate(medicineValidation.addMedicine), catchAsync(medicineController.addMedicine));
router.post('/log', authenticate(), validate(medicineValidation.logMedicineIntake), catchAsync(medicineController.logMedicineIntake));
router.get('/history', authenticate(), validate(medicineValidation.getMedicineHistory), catchAsync(medicineController.getMedicineHistory));
router.get('/list', authenticate(), validate(medicineValidation.getMedicineList), catchAsync(medicineController.getMedicineList));

export default router;