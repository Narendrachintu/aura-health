const Calorie = require('../models/Calorie');

// @desc    Get calorie entries
// @route   GET /api/calories
// @access  Private
exports.getCalories = async (req, res) => {
  try {
    const { startDate, endDate, mealType, limit = 50 } = req.query;
    const query = { user: req.user.id };

    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    if (mealType) query.mealType = mealType;

    const entries = await Calorie.find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit));

    const totalCalories = entries.reduce((sum, e) => sum + e.calories, 0);
    const totalProtein = entries.reduce((sum, e) => sum + e.protein, 0);
    const totalCarbs = entries.reduce((sum, e) => sum + e.carbs, 0);
    const totalFat = entries.reduce((sum, e) => sum + e.fat, 0);

    res.json({
      success: true,
      count: entries.length,
      stats: { totalCalories, totalProtein, totalCarbs, totalFat },
      data: entries,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add calorie entry
// @route   POST /api/calories
// @access  Private
exports.addCalorie = async (req, res) => {
  try {
    req.body.user = req.user.id;
    const entry = await Calorie.create(req.body);
    res.status(201).json({ success: true, data: entry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update calorie entry
// @route   PUT /api/calories/:id
// @access  Private
exports.updateCalorie = async (req, res) => {
  try {
    let entry = await Calorie.findById(req.params.id);
    if (!entry) {
      return res.status(404).json({ success: false, message: 'Entry not found' });
    }
    if (entry.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    entry = await Calorie.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.json({ success: true, data: entry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete calorie entry
// @route   DELETE /api/calories/:id
// @access  Private
exports.deleteCalorie = async (req, res) => {
  try {
    const entry = await Calorie.findById(req.params.id);
    if (!entry) {
      return res.status(404).json({ success: false, message: 'Entry not found' });
    }
    if (entry.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await Calorie.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Entry deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get calorie stats
// @route   GET /api/calories/stats
// @access  Private
exports.getCalorieStats = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const daily = await Calorie.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          totalCalories: { $sum: '$calories' },
          totalProtein: { $sum: '$protein' },
          totalCarbs: { $sum: '$carbs' },
          totalFat: { $sum: '$fat' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const mealBreakdown = await Calorie.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: '$mealType',
          totalCalories: { $sum: '$calories' },
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({ success: true, data: { daily, mealBreakdown } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
