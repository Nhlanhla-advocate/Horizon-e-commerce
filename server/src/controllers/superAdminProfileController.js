const Admin = require('../models/admin');
const User = require('../models/user');
const { deleteLocalUploadIfOwned } = require('../utilities/profileImageStorage');
const { generateSecret, keyuri, verifyToken } = require('../utilities/totp');
const {
    assertSuperAdminAccount,
    loadSuperAdminDocument,
    buildProfileUpdates,
    buildNotificationUpdates,
    ensureNestedDefaults,
    serializeSuperAdminProfile,
    checkUsernameAvailable
} = require('../utilities/adminProfileHelpers');

const resolveSuperAdminModel = (account) => {
    if (account.constructor?.modelName === 'User') return User;
    return Admin;
};

exports.getSuperAdminProfile = async (req, res) => {
    try {
        const account = assertSuperAdminAccount(req, res);
        if(!account) return;

        const doc = await loadSuperAdminDocument(account);
        if(!doc) {
            return res.status(404).json({ success: false, error: 'Super admin not found' });
        }

        res.json({
            success: true,
            admin: serializeSuperAdminProfile(doc)
        });
    } catch (error) {
        console.error('Get super admin profile error:', error);
        res.status(500).json({ success: false, error: 'Server error', message: error.message });
    }
}