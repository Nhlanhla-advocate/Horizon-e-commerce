const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authMiddleware, isAdmin } = require('../middleware/authMiddleware');

// All dashboard routes require admin authentication
router.use(authMiddleware);
router.use(isAdmin);

// Dashboard overview and statistics
router.get('/stats', (req, res) => dashboardController.getDashboardStats(req, res));

module.exports = router;
