const ENDPOINT =  'https://api.mymemory.translated.net/get';
const STORAGE_KEY = 'i18nMtCache';
const SOURCE_LANG = 'eng'

//How long before a failed translation may be retrieved.
const RETRY_AFTER_MS = 60 * 1000; // 1 minute

const memoryCache = new Map();  // ${lang}|${text} -> translated string
const inFlight = new Set();// keys currently being fetched
const failedAt = new Map(); //key -> timestamp of last failure
const subscribers = new Set();

let loaded = false;

const cacheKey = (lang, text) => `${lang}|${text}`;

const notify = () => {
  subscribers.forEach((cb) => {
    try {
      cb();
    } catch {
      //A bad subscriber must not break the others.
    }
  });
};

const persist = () => {
  if (typeof window === 'undefined') return;
  try {
    const obj = {};
    memoryCache.forEach((value, key) => {
      obj[key] = value;
    });
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
  } catch {
    // Ignore storage failures (quota / private mode).
  }
};

/** Load persisted translations into memory once (browser-only, sync). */
export function initTranslationCache() {
  if (loaded || typeof window === 'undefined') return false;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const obj = JSON.parse(raw);
      Object.entries(obj).forEach(([key, value]) => {
        if (typeof value === 'string') memoryCache.set(key, value);
      });
      return memoryCache.size > 0;
    }
  } catch {
    // Ignore malformed cache.
  }
  return false;
}

export function subscribeTranslations(callback) {
  subscribers.add(callback);
  return () => subscribers.delete(callback);
}

export function getCachedTranslation(lang, text) {
  return memoryCache.get(cacheKey(lang, text));
}

//Protect {placeholders} from the translator so interpolation still works after MT.
const protectPlaceholders = (text) => {
  const tokens = [];
  const protectedText = text.replace(/\{(\w+)\}/g, (match) => {
    const index = tokens.push(match) - 1;
    return `[[${index}]]`;
  });
  return { protectedText, tokens };
};

const restorePlaceholders = (text, tokens) => 
  text.replace(/\[\[\[(\d+)\]\]\]/g, (match, index) => tokens[Number(index)]) ?? match;

/*
Ensure a translation for text text into lang exists. Returns the cached value if present. Otherwise kicks off a one_shot fetch and notifies subscribers when it resolves. Safe to call repeatedly (deduped) and during render (no sync state changes)
*/

export function requestTranslation(lang, text) {
  if (!lang || lang === SOURCE_LANG || !text) return undefined;
  const key = cacheKey(lang, text);

  const cached = memoryCache.get(key);
  if (cached !== undefined) return cached;

  if (typeof window === 'undefined') return undefined;
  if (inFlight.has(key)) return undefined;

  const lastFailure = failedAt.get(key);
  if (lastFailure && Date.now() - lastFailure < RETRY_AFTER_MS) return undefined;

  inFlight.add(key);
  const { protectedText, tokens } = protectPlaceholders(text);

  (async () => {
    try {
      const url = `${ENDPOINT}? q=${encodeURIComponent(protectedText)}&langpair=${encodeURIComponent(`${SOURCE_LANG}|${lang}`)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Translation request failed.');
      const data = await res.json();
      const translated = data?.responseData?.translatedText;
      if (typeof translated !== 'string' || !translated.trim()) {
        throw new Error('Empty translation.');
    }
    memoryCache.set(key, restorePlaceholders(translated, tokens));
    failedAt.delete(key);
    persist();
    notify();
    } catch {
      failedAt.set(key, Date.now());
    } finally {
      inFlight.delete(key);
    }
  })();
  return undefined;
}