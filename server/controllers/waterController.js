const mongoose = require('mongoose');
const Water = require('../models/Water');

exports.getWaterEntries = async (req, res) => {
  try {
    const { startDate, endDate, limit = 50 } = req.query;
    const query = { user: req.user.id };
    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    const entries = await Water.find(query).sort({ date: -1 }).limit(parseInt(limit));
    const totalAmount = entries.reduce((sum, e) => sum + e.amount, 0);
    res.json({ success: true, count: entries.length, stats: { totalAmount }, data: entries });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addWater = async (req, res) => {
  try {
    req.body.user = req.user.id;
    const entry = await Water.create(req.body);
    res.status(201).json({ success: true, data: entry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteWater = async (req, res) => {
  try {
    const entry = await Water.findById(req.params.id);
    if (!entry) return res.status(404).json({ success: false, message: 'Not found' });
    if (entry.user.toString() !== req.user.id) return res.status(403).json({ success: false, message: 'Not authorized' });
    await Water.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateWater = async (req, res) => {
  try {
    let entry = await Water.findById(req.params.id);
    if (!entry) return res.status(404).json({ success: false, message: 'Not found' });
    if (entry.user.toString() !== req.user.id) return res.status(403).json({ success: false, message: 'Not authorized' });
    entry = await Water.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, data: entry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getTodayWater = async (req, res) => {
  try {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    const entries = await Water.find({ user: req.user.id, date: { $gte: today, $lt: tomorrow } }).sort({ date: -1 });
    const totalAmount = entries.reduce((sum, e) => sum + e.amount, 0);
    res.json({ success: true, data: entries, totalAmount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getWaterStats = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const startDate = new Date(); startDate.setDate(startDate.getDate() - parseInt(days));
    const daily = await Water.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(req.user.id), date: { $gte: startDate } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } }, totalAmount: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
    const totalAmount = daily.reduce((sum, d) => sum + d.totalAmount, 0);
    const avgAmount = daily.length > 0 ? totalAmount / daily.length : 0;

    res.json({ success: true, data: { daily, totalAmount, avgAmount } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
