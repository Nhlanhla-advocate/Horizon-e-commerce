const express = require('express');
const router = express.Router();
const { getWishlist, addToWishlist, removeFromWishlist } = require('../controllers/wishListController');
// const { authenticateUser } = require('../middleware/authMiddleware');
const { body } = require('express-validator');

// Get wishlist
router.get('/wishList', getWishlist);

// Add to wishlist
router.post(
    '/wishList',
    // authenticateUser,
    body('productId').isMongoId().withMessage('Invalid product ID'),
    addToWishlist
);

// Remove from wishlist
router.delete(
    '/wishList',
    // authenticateUser,
    body('productId').isMongoId().withMessage('Invalid product ID'),
    removeFromWishlist
);

module.exports = router;
