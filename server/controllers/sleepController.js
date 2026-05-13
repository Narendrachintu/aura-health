const Sleep = require('../models/Sleep');

// @desc    Get sleep entries
// @route   GET /api/sleep
// @access  Private
exports.getSleepEntries = async (req, res) => {
  try {
    const { startDate, endDate, limit = 30 } = req.query;
    const query = { user: req.user.id };

    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const entries = await Sleep.find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit));

    const avgDuration =
      entries.length > 0
        ? entries.reduce((sum, e) => sum + e.duration, 0) / entries.length
        : 0;

    res.json({
      success: true,
      count: entries.length,
      stats: { avgDuration: Math.round(avgDuration * 10) / 10 },
      data: entries,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add sleep entry
// @route   POST /api/sleep
// @access  Private
exports.addSleep = async (req, res) => {
  try {
    req.body.user = req.user.id;
    const entry = await Sleep.create(req.body);
    res.status(201).json({ success: true, data: entry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update sleep entry
// @route   PUT /api/sleep/:id
// @access  Private
exports.updateSleep = async (req, res) => {
  try {
    let entry = await Sleep.findById(req.params.id);
    if (!entry) {
      return res.status(404).json({ success: false, message: 'Entry not found' });
    }
    if (entry.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    entry = await Sleep.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.json({ success: true, data: entry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete sleep entry
// @route   DELETE /api/sleep/:id
// @access  Private
exports.deleteSleep = async (req, res) => {
  try {
    const entry = await Sleep.findById(req.params.id);
    if (!entry) {
      return res.status(404).json({ success: false, message: 'Entry not found' });
    }
    if (entry.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await Sleep.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Entry deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get sleep stats
// @route   GET /api/sleep/stats
// @access  Private
exports.getSleepStats = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const daily = await Sleep.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          totalDuration: { $sum: '$duration' },
          avgQuality: { $avg: { $indexOfArray: [['poor', 'fair', 'good', 'excellent'], '$quality'] } },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const qualityBreakdown = await Sleep.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: '$quality',
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({ success: true, data: { daily, qualityBreakdown } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
