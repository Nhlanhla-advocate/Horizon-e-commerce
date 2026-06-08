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


