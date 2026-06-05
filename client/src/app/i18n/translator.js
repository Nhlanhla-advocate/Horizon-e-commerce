const ENDPOINT =  'https://api.mymemory.translated.net/get';
const STORAGE_KEY = 'i18nMtCache';
const SOURCE_LANG = 'eng'

//How long before a failed translation may be retrieved.
const RETRY_AFTER_MS = 60 * 1000; // 1 minute