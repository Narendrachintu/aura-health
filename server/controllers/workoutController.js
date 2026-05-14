const mongoose = require('mongoose');
const Workout = require('../models/Workout');

// @desc    Get all workouts for user
// @route   GET /api/workouts
// @access  Private
exports.getWorkouts = async (req, res) => {
  try {
    const { startDate, endDate, type, limit = 50 } = req.query;
    const query = { user: req.user.id };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }
    if (type) query.type = type;

    const workouts = await Workout.find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit));

    // Calculate stats
    const totalCalories = workouts.reduce((sum, w) => sum + w.caloriesBurned, 0);
    const totalDuration = workouts.reduce((sum, w) => sum + w.duration, 0);

    res.json({
      success: true,
      count: workouts.length,
      stats: { totalCalories, totalDuration },
      data: workouts,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add workout
// @route   POST /api/workouts
// @access  Private
exports.addWorkout = async (req, res) => {
  try {
    req.body.user = req.user.id;
    const workout = await Workout.create(req.body);
    res.status(201).json({ success: true, data: workout });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update workout
// @route   PUT /api/workouts/:id
// @access  Private
exports.updateWorkout = async (req, res) => {
  try {
    let workout = await Workout.findById(req.params.id);
    if (!workout) {
      return res.status(404).json({ success: false, message: 'Workout not found' });
    }
    if (workout.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    workout = await Workout.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.json({ success: true, data: workout });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete workout
// @route   DELETE /api/workouts/:id
// @access  Private
exports.deleteWorkout = async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id);
    if (!workout) {
      return res.status(404).json({ success: false, message: 'Workout not found' });
    }
    if (workout.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await Workout.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Workout deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get workout stats
// @route   GET /api/workouts/stats
// @access  Private
exports.getWorkoutStats = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    console.log(`[DEBUG] Workout Stats Fetch for User: ${req.user.email} (${req.user._id})`);
    console.log(`[DEBUG] Days: ${days}, StartDate: ${startDate.toISOString()}`);

    const stats = await Workout.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(req.user.id),
          date: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          totalDuration: { $sum: '$duration' },
          totalCalories: { $sum: '$caloriesBurned' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const typeBreakdown = await Workout.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(req.user.id),
          date: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalDuration: { $sum: '$duration' },
          totalCalories: { $sum: '$caloriesBurned' },
        },
      },
    ]);

    const daily = stats;
    const totalWorkouts = daily.reduce((sum, d) => sum + d.count, 0);
    const totalDuration = daily.reduce((sum, d) => sum + d.totalDuration, 0);
    const totalCaloriesBurned = daily.reduce((sum, d) => sum + d.totalCalories, 0);
    const avgDuration = daily.length > 0 ? totalDuration / daily.length : 0;

    console.log(`[DEBUG] Found ${daily.length} daily stats entries`);
    res.json({ success: true, data: { daily, typeBreakdown, totalWorkouts, totalDuration, totalCaloriesBurned, avgDuration } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
