const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/add', cartController.addToCart);
router.post('/remove', cartController.removeFromCart);
router.post('/update-quantity', cartController.updateItemQuantity);
router.delete('/clear/:userId', cartController.clearCart);
router.delete('/clear', cartController.clearCart);
router.post('/checkout/:userId', cartController.checkoutCart);
router.post('/checkout', cartController.checkoutCart);
router.get('/:userId', cartController.getCart);
router.get('/', cartController.getCart);

module.exports = router;
