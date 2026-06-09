'use client';

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';

import { fetchWithUserAuth } from '@/app/utils/userAuthFetch';

import {
    areRatesStale,
    BASE_CURRENCY,
    DEFAULT_MAX_AGE_MS,
    formatCurrency,
    isSupportedCurrency,
    loadCachedRates,
    refreshRates,
} from './fx';

import { FALLBACK_LANGUAGE, MESSAGES } from './messages';

import {
    getCachedTranslation,
    initTranslationCache,
    requestTranslation,
    subscribeTranslations,
} from './translator';


const STORAGE_KEY = 'localePreferences';
export const DEFAULT_LOCALE = { language: FALLBACK_LANGUAGE, currency: BASE_CURRENCY };

const LocaleContext = createContext(null);

const sanitize = (locale) => {
    const next = { ...DEFAULT_LOCALE};
    if (locale && typeof locale.language === 'string' && locale.language.trim()) {
        next.language = locale.language.trim();
    }
    if (locale && typeof locale.currency === 'string' && isSupportedCurrency(locale.currency)) {
        next.currency = locale.currency;
    }
    return next;
};

const readCachedLocale = () => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? sanitize(JSON.parse(raw)) : null;
    } catch {
      return null;
    }
  };
  
  const interpolate = (template, vars) => {
    if (!vars || typeof template !== 'string') return template;
    return template.replace(/\{(\w+)\}/g, (match, name) =>
      Object.prototype.hasOwnProperty.call(vars, name) ? String(vars[name]) : match
    );
  };

  // Resolve the template for a key in this order:
//   1. curated translation in the active language (messages.js wins)
//   2. cached/auto machine-translation of the English source
//   3. the English source itself (shown while MT loads, or if it fails)
//   4. the raw key (only if even English is missing)
// When falling through to MT, fire a one-shot translation request in the
// background; the provider re-renders via subscribeTranslations once it lands.
const resolveTemplate = (language, key, { allowMachineTranslation = true } = {}) => {
    const curated = MESSAGES[language]?.[key];
    if (curated != null) return curated;
  
    const enText = MESSAGES[FALLBACK_LANGUAGE]?.[key];
    if (enText == null) return key;
    if (language === FALLBACK_LANGUAGE) return enText;
  
    const cached = getCachedTranslation(language, enText);
    if (cached != null) return cached;
  
    if (allowMachineTranslation) requestTranslation(language, enText);
    return enText;
  };
  
  const translate = (language, key, vars, options) =>
    interpolate(resolveTemplate(language, key, options), vars);

  export function LocaleProvider({ children }) {
    // Start from defaults so server and first client render match (avoids hydration
    // mismatch); real preferences are applied in the effect below.
    const [locale, setLocaleState] = useState(DEFAULT_LOCALE);
    // Bumped whenever live FX rates change, to re-run formatPrice for consumers.
    const [ratesVersion, setRatesVersion] = useState(0);
    // Bumped whenever a new auto-translation is cached, to re-run t() for consumers.
    const [translationVersion, setTranslationVersion] = useState(0);
  
    const persist = useCallback((next) => {
      if (typeof window === 'undefined') return;
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Ignore storage failures (private mode, quota) — in-memory locale still works.
      }
    }, []);

    const setLocale = useCallback(
      (partial) => {
        setLocaleState((prev) => {
          const next = sanitize({ ...prev, ...partial });
          persist(next);
          return next;
        });
      },
      [persist]
    );

    useEffect(() => {
      const cached = readCachedLocale();
      if (cached) setLocaleState(cached);

      const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : null;
      if (!token) return;
  
      let active = true;
      (async () => {
        try {
          const res = await fetchWithUserAuth('/user/profile');
          if (!active || !res.ok) return;
          const user = await res.json();
          const prefs = user?.preferences;
          if (prefs && (prefs.language || prefs.currency)) {
            const next = sanitize({ language: prefs.language, currency: prefs.currency });
            setLocaleState(next);
            persist(next);
          }
        } catch {
          // Keep cached/default locale if the profile lookup fails.
        }
      })();
  
      return () => {
        active = false;
      };
    }, [persist]);

      // Live exchange rates: warm from cache, refresh if stale, then poll hourly.
  useEffect(() => {
    if (loadCachedRates()) {
      setRatesVersion((v) => v + 1);
    }

    let active = true;
    const sync = async () => {
      try {
        await refreshRates();
        if (active) setRatesVersion((v) => v + 1);
      } catch {
        // Keep cached/fallback rates if the refresh fails.
      }
    };

    if (areRatesStale(DEFAULT_MAX_AGE_MS)) {
      sync();
    }

    const intervalId = setInterval(sync, DEFAULT_MAX_AGE_MS);
    return () => {
      active = false;
      clearInterval(intervalId);
    };
  }, []);
    })