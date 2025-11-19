// src/controllers/aiController.js
import aiService from '~/services/aiService';
import MealLog from '~/models/mealLogModel';
import StepLog from '~/models/stepLogModel';
import SleepLog from '~/models/sleepLogModel';
import MoodLog from '~/models/moodLogModel';
import User from '~/models/userModel';

// Summarize user data for AI (privacy-safe)
const buildUserContext = async (userId) => {
  const user = await User.findById(userId);
  const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const meals = await MealLog.find({ userId, loggedAt: { $gte: last7Days } });
  const steps = await StepLog.find({ userId, loggedAt: { $gte: last7Days } });
  const sleep = await SleepLog.find({ userId, loggedAt: { $gte: last7Days } });
  const mood = await MoodLog.find({ userId, loggedAt: { $gte: last7Days } });

  return `User: ${user.gender}, ${user.age} years, goal: ${user.wellnessGoal}. 
Recent data (last 7 days): 
- Meals logged: ${meals.length}, avg calories: ${meals.length ? Math.round(meals.reduce((sum, m) => sum + m.calories, 0) / meals.length) : 0}
- Avg steps/day: ${steps.length ? Math.round(steps.reduce((sum, s) => sum + s.steps, 0) / steps.length) : 0}
- Avg sleep: ${sleep.length ? Math.round(sleep.reduce((sum, s) => sum + s.durationMin, 0) / sleep.length / 60 * 10) / 10 : 0} hours
- Mood: ${mood.length ? mood[mood.length - 1]?.mood || 'Neutral' : 'Neutral'}
  `;
};

export const getRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;
    const context = await buildUserContext(userId);

    // Get all 3 recommendations in parallel
    const [nutrition, movement, lifestyle] = await Promise.all([
      aiService.getAIRecommendation('nutrition', context),
      aiService.getAIRecommendation('movement', context),
      aiService.getAIRecommendation('lifestyle', context),
    ]);

    return res.json({
      success: true,
      data: {
        nutrition,
        movement,
        lifestyle,
        generatedAt: new Date().toISOString(),
      },
      message: 'AI recommendations fetched successfully',
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      data:{},
      message: err.message || 'Failed to get AI recommendations',
    });
  }
};

export default {
  getRecommendations,
};