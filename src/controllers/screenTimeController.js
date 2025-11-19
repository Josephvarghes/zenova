// src/controllers/screenTimeController.js
import ScreenTimeLog from '~/models/screenTimeLogModel';
import User from '~/models/userModel';
import httpStatus from 'http-status';
import APIError from '~/utils/apiError'; 
import questService from '~/services/questService';


export const setFocusGoal = async (req, res) => {
  try {
    const userId = req.user.id;
    const { dailyScreenTimeLimitMin, focusModeTargetHours } = req.body;

    if (!dailyScreenTimeLimitMin || !focusModeTargetHours) {
      return res.status(400).json({
        success: false,
         data:{},
        message: 'Daily screen time limit and focus mode target hours are required',
      });
    }

    // Update user's focus goal
    const user = await User.findByIdAndUpdate(
      userId,
      {
        focusGoal: {
          dailyScreenTimeLimitMin,
          focusModeTargetHours,
        }
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
         data:{},
        message: 'User not found',
      });
    }

    return res.json({
      success: true,
       user,
      message: 'Focus goal set successfully',
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
       data:{},
      message: err.message || 'Failed to set focus goal',
    });
  }
};

export const logScreenTime = async (req, res) => {
  try {
    const userId = req.user.id;
    const { durationMin, category, source = 'manual' } = req.body;

    if (!durationMin || !category) {
      return res.status(400).json({
        success: false,
         data:{},
        message: 'Duration and category are required',
      });
    }

    const screenTimeLog = new ScreenTimeLog({
      userId,
      durationMin,
      category,
      source,
    });

    const savedLog = await screenTimeLog.save(); 

    // Award NovaCoins (1 coin per 30 minutes)
    const novaCoinsEarned = Math.floor(durationMin / 30); 

    const user = await User.findById(userId);

    // ✅ ADD QUEST CHECK (no streak)
    await questService.checkQuestCompletion(userId, {
      screenTimeLogs: 1,
      totalNovaCoins: user.novaCoins + novaCoinsEarned, // e.g., Math.floor(durationMin / 30)
    });

    return res.json({
      success: true,
       data:{ savedLog, novaCoinsEarned },
      message: 'Screen time logged successfully',
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
       data:{},
      message: err.message || 'Failed to log screen time',
    });
  }
};

export const getScreenTimeProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { period } = req.query; // 'today', 'weekly', 'monthly'

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
      // Default to weekly
      start = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      end = today;
    }

    const logs = await ScreenTimeLog.find({
      userId,
      loggedAt: { $gte: start, $lte: end },
    }).sort({ loggedAt: 1 });

    // Format for chart (daily values)
    const dailyData = {};
    logs.forEach(log => {
      const dateStr = log.loggedAt.toISOString().split('T')[0];
      dailyData[dateStr] = log.durationMin;
    });

    // Get latest log
    const latestLog = logs[logs.length - 1];
    const currentScreenTime = latestLog ? latestLog.durationMin : 0;

    // Calculate average screen time
    const avgScreenTime = logs.length ? Math.round(logs.reduce((sum, log) => sum + log.durationMin, 0) / logs.length) : 0;

    return res.json({
      success: true,
       data:{
        currentScreenTime,
        avgScreenTime,
        dailyData,
        period: period || 'weekly',
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0],
      },
      message: 'Screen time progress fetched successfully',
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      data:{},
      message: err.message || 'Failed to fetch screen time progress',
    });
  }
};

export default {
  setFocusGoal,
  logScreenTime,
  getScreenTimeProgress,
};