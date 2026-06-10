'use client';

import { useState } from 'react';
import {
    getCurrencyLabel,
    getLanguageLabel,
    getLocaleForCountry,
} from './localeData';

// Free, key-less, CORS-enabled reverse geocoding designed for browser use.
const REVERSE_GEOCODE_URL = 'https://api.bigdatacloud.net/data/reverse-geocode-client';

const getCurrentPosition = () =>
    new Promise((resolve, reject) => {
        if (typeof navigator === 'undefined' || !navigator.geolocation) {
            reject(new Error('Location is not supported by this browser.'));
            return;
        }
        navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: false,
            timeout: 10000,
            maximumAge: 5 * 60 * 1000, // 5 minutes
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

export default function LocationDetector({ language, currency, onApply, applying }) {
    const [status, setStatus] = useState('idle'); // idle | detecting | detected | error
    const [result, setResult] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');

    const detect = async () => {
        setStatus('detecting');
        setErrorMsg('');
        setResult(null);

        try {
            const position = await getCurrentPosition();
            const { latitude, longitude } = position.coords;

            const response = await fetch(
                `${REVERSE_GEOCODE_URL}?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            );
            if (!response.ok) {
                throw new Error('Could not look up your country. Please try again.');
            }

            const data = await response.json();
            const countryCode = data.countryCode || '';
            const countryName = data.countryName || 'your country';

            if (!countryCode) {
                throw new Error('Could not determine your country from your location.');
            }

            const locale = getLocaleForCountry(countryCode);
            setResult({
                countryCode,
                countryName,
                language: locale.language,
                currency: locale.currency,
            });
            setStatus('detected');
        } catch (err) {
            setErrorMsg(describeGeoError(err));
            setStatus('error');
        }
    };

    const alreadyApplied = result && result.language === language && result.currency === currency;

    return (
        <div className="user-account-locale-detector">
            <div className="user-account-locale-detector-head">
                <div>
                    <strong>Detect my location</strong>
                    <p className="user-account-field-hint">
                        Use your location to suggest the popular language and local currency for your region.
                    </p>
                </div>
                <button
                    type="button"
                    className="user-account-btn user-account-btn-secondary"
                    onClick={detect}
                    disabled={status === 'detecting' || applying}
                >
                    {status === 'detecting' ? 'Detecting...' : 'Detect my location'}
                </button>
            </div>
            {status === 'error' && (
                <p className="user-account-locale-detector-error">{errorMsg}</p>
            )}

            {status === 'detected' && result && (
                <div className="user-account-locale-suggestion">
                    <p>
                        You appear to be in <strong>{result.countryName}</strong>. We can set your
                        language to <strong>{getLanguageLabel(result.language)}</strong> and your
                        currency to <strong>{getCurrencyLabel(result.currency)}</strong>.
                    </p>
                    {alreadyApplied ? (
                        <p className="user-account-field-hint">These preferences are already applied.</p>
                    ) : (
                        <div className="user-account-actions">
                            <button
                                type="button"
                                className="user-account-btn user-account-btn--primary"
                                disabled={applying}
                                onClick={() =>
                                    onApply({ language: result.language, currency: result.currency })
                                }
                            >
                                {applying ? 'Applying...' : 'Apply these settings'}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
