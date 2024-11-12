const express = require('express');
const router = express.Router();
const wishListController = require('../controllers/wishListController');
const { authenticateUser } = require('../middleware/authMiddleware');
const { body } = require('express-validator');

// Get wishlist
router.get('/wishList', authenticateUser, wishListController.getWishlist);

// Add to wishlist
router.post(
    '/wishList',
    authenticateUser,
    body('productId').isMongoId().withMessage('Invalid product ID'),
    wishListController.addToWishlist
);

// Remove from wishlist
router.delete(
    '/wishList',
    authenticateUser,
    body('productId').isMongoId().withMessage('Invalid product ID'),
    wishListController.removeFromWishlist
);

module.exports = router;
