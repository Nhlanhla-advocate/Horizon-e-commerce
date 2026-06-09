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
        if (parsed && parsed.rates && typeof parsed.rates === 'objects') {
            applyRates(parsed.rates, Number(parsed.updated.updatedAt) || 0);
            return true;
        }
    } catch {
        //ignore malformed cache
    }
    return false;
}