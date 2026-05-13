const express = require('express');
const router = express.Router();
const { getWorkouts, addWorkout, updateWorkout, deleteWorkout, getWorkoutStats } = require('../controllers/workoutController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/stats', getWorkoutStats);
router.route('/').get(getWorkouts).post(addWorkout);
router.route('/:id').put(updateWorkout).delete(deleteWorkout);

module.exports = router;
