const express = require('express');
const router = express.Router();
const { getCalories, addCalorie, updateCalorie, deleteCalorie, getCalorieStats } = require('../controllers/calorieController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/stats', getCalorieStats);
router.route('/').get(getCalories).post(addCalorie);
router.route('/:id').put(updateCalorie).delete(deleteCalorie);

module.exports = router;
