export const BASE_CURRENCY = 'ZAR';

// Free, key-less endpoint. Returns { result, base_code, rates: { USD: <1 ZAR in USD>, ... } }.
const RATES_ENDPOINT = https://open.er-api.com/v6/latest/${BASE_CURRENCY};
const CACHE_KEY = 'fxRatesZAR';
export const DEFAULT_MAX_AGE_MS = 60 * 60 * 1000; // 1 hour

// Value of 1 ZAR in the target currency (offline fallback / initial seed).
const FALLBACK_RATES_FROM_ZAR = {
  ZAR: 1,
  USD: 0.054,
};