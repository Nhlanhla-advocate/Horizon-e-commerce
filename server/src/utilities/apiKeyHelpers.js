APIKeyHelpers.js under Utilities.

const crypto = require('crypto');

const KEY_PREFIX = 'hzn_';

const hashApiKey = (rawKey) =>
    crypto.createHash('sha256').update(String(rawKey)).digest('hex');

const generateApiKey = () => {
    const rawKey = ${KEY_PREFIX}${crypto.randomBytes(32).toString('hex')};
    return {
        rawKey,
        keyPrefix: rawKey.slice(0, 12),
        keyHash: hashApiKey(rawKey)
    };
};

const serializeApiKey = (doc) => ({
    _id: doc._id,
    name: doc.name,
    keyPrefix: doc.keyPrefix,
    scopes: doc.scopes || [],
    active: doc.active,
    lastUsedAt: doc.lastUsedAt,
    expiresAt: doc.expiresAt,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt
});

module.exports = {
    KEY_PREFIX,
    hashApiKey,
    generateApiKey,
    serializeApiKey
};