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