const Workout = require('../models/Workout');
const Calorie = require('../models/Calorie');
const Sleep = require('../models/Sleep');
const Water = require('../models/Water');

function generateSuggestions(user, todayStats, weekStats) {
  const suggestions = [];
  const goals = user.goals || {};

  // BMI-based suggestions
  if (user.height > 0 && user.weight > 0) {
    const bmi = user.weight / Math.pow(user.height / 100, 2);
    if (bmi < 18.5) {
      suggestions.push({ type: 'nutrition', priority: 'high', icon: '🍎', title: 'Underweight Alert', message: `Your BMI is ${bmi.toFixed(1)}. Consider increasing calorie intake with nutrient-dense foods like nuts, avocados, and lean proteins.` });
    } else if (bmi >= 25 && bmi < 30) {
      suggestions.push({ type: 'fitness', priority: 'medium', icon: '🏃', title: 'Weight Management', message: `Your BMI is ${bmi.toFixed(1)}. Try adding 30 minutes of cardio 3-4 times per week and reducing processed food intake.` });
    } else if (bmi >= 30) {
      suggestions.push({ type: 'health', priority: 'high', icon: '❤️', title: 'Health Priority', message: `Your BMI is ${bmi.toFixed(1)}. Consult a healthcare provider and start with low-impact exercises like walking or swimming.` });
    } else {
      suggestions.push({ type: 'health', priority: 'low', icon: '✅', title: 'Healthy BMI', message: `Great job! Your BMI is ${bmi.toFixed(1)} which is in the healthy range. Keep maintaining your current lifestyle.` });
    }
  }

  // Water intake
  const waterGoal = goals.dailyWater || 2500;
  if (todayStats.waterMl < waterGoal * 0.5) {
    suggestions.push({ type: 'hydration', priority: 'high', icon: '💧', title: 'Stay Hydrated', message: `You've only had ${todayStats.waterMl}ml of water today. Aim for ${waterGoal}ml daily. Try setting hourly reminders.` });
  } else if (todayStats.waterMl >= waterGoal) {
    suggestions.push({ type: 'hydration', priority: 'low', icon: '💧', title: 'Hydration Goal Met!', message: `Excellent! You've reached your daily water goal of ${waterGoal}ml.` });
  }

  // Sleep
  const sleepGoal = goals.dailySleep || 8;
  if (weekStats.avgSleep < sleepGoal - 1) {
    suggestions.push({ type: 'sleep', priority: 'high', icon: '😴', title: 'Improve Sleep', message: `Your average sleep is ${weekStats.avgSleep}h. Aim for ${sleepGoal}h. Try a consistent bedtime routine and avoid screens 1 hour before bed.` });
  } else if (weekStats.avgSleep >= sleepGoal) {
    suggestions.push({ type: 'sleep', priority: 'low', icon: '🌙', title: 'Great Sleep Pattern', message: `You're averaging ${weekStats.avgSleep}h of sleep, meeting your goal!` });
  }

  // Workout
  const workoutGoal = goals.weeklyWorkouts || 4;
  if (weekStats.workoutDays < workoutGoal) {
    suggestions.push({ type: 'fitness', priority: 'medium', icon: '💪', title: 'Move More', message: `You've worked out ${weekStats.workoutDays} days this week. Goal: ${workoutGoal} days. Even a 20-minute walk counts!` });
  } else {
    suggestions.push({ type: 'fitness', priority: 'low', icon: '🏆', title: 'Workout Goal Achieved!', message: `Amazing! You've hit your ${workoutGoal}-day workout goal this week!` });
  }

  // Calorie balance
  const calorieGoal = goals.dailyCalories || 2000;
  if (todayStats.caloriesConsumed > calorieGoal * 1.2) {
    suggestions.push({ type: 'nutrition', priority: 'medium', icon: '⚠️', title: 'Calorie Alert', message: `You've consumed ${todayStats.caloriesConsumed} cal today, exceeding your ${calorieGoal} cal goal. Consider lighter meals for the rest of the day.` });
  }

  // General tips
  if (suggestions.length < 3) {
    const tips = [
      { type: 'wellness', priority: 'low', icon: '🧘', title: 'Mindfulness', message: 'Try 5 minutes of deep breathing or meditation to reduce stress and improve focus.' },
      { type: 'nutrition', priority: 'low', icon: '🥗', title: 'Eat Colorfully', message: 'Aim to eat 5 different colored fruits and vegetables today for optimal nutrition.' },
      { type: 'fitness', priority: 'low', icon: '🚶', title: 'Take a Walk', message: 'A 15-minute walk after meals can aid digestion and help regulate blood sugar.' },
    ];
    suggestions.push(tips[Math.floor(Math.random() * tips.length)]);
  }

  return suggestions.sort((a, b) => { const p = { high: 0, medium: 1, low: 2 }; return p[a.priority] - p[b.priority]; });
}

exports.getSuggestions = async (req, res) => {
  try {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);

    const [todayCalories, todayWater, todaySleep, weekWorkouts, weekSleep] = await Promise.all([
      Calorie.find({ user: req.user.id, date: { $gte: today, $lt: tomorrow } }),
      Water.find({ user: req.user.id, date: { $gte: today, $lt: tomorrow } }),
      Sleep.find({ user: req.user.id, date: { $gte: today, $lt: tomorrow } }),
      Workout.find({ user: req.user.id, date: { $gte: weekAgo } }),
      Sleep.find({ user: req.user.id, date: { $gte: weekAgo } }),
    ]);

    const todayStats = {
      caloriesConsumed: todayCalories.reduce((s, c) => s + c.calories, 0),
      waterMl: todayWater.reduce((s, w) => s + w.amount, 0),
      sleepHours: todaySleep.reduce((s, sl) => s + sl.duration, 0),
    };

    const weekStats = {
      avgSleep: weekSleep.length > 0 ? Math.round((weekSleep.reduce((s, sl) => s + sl.duration, 0) / 7) * 10) / 10 : 0,
      workoutDays: new Set(weekWorkouts.map(w => w.date.toISOString().split('T')[0])).size,
    };

    const suggestions = generateSuggestions(req.user, todayStats, weekStats);
    res.json({ success: true, data: suggestions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
