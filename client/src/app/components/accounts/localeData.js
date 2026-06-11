//The location detector

export const LANGUAGES = [
    { code: 'en', label: 'English'},
    { code: 'af', label: 'Afrikaans'},
    { code: 'zu', label: 'Zulu'},
    { code: 'sw', label: 'Swahili'},
    { code: 'fr', label: 'French'},
    { code: 'es', label: 'Spanish'},
    { code: 'de', label: 'German'},
    { code: 'pt', label: 'Portuguese'},
    { code: 'it', label: 'Italian'},
    { code: 'nl', label: 'Dutch'},
    { code: 'ru', label: 'Russian'},
    { code: 'uk', label: 'Ukrainian'},
    { code: 'pl', label: 'Polish'},
    { code: 'cs', label: 'Czech'},
    { code: 'ro', label: 'Romanian'},
    { code: 'hu', label: 'Hungarian'},
    { code: 'el', label: 'Greek'},
    { code: 'sv', label: 'Swedish'},
    { code: 'no', label: 'Norwegian'},
    { code: 'da', label: 'Danish'},
    { code: 'fi', label: 'Finnish'},
    { code: 'tr', label: 'Turkish'},
    { code: 'ar', label: 'Arabic'},
    { code: 'he', label: 'Hebrew'},
    { code: 'fa', label: 'Persian' },
    { code: 'hi', label: 'Hindi' },
    { code: 'bn', label: 'Bengali' },
    { code: 'ur', label: 'Urdu' },
    { code: 'zh', label: 'Chinese' },
    { code: 'ja', label: 'Japanese' },
    { code: 'ko', label: 'Korean' },
    { code: 'th', label: 'Thai' },
    { code: 'vi', label: 'Vietnamese' },
    { code: 'id', label: 'Indonesian' },
    { code: 'ms', label: 'Malay' },
];

// Supported store currencies for the account preferences.
export const CURRENCIES = [
    { code: 'ZAR', label: 'ZAR - South African Rand' },
    { code: 'USD', label: 'USD - US Dollar' },
];

export const DEFAULT_LOCALE = { language: 'en', currency: 'ZAR' };

// Currencies are constrained to the store's currencies list (ZAR/USD). so the detector never suggests a currency the preferences dropdown doesn't offer.
export const COUNTRY_LOCALE = {
    ZA: { language: 'en', currency: 'ZAR' },
    NA: { language: 'en', currency: 'ZAR' },
    US: { language: 'en', currency: 'USD' },
    GB: { language: 'en', currency: 'USD' },
    IE: { language: 'en', currency: 'USD' },
    CA: { language: 'en', currency: 'USD' },
    AU: { language: 'en', currency: 'USD' },
    NZ: { language: 'en', currency: 'USD' },
    FR: { language: 'fr', currency: 'USD' },
    BE: { language: 'nl', currency: 'USD' },
    LU: { language: 'fr', currency: 'USD' },
    DE: { language: 'de', currency: 'USD' },
    AT: { language: 'de', currency: 'USD' },
    CH: { language: 'de', currency: 'USD' },
    ES: { language: 'es', currency: 'USD' },
    MX: { language: 'es', currency: 'USD' },
    AR: { language: 'es', currency: 'USD' },
    CL: { language: 'es', currency: 'USD' },
    CO: { language: 'es', currency: 'USD' },
    PE: { language: 'es', currency: 'USD' },
    PT: { language: 'pt', currency: 'USD' },
    BR: { language: 'pt', currency: 'USD' },
}