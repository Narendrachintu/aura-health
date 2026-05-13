const express = require('express');
const router = express.Router();
const { getDashboard } = require('../controllers/dashboardController');
const { getSuggestions } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', getDashboard);
router.get('/suggestions', getSuggestions);

module.exports = router;
