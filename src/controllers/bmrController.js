// src/controllers/bmrController.js
import BmrLog from '~/models/bmrLogModel';
import User from '~/models/userModel';
import httpStatus from 'http-status';
import APIError from '~/utils/apiError';

// Mifflin-St Jeor Formula (Most Accurate for Adults)
const calculateBMR = (weight, height, age, gender) => {
  let bmr;
  if (gender === 'male') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else if (gender === 'female') {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  } else {
    // For 'other', use average or default to female
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }
  return Math.round(bmr); // Round to nearest integer
};

export const calculateAndLogBMR = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user profile
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
         data:{},
        message: 'User not found',
      });
    }

    // Validate input (optional override)
    const { weight, height } = req.body;
    const finalWeight = weight || user.weight;
    const finalHeight = height || user.height;
    const finalAge = user.dob ? new Date().getFullYear() - new Date(user.dob).getFullYear() : 30;
    const finalGender = user.gender || 'other';

    if (!finalWeight || !finalHeight) {
      return res.status(400).json({
        success: false,
         data:{},
        message: 'Weight and height are required',
      });
    }

    // Calculate BMR
    const bmr = calculateBMR(finalWeight, finalHeight, finalAge, finalGender);

    // Create log entry
    const bmrLog = new BmrLog({
      userId,
      bmr,
      weight: finalWeight,
      height: finalHeight,
      age: finalAge,
      gender: finalGender,
    });

    const savedLog = await bmrLog.save();

    // Award NovaCoins (optional)
    const novaCoinsEarned = 10; // Fixed for MVP

    return res.json({
      success: true,
       data:{ bmr, novaCoinsEarned, savedLog },
      message: 'BMR calculated successfully',
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
       data:{},
      message: err.message || 'Failed to calculate BMR',
    });
  }
};

export const getBMRProgress = async (req, res) => {
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

    const logs = await BmrLog.find({
      userId,
      calculatedAt: { $gte: start, $lte: end },
    }).sort({ calculatedAt: 1 });

    // Format for chart (daily values)
    const dailyData = {};
    logs.forEach(log => {
      const dateStr = log.calculatedAt.toISOString().split('T')[0];
      dailyData[dateStr] = log.bmr;
    });

    // Get latest BMR
    const latestLog = logs[logs.length - 1];
    const currentBMR = latestLog ? latestLog.bmr : 0;

    return res.json({
      success: true,
       data:{
        currentBMR,
        dailyData,
        period: period || 'weekly',
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0],
      },
      message: 'BMR progress fetched successfully',
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
       data:{},
      message: err.message || 'Failed to fetch BMR progress',
    });
  }
};

export default {
  calculateAndLogBMR,
  getBMRProgress,
};