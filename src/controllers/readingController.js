// src/controllers/readingController.js
import ReadingGoal from '~/models/readingGoalModel';
import ReadingLog from '~/models/readingLogModel';
import ReadingReminder from '~/models/readingReminderModel';
import User from '~/models/userModel';
import httpStatus from 'http-status';
import APIError from '~/utils/apiError';

export const setReadingGoal = async (req, res) => {
  try {
    const userId = req.user.id;
    const { hours, minutes } = req.body;

    if (hours === undefined || minutes === undefined) {
      return res.status(400).json({
        success: false,
         data:{},
        message: 'Hours and minutes are required',
      });
    }

    const totalMinutes = hours * 60 + minutes;
    if (totalMinutes <= 0) {
      return res.status(400).json({
        success: false,
         data:{},
        message: 'Total reading time must be greater than 0',
      });
    }

    const goal = await ReadingGoal.findOneAndUpdate(
      { userId },
      { dailyTargetMinutes: totalMinutes },
      { new: true, upsert: true }
    );

    return res.json({
      success: true,
       data:{goal},
      message: 'Daily reading goal set successfully',
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      data: {},
      message: err.message || 'Failed to set reading goal',
    });
  }
};

export const logReadingTime = async (req, res) => {
  try {
    const userId = req.user.id;
    const { hours, minutes } = req.body;

    if (hours === undefined || minutes === undefined) {
      return res.status(400).json({
        success: false,
        data: {},
        message: 'Hours and minutes are required',
      });
    }

    const totalMinutes = hours * 60 + minutes;
    if (totalMinutes <= 0) {
      return res.status(400).json({
        success: false,
        data: {},
        message: 'Reading time must be greater than 0',
      });
    }

    const today = new Date();
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const log = await ReadingLog.findOneAndUpdate(
      { userId, date },
      { minutes: totalMinutes },
      { new: true, upsert: true }
    );

    // Award NovaCoins (1 coin per 10 minutes)
    const novaCoinsEarned = Math.floor(totalMinutes / 10);

    return res.json({
      success: true,
      data: {
        log,
        novaCoinsEarned,
      },
      message: 'Reading session logged successfully',
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      data: {},
      message: err.message || 'Failed to log reading time',
    });
  }
};

export const getReadingSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const { period } = req.query;

    let start, end;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (period === 'today') {
      start = today;
      end = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    } else if (period === 'weekly') {
      start = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      end = today;
    } else if (period === 'monthly') {
      start = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      end = today;
    } else {
      start = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      end = today;
    }

    const logs = await ReadingLog.find({
      userId,
      date: { $gte: start, $lte: end },
    }).sort({ date: 1 });

    const totalMinutes = logs.reduce((sum, log) => sum + log.minutes, 0);
    const averageMinutes = logs.length ? Math.round(totalMinutes / logs.length) : 0;

    const data = logs.map(log => ({
      date: log.date.toISOString().split('T')[0],
      minutes: log.minutes,
    }));

    return res.json({
      success: true,
      data: {
        totalMinutes,
        averageMinutes,
        data,
        period: period || 'weekly',
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0],
      },
      message: 'Reading summary fetched successfully',
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      data: {},
      message: err.message || 'Failed to fetch reading summary',
    });
  }
};

export const setReadingReminder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { time, enabled = false } = req.body;

    if (!time) {
      return res.status(400).json({
        success: false,
        data: {},
        message: 'Time is required',
      });
    }

    const reminder = await ReadingReminder.findOneAndUpdate(
      { userId },
      { time, enabled },
      { new: true, upsert: true }
    );

    return res.json({
      success: true,
      data: reminder,
      message: 'Reading reminder set successfully',
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      data: {},
      message: err.message || 'Failed to set reading reminder',
    });
  }
};

export const getReadingReminder = async (req, res) => {
  try {
    const userId = req.user.id;

    const reminder = await ReadingReminder.findOne({ userId });

    return res.json({
      success: true,
      data: reminder || { enabled: false },
      message: 'Reading reminder fetched successfully',
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      data: {},
      message: err.message || 'Failed to fetch reading reminder',
    });
  }
};


// src/controllers/readingController.js

// ✅ Fetch current reading goal
export const getReadingGoal = async (req, res) => {
  try {
    const userId = req.user.id;

    const goal = await ReadingGoal.findOne({ userId });

    return res.json({
      success: true,
       data:{goal} || { dailyTargetMinutes: 0 },
      message: 'Reading goal fetched successfully',
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      data: {},
      message: err.message || 'Failed to fetch reading goal',
    });
  }
};



export default {
  setReadingGoal,
  logReadingTime,
  getReadingSummary,
  setReadingReminder,
  getReadingReminder, 
  getReadingGoal, 
  getReadingReminder,
};