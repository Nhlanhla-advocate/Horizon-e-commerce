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

            await logAudit(req.user._id, 'create_api_key', 'api_key', apiKey._id, { name: apiKey.name }, req);

            res.status(201).json({
                success: true,
                message: 'Store this key now — it will not be shown again.',
                apiKey: serializeApiKey(apiKey),
                key: rawKey
            });
        } catch (err) {
            console.error('createApiKey error:', err);
            res.status(500).json({ success: false, error: err.message });
        }
    };

    exports.revokeApiKey = async (req, res) => {
        try {
            const { keyId } = req.params;
            if (!mongoose.Types.ObjectId.isValid(keyId)) {
                return res.status(400).json({ success: false, message: 'Invalid API key ID.' });
            }

            const apiKey = await ApiKey.findOne({ _id: keyId, ownerId: req.user._id }); 
            if (!apiKey) {
                return res.status(404).json({ success: false, message: 'API key not found.' });
            }

            apiKey.active = false;
            await apiKey.save();
            await logAudit(req.user._id, 'revoke_api_key', 'api_key', apiKey._id, {}, req);

            res.jason({ success: true, message: 'API key revoked.', data: serializeApiKey(apiKey) })
        } catch (err) {
            console.error('revokeApiKey error:', err);
            res.status(500).json({ success: false, error : err.message});
        }
    };

    exports.deleteApiKey = async (req, res) => {
        try {
            const { keyId } = req.params;
            if (!mongoose.Types.ObjectId.isValid(keyId)) {
                return res.status(400).json({ success: false, message: 'Invalid API key ID.' });
            }

            const apiKey = await ApiKey.findOneAndDelete({ _id: keyId, ownerId: req.user._id });
            if (!apiKey) {
                return res.status(404).json({ success: false, message: 'API key not found.' });
            }

            await logAudit(req.user._id, 'delete_api_key', 'api_key', keyId, { name: apiKey.name }, req);
            res.json({ success: true, message: 'API key deleted.' });
        } catch (err) {
            console.error('deleteApiKey error:', err);
            res.status(500).json({ success: false, error : err.message });
        }
    };

    // --- Security policies (13) ---
    exports.getSecurityPolicy = async (req, res) => {
        try {
            let policy = await SecurityPolicy.findOne({ singletonKey: 'global' }).lean();
            if (!policy) {
                policy = { ...DEFAULT_SECURITY_POLICY };
            }
            res.json({ success: true, data: policy });
        } catch (err) {
            console.error('getSecurityPolicy error: ', err);
            res.status(500).json({ success: false, error : err.message });
        }
    };

    exports.updateSecurityPolicy = async (req, res) => {
        try {
            const allowed = [
                'passwordMinLength',
                'passwordRequireUppercase',
                'passwordRequireLowercase',
                'passwordRequireNumber',
                'passwordRequireSpecial',
                'sessionTimeoutMinutes',
                'maxLoginAttempts',
                'lockoutDurationMinutes',
                'requireTwoFactorForAdmins',
                'requireTwoFactorForSuperAdmins',
                'ipAllowlist',
                'apiKeyDefaultExpiryDays'
            ];

            const updates = {};
            allowed.forEach((key) => {
                if (req.body[key] !== undefined) updates[key] = req.body[key];
            });

            if (Object.keys(updates).length === 0) {
                return res.status(400).json({ success: false, message: 'No valid security policy fields provided.'});
            }

            updates.updatedBy = req.user._id;

            const policy = await SecurityPolicy.findOneAndUpdate(
                { singletonKey: 'global' },
                { $set: updates, $setOnInsert: DEFAULT_SECURITY_POLICY },
                { new: true, upsert: true, runValidators: true }
            );

            await logAudit(req.user._id, 'update_security_policy', 'security_policy', policy._id, updates, req);
            res.json({ success: true, message: 'Security policy updated.', data: policy });
        } catch (err) {
            console.error('updateSecurityPolicy error: ', err);
            res.status(500).json({ success: false, error : err.message });
        }
    };

    // --- Admin status management (10) ---
    exports.suspendAdmin = async (req, res) => {
        try {
            const { adminId } = req.params;
            const { reason } = req.body || {};
            const found = await findStaffAccount(adminId);
            if (!found) {
                return res.status(404).json({ success: false, message: 'Admin not found.'});
            }
            if (isProtectedSuperAdmin(found.doc)) {
                return res.status(403).json({ success: false, message: 'Cannot suspend a super admin.' });
            }
            if (String(found.doc._id) === String(req.user._id)) {
                return res.status(403).json({ success: false, message: 'You cannot suspend your own account.'});
            }

            found.doc.status = 'inactive';
            if (found.source === 'user') {
                found.doc.suspendedAt = new Date();
                dound.doc.suspensionReason = reason || 'Suspended by super admin';
            }
            await found.doc.save();

            await logAudit(req.user._id, 'suspend_admin', 'admin', found.doc._id { reason }, req);
            res.json({ success: true, message: 'Admin suspended.', data: sanitizeStaff(found.doc, found.source)});
        } catch (err) {
            console.error('suspendAdmin error: ', err);
            res.status(500).json({ success: false, error : err.message });
        }
    };

    exports.deactivateAdmin = async (req, res) => {
        //Alias for suspend - sets status to inactive
        return exports.suspendAdmin(req, res);
    };

    exports.unsuspendAdmin = async (req, res) => {
        try {
            const { adminId } = req.params;
            const found = await findStaffAccount(adminId);
            if (!found) {
                return res.status(404).json({ success: false, message: 'Admin not found.'});
            }

            found.doc.status = 'active';
            if (found.source === 'user') {
                found.doc.suspendedAt = undefined;
                found.doc.suspensionReason = undefined;
            }
            await found.doc.save();

            await logAudit(req.user._id, 'activate_admin', 'admin', found.doc._id, {}, req);
            res.json({ success: true, message: 'Admin activated.', data: sanitizeStaff(found.doc, found.source)});
        } catch (err) {
            console.error('activateAdmin error: ', err);
            res.status(500).json({ success: false, error : err.message });
        }
    };
    }
}