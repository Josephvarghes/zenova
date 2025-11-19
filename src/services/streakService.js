// src/services/streakService.js
import User from '~/models/userModel';
import httpStatus from 'http-status';
import APIError from '~/utils/apiError';

/**
 * Check if two dates are the same day (ignoring time)
 */
const isSameDay = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

/**
 * Get or update user's streak
 * @param {ObjectId} userId
 * @returns {Promise<Number>} current streak days
 */
export const updateStreak = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new APIError('User not found', httpStatus.NOT_FOUND);
    }

    const today = new Date();
    const lastStreakDate = user.lastStreakDate 
      ? new Date(user.lastStreakDate) 
      : null;

    let newStreak = user.streakDays;

    if (!lastStreakDate) {
      // First log ever → start streak
      newStreak = 1;
    } else if (isSameDay(lastStreakDate, today)) {
      // Already logged today → keep same streak
      newStreak = user.streakDays;
    } else {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (isSameDay(lastStreakDate, yesterday)) {
        // Logged yesterday → continue streak
        newStreak = user.streakDays + 1;
      } else {
        // Skipped days → reset streak
        newStreak = 1;
      }
    }

    // Update user only if streak changed
    if (newStreak !== user.streakDays || !isSameDay(lastStreakDate, today)) {
      await User.findByIdAndUpdate(userId, {
        streakDays: newStreak,
        lastStreakDate: today,
      });
    }

    return newStreak;
  } catch (err) {
    console.error('Streak update error:', err);
    // Never crash main flow
    return user?.streakDays || 0;
  }
};

export default {
  updateStreak,
};