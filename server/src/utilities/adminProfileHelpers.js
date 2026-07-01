const Admin = require('../models/admin');
const User = require('../models/user');

const ADMIN_ROLES = ['admin', 'super_admin', 'manager', 'support'];
const MAX_LOGIN_HISTORY = 50;
const PROFILE_FIELDS = '-password';

const MANDATORY_SUPER_ADMIN_NOTIFICATIONS = {
    orderAlerts: true,
    stockAlerts: true,
    reviewAlerts: true,
    securityAlerts: true,
    weeklyReports: true,
};

const isAdminRole = (role) => {
    const normalized = role?.toString().toLowerCase().trim();
    return ADMIN_ROLES.includes(role) || ADMIN_ROLES.includes(normalized);
};

const isLoopbackIp = (ip) => {
    if (!ip) return true;
    const normalized = String(ip).trim().toLowerCase();
    return (
        normalized === '::1' ||
        normalized === '127.0.0.1' ||
        normalized === 'localhost' ||
        normalized.startsWith('::ffff:127.0.0.1')
    );
};

const normalizeIp = (ip) => {
    const trimmed = String(ip).trim();
    if (trimmed.startsWith('::ffff:')) {
        return trimmed.slice(7);
    }
    return trimmed;
};

const isValidIp = (ip) => {
    if (!ip || typeof ip !== 'string') return false;
    const trimmed = ip.trim();
    const ipv4 = /^(\d{1,3}\.){3}\d{1,3}$/;
    const ipv6 = /^([0-9a-fA-F]{0,4}:){1,7}[0-9a-fA-F]{0,4}$/;
    return ipv4.test(trimmed) || ipv6.test(trimmed);
};

const getClientIp = (req) => {
    const candidates = [];

    const clientHeader = req.headers['x-client-public-ip'];
    if (typeof clientHeader === 'string' && clientHeader.length > 0) {
        candidates.push(clientHeader.trim());
    }

    if (req.body?.clientIp && typeof req.body.clientIp === 'string') {
        candidates.push(req.body.clientIp.trim());
    }

    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string' && forwarded.length > 0) {
        candidates.push(forwarded.split(',')[0].trim());
    }

    const socketIp = req.socket?.remoteAddress || req.ip || '';
    if (socketIp) {
        candidates.push(String(socketIp).trim());
    }

    for (const ip of candidates) {
        if (isValidIp(ip) && !isLoopbackIp(ip)) {
            return normalizeIp(ip);
        }
    }

    for (const ip of candidates) {
        if (isValidIp(ip)) {
            return normalizeIp(ip);
        }
    }

    return candidates[0] ? normalizeIp(candidates[0]) : '';
};

const getUserAgent = (req) =>
    typeof req.headers['user-agent'] === 'string' ? req.headers['user-agent'] : '';

/** Ensure the request carries an admin-level account. */
const assertAdminAccount = (req, res) => {
    const account = req.admin || req.user;
    if (!account) {
        res.status(401).json({ success: false, error: 'Authentication required' });
        return null;
    }
    if (!isAdminRole(account.role)) {
        res.status(403).json({ success: false, error: 'Access denied. Admin privileges required.' });
        return null;
    }
    return account;
};

/** Reload the writable Mongoose document (Admin or User collection). */
const loadAdminDocument = async (account) => {
    if (!account?._id) return null;
    if (account.constructor?.modelName === 'Admin') {
        return Admin.findById(account._id);
    }
    if (account.constructor?.modelName === 'User') {
        return User.findById(account._id);
    }
    const adminDoc = await Admin.findById(account._id);
    if (adminDoc) return adminDoc;
    return User.findById(account._id);
};

/** Reload a super-admin account from Admin or User collections. */
const loadSuperAdminDocument = async (account) => {
    const doc = await loadAdminDocument(account);
    if (!doc || doc.role !== 'super_admin') return null;
    return doc;
};

const buildProfileUpdates = (body) => {
    const { username, personalInfo } = body;
    const updates = {};

    if (username !== undefined) updates.username = username;
    if (personalInfo && typeof personalInfo === 'object') {
        Object.entries(personalInfo).forEach(([key, value]) => {
            updates[`personalInfo.${key}`] = value;
        });
    }

    return updates;
};

const buildNotificationUpdates = (body) => {
    const prefs = body.notificationPreferences || body;
    const allowed = ['orderAlerts', 'stockAlerts', 'reviewAlerts', 'securityAlerts', 'weeklyReports'];
    const updates = {};

    allowed.forEach((key) => {
        if (prefs[key] !== undefined) {
            updates[`notificationPreferences.${key}`] = Boolean(prefs[key]);
        }
    });

    return updates;
};

