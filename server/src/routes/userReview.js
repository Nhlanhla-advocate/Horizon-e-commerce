const express = require('express');
const router = express.Router();
const { reviewController } = require('../controllers/reviewController');
const { authenticateUser } = require('../middleware/authMiddleware');

// Get user reviews by ID
router.get('/reviews/:reviewId', authenticateUser, reviewController.getUserReviews);

// Edit reviews by ID
router.put('/reviews/:reviewId', authenticateUser, reviewController.editReview);

// Delete a review by ID
router.delete('/reviews/:reviewId', authenticateUser, reviewController.deleteReview);

module.exports = router;