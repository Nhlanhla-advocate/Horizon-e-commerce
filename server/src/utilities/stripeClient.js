const Stripe = require('stripe');

let stripeClient = null;
let stripeClientKey = null;

function getSecretKey() {
  return String(process.env.STRIPE_SECRET_KEY || '').trim();
}

function getPublishableKey() {
  return String(
    process.env.STRIPE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
      '',
  ).trim();
}

function getStripeClient() {
  const secretKey = getSecretKey();
  if (!secretKey) {
    return null;
  }
  if (!secretKey.startsWith('sk_')) {
    throw new Error(
      'STRIPE_SECRET_KEY must start with sk_test_ or sk_live_. Do not put a publishable key (pk_...) there.',
    );
  }
  if (!stripeClient || stripeClientKey !== secretKey) {
    stripeClient = new Stripe(secretKey, {
      apiVersion: '2024-11-20.acacia',
    });
    stripeClientKey = secretKey;
  }
  return stripeClient;
}

function isStripeConfigured() {
  const secretKey = getSecretKey();
  return Boolean(secretKey) && secretKey.startsWith('sk_');
}

function toStripeAmount(totalPrice, currency = 'zar') {
  const zeroDecimalCurrencies = new Set([
    'bif', 'clp', 'djf', 'gnf', 'jpy', 'kmf', 'krw', 'mga', 'pyg', 'rwf', 'ugx', 'vnd', 'vuv', 'xaf', 'xof', 'xpf',
  ]);
  const normalized = String(currency || 'zar').toLowerCase();
  if (zeroDecimalCurrencies.has(normalized)) {
    return Math.round(Number(totalPrice) || 0);
  }
  return Math.round((Number(totalPrice) || 0) * 100);
}

module.exports = {
  getStripeClient,
  getPublishableKey,
  isStripeConfigured,
  toStripeAmount,
};
