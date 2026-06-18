const mongoose = require('mongoose');
const Admin = require('../models/admin');
const User = require('../models/user');
const ApiKey = require('../models/apiKey');
const SecurityPolicy = require('..models/securityPolicy');
const { ROLES_WITH_PERMISSION } = require('../middleware/authMiddleware');
const { logAudit } = require('../utilities/auditLogHelpers');
const { generateApiKey, serializeApiKey } = require('../utilities/apiKeyHelpers');

const STAFF_ROLES = ['admin', 'manager', 'support'];
const ALL_STAFF_ROLES = [...STAFF_ROLES, 'super_admin'];

const DEFAULT_SECURITY_POLICY = {
    singletonKey: 'global',
    passwordMiniLength: 8,
    passwordRequireUppercase: true,
    passwordRequireLowercase: true,
    passwordRequireNumber: true,
    passwordRequireSpecial: true,
    sessionTimeoutMinutes: 1440,
    maxLoginAttempts: 5,
    lockoutDurationMinutes: 30,
    requireTwoFactorForSuperAdmins: true,
    ipAllowlist: [],
    apiKeyDefaultExpiryDays: 90
};

const sanitizeStaff = (doc, source = 'user') => {
    const out = typeof doc.toObject === 'function' ? doc.toObject() : { ...doc };
    delete out.password;
    delete out.refreshToken;
    delete out.tokenBlacklist;
    delete out.twoFactor;
    return { ...out, accountSource: source};
};

const findStaffAccount = async (adminId) => {
    if (!mongoose.Types.ObjectId.isValid(adminId)) return null;
    const user = await User.findById(adminId);
    if (user && ALL_STAFF_ROLES.includes(user.role)) {
        return { doc: user, model: User, source: 'user' };
    }
    const admin = await Admin.findById(adminId);
    if (admin) {
        return { doc: admin, model: Admin, source: 'admin'};
    }
    return null;
};

const isProtectedSuperAdmin = (doc) => doc.role === 'super_admin';

// --- API keys (7) ---
exports.listApiKeys = async (req, res) => {
    try {
        const keys = await ApiKey.find({ ownerId: req.user._id })
            .sort({ createdAt: -1 })
            .lean();
        res.json({ success: true, data: keys.map(serializeApiKey) });
    } catch (err) {
        console.error('listApiKeys error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.createApiKey = async (req, res) => {
    try {
        const { name, scopes, expiresInDays } = req.body;
        if (!name || !String(name).trim()) {
            return res.status(400).json({ success: false, message: 'API key name is required.'});
        }
        const policy = await SecurityPolicy.findOne({ singletonKey: 'global' });
        const defaultDays = policy?.apiKeyDefaultExpiryDays || DEFAULT_SECURITY_POLICY.apiKeyDefaultExpiryDays;
        const days = Number(expiresInDays) > 0 ? Number(expiresInDays) : defaultDays;
        const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

        const { rawKey, keyPrefix, keyHash } = generateApiKey();
        const allowedScopes = Object.keys(ROLES_WITH_PERMISSION);
        const resolvedScopes = Array.isArray(scopes)
            ? scopes.filter((scope) => allowedScopes.includes(scope))
            : [];

            const apiKey = await ApiKey.create({
                ownerId: req.user._id,
                name: String(name).trim(),
                keyPrefix,
                keyHash,
                scopes: resolvedScopes,
                expiresAt
            });
    }
}