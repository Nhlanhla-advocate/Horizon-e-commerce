const Stripe = require('stripe');

let stripeClient = null;

function getStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return null;
  }
  if (!stripeClient) {
    stripeClient = new Stripe(secretKey, {
      apiVersion: '2024-11-20.acacia',
    });
  }
  return stripeClient;
}

function isStripeConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

function toStripeAmount(totalPrice, currency = 'zar') {
  const zeroDecimalCurrencies = new Set(['bif', 'clp', 'djf', 'gnf', 'jpy', 'kmf', 'krw', 'mga', 'pyg', 'rwf', 'ugx', 'vnd', 'vuv', 'xaf', 'xof', 'xpf']);
  const normalized = String(currency || 'zar').toLowerCase();
  if (zeroDecimalCurrencies.has(normalized)) {
    return Math.round(Number(totalPrice) || 0);
  }
  return Math.round((Number(totalPrice) || 0) * 100);
}

module.exports = {
  getStripeClient,
  isStripeConfigured,
  toStripeAmount,
};