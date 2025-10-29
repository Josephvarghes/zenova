import { Router } from 'express';
import catchAsync from '~/utils/catchAsync';
import validate from '~/middlewares/validate';
import authenticate from '~/middlewares/authenticate';
import workoutValidation from '~/validations/workoutValidation';
import workoutController from '~/controllers/workoutController';

const router = Router();

router.get('/exercises', authenticate(), validate(workoutValidation.getExerciseLibrary), catchAsync(workoutController.getExerciseLibrary));
router.post('/exercises', authenticate(), validate(workoutValidation.createExercise), catchAsync(workoutController.createExercise));
router.post('/plan', authenticate(), validate(workoutValidation.createWorkoutPlan), catchAsync(workoutController.createWorkoutPlan));
router.post('/log', authenticate(), validate(workoutValidation.logWorkout), catchAsync(workoutController.logWorkout));
router.get('/progress', authenticate(), validate(workoutValidation.getWorkoutProgress), catchAsync(workoutController.getWorkoutProgress));


export default router;