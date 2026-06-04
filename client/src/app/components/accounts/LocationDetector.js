
'use client';

import { useState } from 'react';
import {
    getCurrencyLabel,
    getLanguageLabel,
    getLocaleForCountry,
} from './localeData';

//Fre, key-less, CORS-enabled reverse geocoding designed for browser use.
const REVERSE_GEOCODE_URL =  'https://api.bigdatacloud.net/data/reverse-geocode-client';