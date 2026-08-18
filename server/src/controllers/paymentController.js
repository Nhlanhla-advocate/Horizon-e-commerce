const Cart = require('../models/cart');
const { getStripeClient, isStripeConfigured, toStripeAmount } = require('../utilities/stripeClient');
const cartController = require('./cartController');

const STRIPE_CURRENCY = (process.env.STRIPE_CURRENCY || 'zar').toLowerCase();

async function loadCartForUser(userId) {
  const cart = await Cart.findOne({ customerId: userId }).populate('items.productId');
  if (!cart || cart.items.length === 0) {
    const error = new Error('Your cart is empty');
    error.statusCode = 400;
    throw error;
  }
  return cart;
}

async function buildCartCheckoutSummary(cart) {
  const orderItems = cart.items.map((item) => {
    const product = item.productId && typeof item.productId === 'object' ? item.productId : null;
    const productId = product?._id || item.productId;
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
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || null,
    currency: STRIPE_CURRENCY,
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
    const userId = req.user._id;
    const cart = await loadCartForUser(userId);
    const { totalPrice } = await buildCartCheckoutSummary(cart);
    const amount = toStripeAmount(totalPrice, STRIPE_CURRENCY);

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: STRIPE_CURRENCY,
      automatic_payment_methods: { enabled: true },
      metadata: {
        userId: String(userId),
        cartId: String(cart._id),
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

    const stripe = getStripeClient();
    const userId = req.user._id;
    const cart = await loadCartForUser(userId);
    const { totalPrice } = await buildCartCheckoutSummary(cart);
    const expectedAmount = toStripeAmount(totalPrice, STRIPE_CURRENCY);

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.metadata?.userId !== String(userId)) {
      return res.status(403).json({
        success: false,
        message: 'This payment does not belong to your account',
      });
    }

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({
        success: false,
        message: `Payment is not complete (status: ${paymentIntent.status})`,
      });
    }

    if (paymentIntent.amount !== expectedAmount || paymentIntent.currency !== STRIPE_CURRENCY) {
      return res.status(400).json({
        success: false,
        message: 'Payment amount does not match your cart total. Please refresh and try again.',
      });
    }

    const order = await cartController.createOrderFromCart(userId, {
      paymentIntentId,
      paymentStatus: 'paid',
      orderStatus: 'processing',
    });

    res.status(201).json({
      success: true,
      message: 'Payment successful. Order placed.',
      order,
    });
  } catch (error) {
    console.error('completePayment error:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to complete payment',
    });
  }
};
