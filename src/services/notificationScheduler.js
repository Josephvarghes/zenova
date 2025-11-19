// src/jobs/notificationScheduler.js
import cron from 'node-cron';
import Notification from '~/models/notificationModel';
import User from '~/models/userModel';
import fcmService from '~/services/fcmService';

/**
 * Auto-send scheduled notifications
 */
const sendScheduledNotifications = async () => {
  try {
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

    // Find notifications scheduled in the last 5 minutes (to handle delays)
    const notifications = await Notification.find({
      scheduledAt: { $gte: fiveMinutesAgo, $lte: now },
      status: 'scheduled',
    }).populate('userId', 'deviceToken');

    if (notifications.length === 0) return;

    console.log(`[SCHEDULER] Processing ${notifications.length} notifications...`);

    for (const notif of notifications) {
      try {
        // Send FCM push
        if (notif.userId?.deviceToken) {
          const sent = await fcmService.sendPushNotification(
            notif.userId.deviceToken,
            notif.title,
            notif.body,
            { notificationId: notif._id.toString() }
          );
          if (sent) {
            notif.status = 'sent';
            await notif.save();
            console.log(`✅ Sent notification: ${notif._id}`);
          } else {
            console.warn(`⚠️ FCM failed for: ${notif._id}`);
          }
        } else {
          // Mark as sent (no device token)
          notif.status = 'sent';
          await notif.save();
        }
      } catch (err) {
        console.error(`❌ Failed to send notification ${notif._id}:`, err.message);
      }
    }
  } catch (err) {
    console.error('❌ Scheduler error:', err.message);
  }
};

// Run every minute
const startNotificationScheduler = () => {
  console.log('🚀 Starting Notification Scheduler...');
  cron.schedule('* * * * *', sendScheduledNotifications); // Every minute
};

export default startNotificationScheduler;