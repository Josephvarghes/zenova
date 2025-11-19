// src/routes/aiRoutes.js
import { Router } from 'express';
import catchAsync from '~/utils/catchAsync';
import validate from '~/middlewares/validate';
import authenticate from '~/middlewares/authenticate';
import aiController from '~/controllers/aiController';

const router = Router();

router.get('/recommendations', authenticate(), catchAsync(aiController.getRecommendations));

export default router;