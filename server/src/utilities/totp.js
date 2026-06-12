// Minimal RFC 6238 TOTP implementation using Node's crypto.
// Dependency-free on purpose: npm install is blocked in some environments, and
// the algorithm is small and stable. Compatible with Google Authenticator,
// Authy, 1Password, etc. (SHA-1, 6 digits, 30-second steps — the app defaults).

const crypto = require('crypto');

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const DIGITS = 6;
const STEP_SECONDS = 30;

const base32Encode = (buffer) => {
    let bits = 0;
    let value = 0;
    let output = '';
    for (const byte of buffer) {
        value = (value << 8) | byte;
        bits += 8;
        while (bits >= 5) {
            output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
            bits -= 5;
        }
    }
    if (bits > 0) {
        output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
    }
    return output;
};

const base32Decode = (input) => {
    const cleaned = String(input || '').toUpperCase().replace(/[^A-Z2-7]/g, '');
    let bits = 0;
    let value = 0;
    const bytes = [];
    for (const char of cleaned) {
        value = (value << 5) | BASE32_ALPHABET.indexOf(char);
        bits += 5;
        if (bits >= 8) {
            bytes.push((value >>> (bits - 8)) & 0xff);
            bits -= 8;
        }
    }
    return Buffer.from(bytes);
};

/** Generate a new random base32 secret (160 bits, the RFC-recommended size). */
const generateSecret = () => base32Encode(crypto.randomBytes(20));

/** Build the otpauth:// URL that authenticator apps consume (usually via QR code). */
const keyuri = (accountName, issuer, secret) => {
    const label = encodeURIComponent(`${issuer}:${accountName}`);
    const params = new URLSearchParams({
        secret,
        issuer,
        algorithm: 'SHA1',
        digits: String(DIGITS),
        period: String(STEP_SECONDS)
    });
    return `otpauth://totp/${label}?${params.toString()}`;
};

const hotp = (secretBuffer, counter) => {
    const counterBuffer = Buffer.alloc(8);
    counterBuffer.writeBigUInt64BE(BigInt(counter));
    const hmac = crypto.createHmac('sha1', secretBuffer).update(counterBuffer).digest();
    const offset = hmac[hmac.length - 1] & 0x0f;
    const code =
        ((hmac[offset] & 0x7f) << 24) |
        ((hmac[offset + 1] & 0xff) << 16) |
        ((hmac[offset + 2] & 0xff) << 8) |
        (hmac[offset + 3] & 0xff);
    return String(code % 10 ** DIGITS).padStart(DIGITS, '0');
};

/**
 * Verify a 6-digit TOTP token against a base32 secret.
 * Accepts the previous/next time step too (±30s) to absorb clock drift.
 */
const verifyToken = (token, secret, window = 1) => {
    const normalized = String(token || '').replace(/\s+/g, '');
    if (!/^\d{6}$/.test(normalized) || !secret) return false;

    const secretBuffer = base32Decode(secret);
    if (secretBuffer.length === 0) return false;

    const currentStep = Math.floor(Date.now() / 1000 / STEP_SECONDS);
    for (let offset = -window; offset <= window; offset += 1) {
        const expected = hotp(secretBuffer, currentStep + offset);
        if (crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(normalized))) {
            return true;
        }
    }
    return false;
};

module.exports = {
    generateSecret,
    keyuri,
    verifyToken
};
