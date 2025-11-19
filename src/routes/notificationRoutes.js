// src/routes/notificationRoutes.js
import { Router } from 'express';
import catchAsync from '~/utils/catchAsync';
import validate from '~/middlewares/validate';
import authenticate from '~/middlewares/authenticate';
import notificationValidation from '~/validations/notificationValidation';
import notificationController from '~/controllers/notificationController';

const router = Router();

router.post('/schedule', authenticate(), validate(notificationValidation.scheduleNotification), catchAsync(notificationController.scheduleNotification));
router.post('/send', authenticate(), validate(notificationValidation.sendPushNotification), catchAsync(notificationController.sendPushNotification));
router.get('/history', authenticate(), validate(notificationValidation.getNotificationHistory), catchAsync(notificationController.getNotificationHistory));
router.post('/action', authenticate(), validate(notificationValidation.updateNotificationAction), catchAsync(notificationController.updateNotificationAction));

router.get('/scheduled', authenticate(), validate(notificationValidation.getScheduledNotifications), catchAsync(notificationController.getScheduledNotifications));

export default router;