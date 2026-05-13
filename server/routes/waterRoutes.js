const express = require('express');
const router = express.Router();
const { getWaterEntries, addWater, updateWater, deleteWater, getTodayWater, getWaterStats } = require('../controllers/waterController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/stats', getWaterStats);
router.get('/today', getTodayWater);
router.route('/').get(getWaterEntries).post(addWater);
router.route('/:id').put(updateWater).delete(deleteWater);

module.exports = router;
