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