const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
// Add item to cart
router.post('/add', cartController.addToCart);

// Remove a single item from cart
router.post('/remove', cartController.removeFromCart);

// Keep customer cart even when a user logs out
router.get('/:userId', cartController.getCart);

// Convert cart items to an order
router.post('/:userId/checkout', async (req, res) => {
    try {
        const { userId } = req.params;
        const order = await cartController.createOrderFromCart(userId);
        res.status(200).json({ message: 'Order created successfully', order });
    } catch (error) {
        res.status(500).json({ message: 'Error creating order from cart', error });
    }
});

module.exports = router;

