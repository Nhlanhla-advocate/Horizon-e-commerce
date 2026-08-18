const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { getStripeClient, isStripeConfigured, toStripeAmount } = require('../utilities/stripeClient');
const cartController = require('./cartController');

const STRIPE_CURRENCY = (process.env.STRIPE_CURRENCY || 'Zar').toLowerCase();

async function loadCartForUser(userId) {
  const cart = await Cart.findOne({ customerId: userId }).populate('items.productId');
  if (!cart || cart.items.length === 0) {
    const error = new Error('Your cart is empty');
    error.statusCode = 400;
    throw error;
  }
  return cart;
}

async function buildCartCheckoutSummmary(cart) {
  const orderItems = cart.items.map((item) => {
    const product = item.productId && typeof item.productId === 'object' ? item.productId : null;
    const productId = product? ._id || item.productId;
    const price = item.price != null ? Number(item.price) : Number(product?.price) || 0;

    if (product && product.stock < item.quantity) {
      const error = new Error(`Insufficient stock for ${product.name || 'a product'}`);
      error.statusCode = 400;
      throw error;
    }

    return {
      productId,
      name: item.name || product?.name || 'Product',
      quantity: item.quantity,
      price,
    };
  });

  const totalPrice = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
};

if (!(totalPrice > 0)) {
  const error = new Error('Unable to calculate order total from cart items');
  error.statusCode = 400;
  throw error;
}

return { orderItems, totalPrice };
}

exports.getStripeConfig = (req, res) => {
  res.json({ 
    enabled: isStripeConfigured(),
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || null, currency: STRIPE_CURRENCY,
  });
};

exports.createPaymentIntent = async (req, res) => {
  try {
    if (!isStripeConfigured()) {
      return res.status(503).json({
        success: false,
        message: 'Stripe is not configured. Set STRIPE_SECRET_KEY on the server.',
      });
    }

    const stripe = getStripeClient();
    const userId = req.user ._id;
    const cart = await loadCartForUser(userId);
    const { totalPrice } = await buildCartCheckoutSummmary(cart);
    const amount = toStripeAmount(totalPrice, STRIPE_CURRENCY);

    const paymentIntent = await stripe.paymentIntents.create({ amount,
      currency: STRIPE_CURRENCY,
      automatic_payment_methods: { enabled: true },
      metadata: {
        userId: String(userId),
        cartId: String(cart.id),
      },
      description: `Horizon order for user ${userId}`,
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: totalPrice,
      currency: STRIPE_CURRENCY,
    });
  } catch (error) {
    console.error('createPaymentIntent error:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to create payment intent',
    });
  }
};

exports.completePayment = async (req, res) => {
  try {
    if (!isStripeConfigured()) {
      return res.status(503).json({
        success: false,
        message: 'Stripe is not configured.',
      });
    }

    const { paymentIntentId } = req.body || {};
    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        message: 'paymentIntentId is required',
      });
    }