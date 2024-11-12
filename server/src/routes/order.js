const express = require('express');
const { body } = require('express-validator');
const {
    createOrder,
    getOrderHistory,
    getOrder,
    updateOrderStatus,
    cancelOrder,
    createBulkOrder,
    getOrderAnalytics,
    createGuestOrder
} = require('../controllers/orderController');

const router = express.Router();

router.post(
    '/create',
    [
        body('items').isArray().notEmpty(),
        body('shippingAddress').notEmpty(),
        body('paymentMethod').notEmpty(),
        body('paymentToken').notEmpty()
    ],
    createOrder
);

router.get('/history', getOrderHistory);
router.get('/:id', getOrder);
router.patch(
    '/:id/update-status',
    [body('status').isString().notEmpty()],
    updateOrderStatus
);

router.delete('/:id/cancel', cancelOrder);
router.post('/bulk', createBulkOrder);
router.get('/analytics', getOrderAnalytics);
router.post(
    '/guest',
    [
        body('items').isArray().notEmpty(),
        body('shippingAddress').notEmpty(),
        body('paymentMethod').notEmpty(),
        body('paymentToken').notEmpty(),
        body('guestEmail').isEmail()  
    ],
    createGuestOrder
);

module.exports = router;