const buildMandatorySuperAdminNotificationUpdates = () => {
    const updates = {};
    Object.keys(MANDATORY_SUPER_ADMIN_NOTIFICATIONS).forEach((key) => {
        updates[`notificationPreferences.${key}`] = true;
    });
    return updates;
};

const resolveNotificationPreferences = (doc) => {
    if (doc.role === 'super_admin') {
        return { ...MANDATORY_SUPER_ADMIN_NOTIFICATIONS };
    }
    return doc.notificationPreferences || {
        orderAlerts: true,
        stockAlerts: true,
        reviewAlerts: false,
        securityAlerts: true,
        weeklyReports: false,
    };
};

const ensureNestedDefaults = (doc) => {
    if (!doc.personalInfo) doc.personalInfo = {};
    if (!doc.twoFactor) doc.twoFactor = { enabled: false };
    if (!doc.notificationPreferences) {
        doc.notificationPreferences = {
            orderAlerts: true,
            stockAlerts: true,
            reviewAlerts: false,
            securityAlerts: true,
            weeklyReports: false
        };
    }
    if (!Array.isArray(doc.loginHistory)) doc.loginHistory = [];
};

const serializeAdminProfile = (doc) => ({
    _id: doc._id,
    username: doc.username,
    email: doc.email,
    role: doc.role,
    status: doc.status,
    lastLogin: doc.lastLogin,
    personalInfo: doc.personalInfo || {},
    avatar: doc.avatar || null,
    twoFactor: {
        enabled: Boolean(doc.twoFactor?.enabled)
    },
    notificationPreferences: resolveNotificationPreferences(doc),
    loginHistory: Array.isArray(doc.loginHistory)
        ? [...doc.loginHistory]
            .sort((a, b) => new Date(b.at) - new Date(a.at))
            .slice(0, MAX_LOGIN_HISTORY)
        : [],
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt
});

/** Ensure the request carries a super-admin account. */
const assertSuperAdminAccount = (req, res) => {
    const account = req.admin || req.user;
    if (!account) {
        res.status(401).json({ success: false, error: 'Authentication required' });
        return null;
    }
    if (account.role !== 'super_admin') {
        res.status(403).json({ success: false, error: 'Access denied. Super admin only.' });
        return null;
    }
    return account;
};

const serializeSuperAdminProfile = (doc) => ({
    ...serializeAdminProfile(doc),
    permissions: Array.isArray(doc.permissions) ? doc.permissions : []
});

const recordAdminLogin = async (account, req, { success = true } = {}) => {
    const doc = await loadAdminDocument(account);
    if (!doc) return;

    ensureNestedDefaults(doc);

    const entry = {
        at: new Date(),
        ip: getClientIp(req),
        userAgent: getUserAgent(req),
        success: Boolean(success)
    };

    doc.loginHistory.unshift(entry);
    if (doc.loginHistory.length > MAX_LOGIN_HISTORY) {
        doc.loginHistory = doc.loginHistory.slice(0, MAX_LOGIN_HISTORY);
    }

    if (success) {
        doc.lastLogin = entry.at;
    }

    await doc.save();
};

const checkUsernameAvailable = async (username, excludeId) => {
    const normalized = String(username || '').trim();
    if (!normalized) return { ok: false, message: 'Username is required' };

    const adminMatch = await Admin.findOne({ username: normalized, _id: { $ne: excludeId } });
    if (adminMatch) return { ok: false, message: 'Username is already in use' };

    const userMatch = await User.findOne({ username: normalized, _id: { $ne: excludeId } });
    if (userMatch) return { ok: false, message: 'Username is already in use' };

    return { ok: true };
};

module.exports = {
    ADMIN_ROLES,
    MAX_LOGIN_HISTORY,
    PROFILE_FIELDS,
    isAdminRole,
    getClientIp,
    getUserAgent,
    assertAdminAccount,
    assertSuperAdminAccount,
    loadAdminDocument,
    loadSuperAdminDocument,
    buildProfileUpdates,
    buildNotificationUpdates,
    buildMandatorySuperAdminNotificationUpdates,
    MANDATORY_SUPER_ADMIN_NOTIFICATIONS,
    resolveNotificationPreferences,
    ensureNestedDefaults,
    serializeAdminProfile,
    serializeSuperAdminProfile,
    recordAdminLogin,
    checkUsernameAvailable
};
