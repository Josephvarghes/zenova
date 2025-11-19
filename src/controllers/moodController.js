// src/controllers/moodController.js
import MoodLog from '~/models/moodLogModel';
import User from '~/models/userModel';
import httpStatus from 'http-status';
import APIError from '~/utils/apiError'; 
import questService from '~/services/questService';


// AI Suggestions Map (Rule-Based MVP)
const MOOD_SUGGESTIONS = {
  'Very Unpleasant': {
    activity: 'Guided Meditation',
    type: 'meditation',
    durationMin: 10,
    reward: 50,
    description: 'Calm your mind with a soothing meditation.'
  },
  'Unpleasant': {
    activity: 'Yoga Flow',
    type: 'yoga',
    durationMin: 15,
    reward: 40,
    description: 'Release tension with gentle yoga poses.'
  },
  'Neutral': {
    activity: 'Zen Burn',
    type: 'workout',
    durationMin: 20,
    reward: 30,
    description: 'Boost your energy with a quick workout.'
  },
  'Pleasant': {
    activity: 'Breathing Exercise',
    type: 'meditation',
    durationMin: 5,
    reward: 20,
    description: 'Deepen your calm with mindful breathing.'
  },
  'Very Pleasant': {
    activity: 'Gratitude Journal',
    type: 'manual',
    durationMin: 5,
    reward: 20,
    description: 'Reflect on what you’re grateful for.'
  }
};

export const logMood = async (req, res) => {
  try {
    const userId = req.user.id;
    const { mood } = req.body;

        // In logMood function
    console.log('MoodLog schema:', MoodLog.schema.paths.suggestedActivity);
    console.log('Suggestion object:', suggestion);
    if (!mood) {
      return res.status(400).json({
        success: false,
         data:{},
        message: 'Mood is required',
      });
    }

    // Check if already logged today
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);

    const existingLog = await MoodLog.findOne({
      userId,
      loggedAt: { $gte: start, $lte: end },
    });

    if (existingLog) {
      return res.status(400).json({
        success: false,
         data:{},
        message: 'Mood already logged today',
      });
    }

    const suggestion = MOOD_SUGGESTIONS[mood] || MOOD_SUGGESTIONS['Neutral'];

    const moodLog = new MoodLog({
      userId,
      mood,
      suggestedActivity: suggestion, // ← Save suggestion
    });

    const savedLog = await moodLog.save(); 

    const user = await User.findById(userId);
    // Mood doesn't affect streak → no streak update
    await questService.checkQuestCompletion(userId, {
      moodLogs: 1,
      totalNovaCoins: user.novaCoins + 20, // 20 = mood coins
    });

    return res.json({
      success: true,
       data:{
        savedLog,
        novaCoinsEarned: 20,
        suggestion,
        totalCoins: 20 + suggestion.reward
      },
      message: 'Mood logged successfully',
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
       data:{},
      message: err.message || 'Failed to log mood',
    });
  }
};

// ... rest of controller

export const getMoodSummary = async (req, res) => {
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

    const logs = await MoodLog.find({
      userId,
      loggedAt: { $gte: start, $lte: end },
    }).sort({ loggedAt: 1 });

    // Format for summary (daily values)
    const dailyData = {};
    logs.forEach(log => {
      const dateStr = log.loggedAt.toISOString().split('T')[0];
      dailyData[dateStr] = log.mood;
    });

    // Get latest log
    const latestLog = logs[logs.length - 1];
    const currentMood = latestLog ? latestLog.mood : 'Neutral';

    return res.json({
      success: true,
       data:{
        currentMood,
        dailyData,
        period: period || 'weekly',
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0],
      },
      message: 'Mood summary fetched successfully',
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
       data:{},
      message: err.message || 'Failed to fetch mood summary',
    });
  }
};

export default {
  logMood,
  getMoodSummary,
};