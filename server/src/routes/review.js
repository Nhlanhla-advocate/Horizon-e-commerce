const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const { postReview, getUserReviews, editReview, deleteReview, getProductReviews } = require('../controllers/reviewController'); 

// Public routes
router.get('/product/:productId', getProductReviews);

// Authenticated routes
// Post a review for a product (Authenticated users)
router.post('/:productId', authMiddleware, postReview);

// Get user reviews (Authenticated users)
router.get('/', authMiddleware, getUserReviews);

// Edit a review (Authenticated users)
router.put('/:reviewId', authMiddleware, editReview);

// Delete a review (Authenticated users)
router.delete('/:reviewId', authMiddleware, deleteReview);

module.exports = router;
