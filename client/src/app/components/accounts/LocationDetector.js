
'use client';

import { useState } from 'react';
import {
    getCurrencyLabel,
    getLanguageLabel,
    getLocaleForCountry,
} from './localeData';

//Fre, key-less, CORS-enabled reverse geocoding designed for browser use.
const REVERSE_GEOCODE_URL =  'https://api.bigdatacloud.net/data/reverse-geocode-client';

const getCurrentPosition = () => {
    new Promise((resolve, reject) => {
        if (typeof navigator === 'undefined' || !navigator.geolocation) {
            reject(new Error('Location is not supported by this browser.'));
            return;
        }
        navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: false,
            timeout: 10000,
            maximumAge: 5*60*1000, //5 minutes
        });
    });

    const describeGeoError = (error) => {
        if (error && typeof error.code === 'number') {
            if (error.code === 1) return 'Location permission was denied. Enable it to detect your country.';
            if (error.code === 2) return 'Your location is currently unavailable. Please try again.';
            if (error.code === 3) return 'Detecting your location timed out. Please try again.';
        }
        return error?.message || 'Could not detect your location.';  
    };
}