const express = require('express');
const router = express.Router();
const { getWishlist, addToWishlist, removeFromWishlist } = require('../controllers/wishListController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { body } = require('express-validator');

// Get wishlist
router.get('/', authMiddleware, getWishlist);

// Add to wishlist
router.post(
    '/',
    authMiddleware,
    body('productId').isMongoId().withMessage('Invalid product ID'),
    addToWishlist
);

// Remove from wishlist
router.delete(
    '/',
    authMiddleware,
    body('productId').isMongoId().withMessage('Invalid product ID'),
    removeFromWishlist
);

module.exports = router;
