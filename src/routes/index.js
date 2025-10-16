import { Router } from 'express';
import authRoute from './authRoute';
import onboardingRoutes from './onboardingRoutes';
import otpRoutes from './otpRoutes';



const router = Router();

router.use('/auth', authRoute);
router.use('/onboard', onboardingRoutes);
router.use('/otp', otpRoutes);  



export default router;
