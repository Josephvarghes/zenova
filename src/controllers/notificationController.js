// src/controllers/notificationController.js
import Notification from '~/models/notificationModel';
import User from '~/models/userModel';
import httpStatus from 'http-status';
import APIError from '~/utils/apiError'; 
import fcmService from '~/services/fcmService';

export const scheduleNotification = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, body, category, scheduledAt } = req.body;

    if (!title || !body || !category || !scheduledAt) {
      return res.status(400).json({
        success: false,
        data:{},
        message: 'Title, body, category, and scheduledAt are required',
      });
    }

    const notification = new Notification({
      userId,
      title,
      body,
      category,
      scheduledAt: new Date(scheduledAt),
    });

    const savedNotification = await notification.save();

    return res.json({
      success: true,
       savedNotification,
      message: 'Notification scheduled successfully',
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
       data:{},
      message: err.message || 'Failed to schedule notification',
    });
  }
};


export const sendPushNotification = async (req, res) => {
  try {
    const userId = req.user.id;
    const { notificationId } = req.body;

    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({
        success: false,
         data:{},
        message: 'Notification not found',
      });
    }

    if (notification.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
         data:{},
        message: 'Access denied',
      });
    }

    // ✅ SIMULATE SUCCESS (no FCM)
    notification.sentAt = new Date();
    notification.status = 'sent';
    await notification.save();

    return res.json({
      success: true,
       data:{
        ...notification.toObject(),
        fcmSent: false, // ← Clearly mark as simulated
      },
      message: 'Notification marked as sent (FCM disabled)',
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
       data:{},
      message: err.message || 'Failed to send notification',
    });
  }
};

// export const sendPushNotification = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { notificationId } = req.body;

//     const notification = await Notification.findById(notificationId);
//     if (!notification) {
//       return res.status(404).json({
//         success: false,
//         data:{},
//         message: 'Notification not found',
//       });
//     }

//     if (notification.userId.toString() !== userId) {
//       return res.status(403).json({
//         success: false,
//         data:{},
//         message: 'Access denied',
//       });
//     }

//     // Simulate FCM push (in production, use fcm-node)
//     // In real app, send to device token
//     console.log(`[FCM] Sending push to user ${userId}:`, {
//       title: notification.title,
//       body: notification.body,
//       data: { notificationId: notification._id },
//     });

//     // Mark as sent
//     notification.sentAt = new Date();
//     notification.status = 'sent';
//     await notification.save();

//     return res.json({
//       success: true,
//        notification,
//       message: 'Push notification sent successfully',
//     });
//   } catch (err) {
//     return res.status(400).json({
//       success: false,
//       data:{},
//       message: err.message || 'Failed to send push notification',
//     });
//   }
// };

export const getNotificationHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { period } = req.query; // 'today', 'yesterday', 'all'

    let start, end;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (period === 'today') {
      start = today;
      end = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    } else if (period === 'yesterday') {
      start = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      end = today;
    } else {
      // Default to last 7 days
      start = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      end = today;
    }

    const notifications = await Notification.find({
      userId,
      scheduledAt: { $gte: start, $lte: end },
    }).sort({ scheduledAt: -1 });

    return res.json({
      success: true,
      data:{
        notifications,
        period: period || 'last 7 days',
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0],
      },
      message: 'Notification history fetched successfully',
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      data:{},
      message: err.message || 'Failed to fetch notification history',
    });
  }
};

export const updateNotificationAction = async (req, res) => {
  try {
    const userId = req.user.id;
    const { notificationId, action } = req.body;

    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({
        success: false,
        data:{},
        message: 'Notification not found',
      });
    }

    if (notification.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        data:{},
        message: 'Access denied',
      });
    }

    notification.action = action;
    notification.status = 'read'; // or 'snoozed'/'dismissed'
    await notification.save();

    return res.json({
      success: true,
       notification,
      message: 'Notification action updated successfully',
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      data:{},
      message: err.message || 'Failed to update notification action',
    });
  }
}; 

export const getScheduledNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);

    const notifications = await Notification.find({
      userId,
      scheduledAt: { $gte: start, $lte: end },
      status: 'scheduled',
    }).sort({ scheduledAt: 1 });

    return res.json({
      success: true,
       data:{notifications},
      message: 'Scheduled notifications fetched successfully',
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
       data:{},
      message: err.message || 'Failed to fetch scheduled notifications',
    });
  }
};

export default {
  scheduleNotification,
  sendPushNotification,
  getNotificationHistory,
  updateNotificationAction,
  getScheduledNotifications,
};