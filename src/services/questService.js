// src/services/questService.js
import { Parser } from 'expr-eval';
import Quest from '~/models/questModel';
import User from '~/models/userModel';
import httpStatus from 'http-status';
import APIError from '~/utils/apiError';

const parser = new Parser();

/**
 * Evaluate if user qualifies for a quest
 * @param {ObjectId} userId
 * @param {Object} updatedStats - e.g., { streakDays: 7, mealLogs: 1, totalNovaCoins: 105 }
 */
export const checkQuestCompletion = async (userId, updatedStats = {}) => {
  try {
    const user = await User.findById(userId).lean(); // ← Fetch once, use lean() for perf
    if (!user) {
      throw new APIError('User not found', httpStatus.NOT_FOUND);
    }

    const quests = await Quest.find({ isActive: true });

    let userUpdated = false;
    const updatedUser = { ...user }; // Work on a copy

    for (const quest of quests) {
      // Skip if already completed
      const alreadyCompleted = user.questsCompleted.some(
        (q) => q.questId?.toString() === quest._id.toString()
      );
      if (alreadyCompleted) continue;

      // Build evaluation context
      const context = {
        streakDays: updatedStats.streakDays !== undefined 
          ? updatedStats.streakDays 
          : user.streakDays,
        mealLogs: updatedStats.mealLogs || 0,
        workoutLogs: updatedStats.workoutLogs || 0,
        meditationLogs: updatedStats.meditationLogs || 0,
        yogaLogs: updatedStats.yogaLogs || 0,
        sleepLogs: updatedStats.sleepLogs || 0,
        moodLogs: updatedStats.moodLogs || 0,
        menstrualLogs: updatedStats.menstrualLogs || 0,
        screenTimeLogs: updatedStats.screenTimeLogs || 0,
        totalNovaCoins: updatedStats.totalNovaCoins !== undefined
          ? updatedStats.totalNovaCoins
          : user.novaCoins,
      };

      try {
        const conditionMet = parser.parse(quest.condition).evaluate(context);

        if (conditionMet) {
          // Update coins
          if (quest.rewardCoins > 0) {
            updatedUser.novaCoins = (updatedUser.novaCoins || 0) + quest.rewardCoins;
          }

          // Add badge
          if (quest.badge) {
            updatedUser.badges = updatedUser.badges || [];
            updatedUser.badges.push({
              name: quest.badge.name,
              icon: quest.badge.icon,
              unlockedAt: new Date(),
            });
          }

          // Mark quest as completed
          updatedUser.questsCompleted = updatedUser.questsCompleted || [];
          updatedUser.questsCompleted.push({
            questId: quest._id,
            completedAt: new Date(),
          });

          userUpdated = true;
        }
      } catch (err) {
        console.error(`Quest condition error (ID: ${quest._id}):`, err.message);
      }
    }

    // Update level
    const newLevel = Math.floor((updatedUser.novaCoins || 0) / 200) + 1;
    if ((updatedUser.level || 1) !== newLevel) {
      updatedUser.level = newLevel;
      userUpdated = true;
    }

    // Save only if changes occurred
    if (userUpdated) {
      await User.findByIdAndUpdate(userId, updatedUser, { new: true });
    }
  } catch (err) {
    console.error('Quest service error:', err);
    // Never throw — gamification is non-critical
  }
};

export default {
  checkQuestCompletion,
};