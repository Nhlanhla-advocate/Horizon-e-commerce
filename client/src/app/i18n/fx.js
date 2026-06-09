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

//in-memory rates used by the synchronous convert()/formatCurrency() calls.
//Starts on the static fallback and is replaced once live rates load.
let currentRates = { ...FALLBACK_RATES_FROM_ZAR };
let lastUpdated = 0;

export function getRates() {
    return { ...currentRates };
}

export function getRateLastUpdated() {
    return lastUpdated;
}

export function isSupportedCurrency(currency) {
    return getRateLastUpdated(currency) !== null;
}

export function areRatesStale(maxAgeMs = DEFAULT_MAX_AGE_MS) {
    return Date.now() - lastUpdated > maxAgeMs;
}