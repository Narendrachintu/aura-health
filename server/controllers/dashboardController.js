const Workout = require('../models/Workout');
const Calorie = require('../models/Calorie');
const Sleep = require('../models/Sleep');
const Water = require('../models/Water');

exports.getDashboard = async (req, res) => {
  try {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);

    console.log(`[DEBUG] Dashboard Fetch for User: ${req.user.email} (${req.user._id})`);
    console.log(`[DEBUG] Date Range: ${today.toISOString()} to ${tomorrow.toISOString()}`);

    const [todayWorkouts, todayCalories, todaySleep, todayWater, weekWorkouts, weekCalories, weekSleep, weekWater] = await Promise.all([
      Workout.find({ user: req.user.id, date: { $gte: today, $lt: tomorrow } }),
      Calorie.find({ user: req.user.id, date: { $gte: today, $lt: tomorrow } }),
      Sleep.find({ user: req.user.id, date: { $gte: today, $lt: tomorrow } }),
      Water.find({ user: req.user.id, date: { $gte: today, $lt: tomorrow } }),
      Workout.find({ user: req.user.id, date: { $gte: weekAgo } }),
      Calorie.find({ user: req.user.id, date: { $gte: weekAgo } }),
      Sleep.find({ user: req.user.id, date: { $gte: weekAgo } }),
      Water.find({ user: req.user.id, date: { $gte: weekAgo } }),
    ]);

    const todayStats = {
      workoutMinutes: todayWorkouts.reduce((s, w) => s + w.duration, 0),
      workoutCalories: todayWorkouts.reduce((s, w) => s + w.caloriesBurned, 0),
      caloriesConsumed: todayCalories.reduce((s, c) => s + c.calories, 0),
      protein: todayCalories.reduce((s, c) => s + c.protein, 0),
      carbs: todayCalories.reduce((s, c) => s + c.carbs, 0),
      fat: todayCalories.reduce((s, c) => s + c.fat, 0),
      sleepHours: todaySleep.reduce((s, sl) => s + sl.duration, 0),
      waterMl: todayWater.reduce((s, w) => s + w.amount, 0),
      workoutCount: todayWorkouts.length,
    };

    const weekStats = {
      totalWorkoutMinutes: weekWorkouts.reduce((s, w) => s + w.duration, 0),
      totalWorkoutCalories: weekWorkouts.reduce((s, w) => s + w.caloriesBurned, 0),
      avgCalories: weekCalories.length > 0 ? Math.round(weekCalories.reduce((s, c) => s + c.calories, 0) / 7) : 0,
      avgSleep: weekSleep.length > 0 ? Math.round((weekSleep.reduce((s, sl) => s + sl.duration, 0) / 7) * 10) / 10 : 0,
      avgWater: weekWater.length > 0 ? Math.round(weekWater.reduce((s, w) => s + w.amount, 0) / 7) : 0,
      workoutDays: new Set(weekWorkouts.map(w => w.date.toISOString().split('T')[0])).size,
    };

    console.log(`[DEBUG] Today Stats: ${JSON.stringify(todayStats)}`);
    res.json({ success: true, data: { today: todayStats, week: weekStats, goals: req.user.goals, debug: { user: req.user.email } } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
