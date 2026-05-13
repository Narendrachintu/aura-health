const express = require('express');
const router = express.Router();
const { getSleepEntries, addSleep, updateSleep, deleteSleep, getSleepStats } = require('../controllers/sleepController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/stats', getSleepStats);
router.route('/').get(getSleepEntries).post(addSleep);
router.route('/:id').put(updateSleep).delete(deleteSleep);

module.exports = router;
