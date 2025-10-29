import { Router } from 'express';
import authRoute from './authRoute';
import onboardingRoutes from './onboardingRoutes';
import otpRoutes from './otpRoutes'; 
import mealRoute from './mealRoutes';
import bmrRoutes from './bmrRoutes';
import stepRoutes from './stepRoutes'; 
import workoutRoutes from './workoutRoutes';
import uploadRoutes from './uploadRoutes';
import meditationRoutes from './meditationRoutes';
import yogaRoutes from './yogaRoutes';

const router = Router();

router.use('/auth', authRoute);
router.use('/onboard', onboardingRoutes);
router.use('/otp', otpRoutes);  
router.use('/meal', mealRoute); 
router.use('/bmr', bmrRoutes);  
router.use('/steps', stepRoutes); 
router.use('/workouts', workoutRoutes);
router.use('/upload', uploadRoutes); 
router.use('/meditation', meditationRoutes);
router.use('/yoga', yogaRoutes); 

export default router;
