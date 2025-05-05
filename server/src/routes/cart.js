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
router.post('/checkout/:userId', async (req, res) => {
    console.log('Checkout route hit with userId:', req.params.userId);
    try {
        const { userId } = req.params;
        const order = await cartController.createOrderFromCart(userId);
        res.status(200).json({ message: 'Order created successfully', order });
    } catch (error) {
        console.error('Checkout error:', error);
        res.status(500).json({ 
            message: 'Error creating order from cart', 
            error: error.message 
        });
    }
});

module.exports = router;

