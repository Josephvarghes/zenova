// src/controllers/workoutController.js
import Exercise from '~/models/exerciseModel';
import WorkoutPlan from '~/models/workoutPlanModel';
import WorkoutLog from '~/models/workoutLogModel';
import User from '~/models/userModel';
import httpStatus from 'http-status';
import APIError from '~/utils/apiError';
import questService from '~/services/questService';
import streakService from '~/services/streakService';

// Helper: Calculate calories burned for an exercise
const calculateExerciseCalories = (durationMin, estimatedBurnPerMin, weightKg = 70) => {
  // Formula: Duration × Burn per min × Weight factor (0.04)
  return Math.round(durationMin * estimatedBurnPerMin * (weightKg / 70));
};

export const getExerciseLibrary = async (req, res) => {
  try {
    const { category } = req.query;

    let query = {};
    if (category) {
      query.category = category;
    }

    const exercises = await Exercise.find(query).sort({ name: 1 });

    return res.json({
      success: true,
       exercises,
      message: 'Exercise library fetched successfully',
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
       data:{},
      message: err.message || 'Failed to fetch exercise library',
    });
  }
};

export const createWorkoutPlan = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, type, exercises } = req.body;

    if (!name || !type || !exercises || exercises.length === 0) {
      return res.status(400).json({
        success: false,
         data:{},
        message: 'Name, type, and at least one exercise are required',
      });
    }

    // Validate exercises
    const exerciseIds = exercises.map(e => e.exerciseId);
    const validExercises = await Exercise.find({ _id: { $in: exerciseIds } });
    if (validExercises.length !== exerciseIds.length) {
      return res.status(400).json({
        success: false,
         data:{},
        message: 'One or more exercises are invalid',
      });
    }

    // Calculate total duration and calories
    let totalDurationMin = 0;
    let totalCaloriesBurned = 0;

    const workoutExercises = exercises.map(exercise => {
      const foundExercise = validExercises.find(e => e._id.toString() === exercise.exerciseId);
      const durationMin = exercise.durationMin || foundExercise.durationMin;
      const estimatedBurnPerMin = foundExercise.estimatedBurnPerMin;
      const caloriesBurned = calculateExerciseCalories(durationMin, estimatedBurnPerMin, 70); // Use user weight later

      totalDurationMin += durationMin;
      totalCaloriesBurned += caloriesBurned;

      return {
        exerciseId: exercise.exerciseId,
        sets: exercise.sets || foundExercise.defaultSets,
        reps: exercise.reps || foundExercise.defaultReps,
        weightKg: exercise.weightKg || foundExercise.defaultWeightKg,
        durationMin,
      };
    });

    const workoutPlan = new WorkoutPlan({
      userId,
      name,
      type,
      exercises: workoutExercises,
      totalDurationMin,
      totalCaloriesBurned,
    });

    const savedPlan = await workoutPlan.save();

    return res.json({
      success: true,
       data:{savedPlan},
      message: 'Workout plan created successfully',
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
       data:{},
      message: err.message || 'Failed to create workout plan',
    });
  }
};

export const logWorkout = async (req, res) => {
  try {
    const userId = req.user.id;
    const { workoutPlanId, exercisesCompleted } = req.body;

    if (!workoutPlanId || !exercisesCompleted || exercisesCompleted.length === 0) {
      return res.status(400).json({
        success: false,
         data:{},
        message: 'Workout plan ID and at least one exercise completed are required',
      });
    }

    const workoutPlan = await WorkoutPlan.findById(workoutPlanId);
    if (!workoutPlan || workoutPlan.userId.toString() !== userId) {
      return res.status(404).json({
        success: false,
         data:{},
        message: 'Workout plan not found or access denied',
      });
    }

    // Validate exercises
    const exerciseIds = exercisesCompleted.map(e => e.exerciseId);
    const validExercises = await Exercise.find({ _id: { $in: exerciseIds } });
    if (validExercises.length !== exerciseIds.length) {
      return res.status(400).json({
        success: false,
         data:{},
        message: 'One or more exercises are invalid',
      });
    }

    // Calculate calories for each exercise
    let totalCaloriesBurned = 0;
    const completedExercises = exercisesCompleted.map(exercise => {
      const foundExercise = validExercises.find(e => e._id.toString() === exercise.exerciseId);
      const durationMin = exercise.durationMin;
      const estimatedBurnPerMin = foundExercise.estimatedBurnPerMin;
      const caloriesBurned = calculateExerciseCalories(durationMin, estimatedBurnPerMin, 70); // Use user weight later

      totalCaloriesBurned += caloriesBurned;

      return {
        exerciseId: exercise.exerciseId,
        sets: exercise.sets,
        reps: exercise.reps,
        weightKg: exercise.weightKg,
        durationMin,
        caloriesBurned,
      };
    });

    const workoutLog = new WorkoutLog({
      userId,
      workoutPlanId,
      exercisesCompleted: completedExercises,
      totalCaloriesBurned,
      source: 'manual',
    });

    const savedLog = await workoutLog.save();

    // Award NovaCoins (optional)
    const novaCoinsEarned = Math.floor(totalCaloriesBurned / 100); // 1 coin per 100 kcal 

    const user = await User.findById(userId);
    const streakDays = await streakService.updateStreak(userId);
    await User.findByIdAndUpdate(userId, { streakDays });

    await questService.checkQuestCompletion(userId, {
      streakDays,
      workoutLogs: 1,
      totalNovaCoins: user.novaCoins + novaCoinsEarned, // from your logic
    });

    return res.json({
      success: true,
       data:{ savedLog, novaCoinsEarned },
      message: 'Workout logged successfully',
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
       data:{},
      message: err.message || 'Failed to log workout',
    });
  }
};

export const getWorkoutProgress = async (req, res) => {
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

    const logs = await WorkoutLog.find({
      userId,
      loggedAt: { $gte: start, $lte: end },
    }).sort({ loggedAt: 1 });

    // Format for chart (daily values)
    const dailyData = {};
    logs.forEach(log => {
      const dateStr = log.loggedAt.toISOString().split('T')[0];
      dailyData[dateStr] = log.totalCaloriesBurned;
    });

    // Get latest log
    const latestLog = logs[logs.length - 1];
    const currentCalories = latestLog ? latestLog.totalCaloriesBurned : 0;

    return res.json({
      success: true,
       data:{
        currentCalories,
        dailyData,
        period: period || 'weekly',
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0],
      },
      message: 'Workout progress fetched successfully',
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
       data:{},
      message: err.message || 'Failed to fetch workout progress',
    });
  }
}; 

export const createExercise = async (req, res) => {
  try {
    const { 
      name, 
      category, 
      durationMin, 
      targetAreas, 
      videoUrl, 
      defaultSets, 
      defaultReps, 
      estimatedBurnPerMin 
    } = req.body;

    // Create exercise
    const exercise = new Exercise({
      name,
      category,
      durationMin,
      targetAreas,
      videoUrl,
      defaultSets,
      defaultReps,
      estimatedBurnPerMin,
    });

    const savedExercise = await exercise.save();

    return res.status(201).json({
      success: true,
      data:{savedExercise},
      message: 'Exercise created successfully',
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
       data:{},
      message: err.message || 'Failed to create exercise',
    });
  }
};

export default {
  getExerciseLibrary,
  createWorkoutPlan,
  logWorkout,
  getWorkoutProgress,
  createExercise
};