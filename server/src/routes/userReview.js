const express = require('express');
const router = express.Router();
const { getUserReviews, editReview, deleteReview } = require('../controllers/userReviewController');


// // Get user reviews by ID
router.get('/reviews', getUserReviews);

// // Edit reviews by ID
router.put('/reviews/:reviewId', editReview);

// // Delete a review by ID
router.delete('/reviews/:reviewId', deleteReview);

module.exports = router;