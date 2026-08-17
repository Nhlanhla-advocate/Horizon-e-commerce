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