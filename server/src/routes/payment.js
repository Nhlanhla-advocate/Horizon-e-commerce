const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const paymentController = require('../controllers/paymentController');

router.get('/config', paymentController.getStripeConfig);
router.post('/create-intent', authMiddleware, paymentController.createPaymentIntent);
router.post('/complete', authMiddleware, paymentController.completePayment);

module.exports = router;