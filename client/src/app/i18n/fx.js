export const BASE_CURRENCY = 'ZAR';

// Free, key-less endpoint. Returns { result, base_code, rates: { USD: <1 ZAR in USD>, ... } }.
const RATES_ENDPOINT = `https://open.er-api.com/v6/latest/${BASE_CURRENCY}`;
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

export function getRate(currency) {
    const rate = currentRates[currency];
    return typeof rate === 'number' ? rate : null;
}

export function getRates() {
    return { ...currentRates };
}

export function getRatesLastUpdated() {
    return lastUpdated;
}

export function isSupportedCurrency(currency) {
    return getRate(currency) !== null;
}

export function areRatesStale(maxAgeMs = DEFAULT_MAX_AGE_MS) {
    return Date.now() - lastUpdated > maxAgeMs;
}

const applyRates = (rates, updatedAt) => {
    //Always keep the base at exactly 1 and keep fallback values for anything the API omits. So currencies never silently disappear.
    currentRates = { ...FALLBACK_RATES_FROM_ZAR, ...rates, [BASE_CURRENCY]: 1};
    lastUpdated = updatedAt || Date.now();
};

/** warm the in-memory rates from a previous session's cache (sync, browser-only). */
export function loadCachedRates() {
    if (typeof window === 'undefined') return false;
    try {
        const raw = window.localStorage.getItem(CACHE_KEY);
        if (!raw) return false;
        const parsed = JSON.parse(raw);
        if (parsed && parsed.rates && typeof parsed.rates === 'object') {
            applyRates(parsed.rates, Number(parsed.updatedAt) || 0);
            return true;
        }
    } catch {
        //ignore malformed cache
    }
    return false;
}

/** Fetch the latest rates, update the in-memory map, and cache them. */
export async function refreshRates() {
    const response = await fetch(RATES_ENDPOINT);
    if (!response.ok) {
        throw new Error('Failed to fetch exchange rates.');
    }

    const data = await response.json();
    if (data?.result !== 'success' || !data?.rates || typeof data.rates !== 'object') {
        throw new Error('Unexpected exchange-rate response.');
    }

    const updatedAt = Date.now();
    applyRates(data.rates, updatedAt);

    if (typeof window !== 'undefined') {
        try {
            window.localStorage.setItem(
                CACHE_KEY,
                JSON.stringify({ rates: currentRates, updatedAt })
            );
        } catch {
            //ignore storage failures (private mode, quota).
        }
    }

    return getRates();
}

/**
 * Convert an amount between currencies. Defaults to converting from the store
 * base currency (ZAR), which is how product prices are stored.
 */
export function convert(amount, toCurrency, fromCurrency = BASE_CURRENCY) {
  const value = Number(amount);
  if (!Number.isFinite(value)) return 0;

  const fromRate = getRate(fromCurrency);
  const toRate = getRate(toCurrency);

  // Unknown currency: fall back to the original amount rather than throwing,
  // so a missing rate never blanks out a price in the UI.
  if (fromRate === null || toRate === null) return value;

  const amountInBase = value / fromRate;
  return amountInBase * toRate;
}

/**
 * format a base currency-currency (ZAR) amount in the shopper's currency, localized to their language. Falls back to a manual symbol/grouping if intl is missing.
 */
export function formatCurrency(amount, currency = BASE_CURRENCY, language = 'en') {
    const converted = convert(amount, currency);

    try {
        return new Intl.NumberFormat(language || 'en', {
            style: 'currency',
            currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(converted);
    } catch {
        const grouped = converted 
        .toFixed(2)
        .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return `${currency} ${grouped}`;
    }
}