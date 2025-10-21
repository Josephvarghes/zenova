// src/controllers/mealController.js
import MealPlan from '~/models/mealPlanModel';
import MealLog from '~/models/mealLogModel';
import GroceryList from '~/models/groceryListModel';
import User from '~/models/userModel';
import httpStatus from 'http-status';
import APIError from '~/utils/apiError';

// Helper: Calculate target calories based on user profile
const calculateTargetCalories = (user) => {
  let base = 2000;
  if (user.lifestyle === 'very_active') base = 2500;
  else if (user.lifestyle === 'sedentary') base = 1800;
  
  // Adjust for weight goal (simplified)
  if (user.wellnessGoal === 'weight_loss') return base - 300;
  if (user.wellnessGoal === 'muscle_gain') return base + 300;
  return base;
};

// Helper: Generate a simple meal plan (MVP)
const generateSimplePlan = (targetCalories) => {
  const breakfast = { food: "Oats + Banana", calories: 320, protein: 6, carbs: 48, fats: 5 };
  const lunch = { food: "Quinoa Salad", calories: 220, protein: 5, carbs: 40, fats: 4 };
  const dinner = { food: "Brown Rice + Veggies", calories: 220, protein: 5, carbs: 40, fats: 4 };
  const snack = { food: "Almonds (10 pcs)", calories: 70, protein: 3, carbs: 2, fats: 6 };
  
  const total = breakfast.calories + lunch.calories + dinner.calories + snack.calories;
  
  return { breakfast, lunch, dinner, snack, totalCalories: total, targetCalories };
};

export const generateMealPlan = async (req, res) => {
  try {
    const userId = req.user.id;
    const inputDate = req.body.date ? new Date(req.body.date) : new Date();
    const date = new Date(inputDate.getFullYear(), inputDate.getMonth(), inputDate.getDate()); // normalize to midnight

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        data: {},
        message: 'User not found',
      });
    }

    const targetCalories = calculateTargetCalories(user);
    const planData = generateSimplePlan(targetCalories);

    const existingPlan = await MealPlan.findOne({ userId, date });
    if (existingPlan) {
      return res.json({
        success: true,
        data: existingPlan,
        message: 'Meal plan already exists for this date',
      });
    }

    const mealPlan = new MealPlan({
      userId,
      date,
      ...planData,
    });

    const savedPlan = await mealPlan.save();

    return res.json({
      success: true,
      data: savedPlan,
      message: 'Meal plan generated successfully',
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      data: {},
      message: err.message || 'Failed to generate meal plan',
    });
  }
};

export const logMeal = async (req, res) => {
  try {
    const userId = req.user.id;
    const { food, calories, protein, carbs, fats, mealTime } = req.body;

    const mealLog = new MealLog({
      userId,
      food,
      calories,
      protein,
      carbs,
      fats,
      mealTime,
      loggedAt: new Date(),
      novaCoinsEarned: 5,
    });

    const savedLog = await mealLog.save();

    return res.json({
      success: true,
      data: savedLog,
      message: 'Meal logged successfully',
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      data: {},
      message: err.message || 'Failed to log meal',
    });
  }
};

// ✅ NEW: Auto-generate grocery list from meal plan
export const generateGroceryList = async (req, res) => {
  try {
    const userId = req.user.id;
    const { planId } = req.body;

    let mealPlan;
    if (planId) {
      mealPlan = await MealPlan.findById(planId);
      if (!mealPlan || mealPlan.userId.toString() !== userId) {
        return res.status(404).json({
          success: false,
          data: {},
          message: 'Meal plan not found',
        });
      }
    } else {
      // Use today's plan
      const today = new Date();
      const date = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      mealPlan = await MealPlan.findOne({ userId, date });
      if (!mealPlan) {
        return res.status(404).json({
          success: false,
          data: {},
          message: 'No meal plan found for today. Generate one first.',
        });
      }
    }

    // Map meal items to grocery items (simplified)
    const allFoods = [
      mealPlan.breakfast.food,
      mealPlan.lunch.food,
      mealPlan.dinner.food,
      mealPlan.snack.food,
    ];

    // Basic parsing: "Oats + Banana" → ["Oats", "Banana"]
    const groceryItems = [];
    const unitMap = {
      'Oats': { unit: 'g', qty: 50 },
      'Banana': { unit: 'pcs', qty: 1 },
      'Quinoa': { unit: 'g', qty: 60 },
      'Salad': { unit: 'g', qty: 100 },
      'Brown Rice': { unit: 'g', qty: 60 },
      'Veggies': { unit: 'g', qty: 150 },
      'Almonds': { unit: 'pcs', qty: 10 },
    };

    allFoods.forEach(food => {
      // Simple split by " + "
      const items = food.split(' + ').map(item => item.trim());
      items.forEach(item => {
        const baseItem = item.split(' ')[0]; // "Oats" from "Oats + Banana"
        const config = unitMap[baseItem] || { unit: 'pcs', qty: 1 };
        groceryItems.push({
          name: item,
          quantity: config.qty,
          unit: config.unit,
        });
      });
    });

    // Remove duplicates (simplified)
    const uniqueItems = [];
    const seen = new Set();
    groceryItems.forEach(item => {
      if (!seen.has(item.name)) {
        seen.add(item.name);
        uniqueItems.push(item);
      }
    });

    // Check if list already exists for this plan
    let groceryList = await GroceryList.findOne({ generatedFromPlan: mealPlan._id });
    if (groceryList) {
      return res.json({
        success: true,
        data: groceryList,
        message: 'Grocery list already exists',
      });
    }

    groceryList = new GroceryList({
      userId,
      items: uniqueItems,
      generatedFromPlan: mealPlan._id,
    });

    const savedList = await groceryList.save();

    return res.json({
      success: true,
      data: savedList,
      message: 'Grocery list generated successfully',
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      data: {},
      message: err.message || 'Failed to generate grocery list',
    });
  }
};

// Get meal logs (history)
export const getMealLogs = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const logs = await MealLog.find({
      userId,
      loggedAt: { $gte: start, $lte: end },
    }).sort({ loggedAt: -1 });

    return res.json({
      success: true,
      data: logs,
      message: 'Meal logs fetched successfully',
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      data: {},
      message: err.message || 'Failed to fetch meal logs',
    });
  }
};

// Get nutrition summary (already partially built — enhance it)
export const getNutritionSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);

    const logs = await MealLog.find({
      userId,
      loggedAt: { $gte: start, $lte: end },
    });

    const totalCalories = logs.reduce((sum, log) => sum + log.calories, 0);
    const protein = logs.reduce((sum, log) => sum + log.protein, 0);
    const carbs = logs.reduce((sum, log) => sum + log.carbs, 0);
    const fats = logs.reduce((sum, log) => sum + log.fats, 0);
    const daysLogged = new Set(logs.map(log => new Date(log.loggedAt).toDateString())).size;

    const summary = {
      totalCalories,
      avgCaloriesPerDay: logs.length ? Math.round(totalCalories / daysLogged) : 0,
      protein,
      carbs,
      fats,
      daysLogged,
    };

    return res.json({
      success: true,
      data: summary,
      message: 'Nutrition summary fetched successfully',
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      data: {},
      message: err.message || 'Failed to fetch nutrition summary',
    });
  }
};


export default {
  generateMealPlan,
  logMeal,
  generateGroceryList,
  getMealLogs,
  getNutritionSummary

};