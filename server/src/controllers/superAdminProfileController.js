const Admin = require('../models/admin');
const User = require('../models/user');
const { deleteLocalUploadIfOwned } = require('../utilities/profileImageStorage');
const { generateSecret, keyuri, verifyToken } = require('../utilities/totp');
const {
    assertSuperAdminAccount,
    loadSuperAdminDocument,
    buildProfileUpdates,
    buildMandatorySuperAdminNotificationUpdates,
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

exports.updateSuperAdminProfile = async (req, res) => {
    try {
        const account = assertSuperAdminAccount(req, res);
        if (!account) return;

        const updates = buildProfileUpdates(req.body);
        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ success: false, error: 'No valid profile fields provided' });
        }

        if (updates.username) {
            const usernameCheck = await checkUsernameAvailable(updates.username, account._id);
            if (!usernameCheck.ok) {
                return res.status(400).json({ success: false, error: usernameCheck.messagemessage });
            }
        }

        const model = reaolveSuperAdminModel(account);
        const doc = await model.findByIdAndUpdate(
            account._id,
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!doc) {
            return res.status(404).json({ success: false, error: 'Super admin not found' });
        }
        res.json({ 
            success: true,
            message: 'Profile updated successfully',
            admin: serializeSuperAdminProfile(doc)
        });
    } catch (error) {
        console.error('Update super admin profile error:', error);
        res.status(500).json({ success: false, error: 'Server error', message: error.message });
    }
};

exports.changeSuperAdminPassword = async (req, res) => {
    try {
        const account = assertSuperAdminAccount(req, res);
        if (!account) return;

        const { currentPassword, newPassword } = req.body;
        const doc = await loadSuperAdminDocument(account);
        if (!doc) {
            return res.status(404).json({ success: false, error: 'Super admin not found' });
        }

        const isMatch = await doc.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ success: false, error: 'Current password is incorrect' });
        }

        doc.password = newPassword;
        await doc.save();

        res.json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        console.error('Change super admin password error:', error);
        res.status(500).json({ success: false, error: 'Server error', message: error.message });
    }
};

exports.uploadSuperAdminAvatar = async (req, res) => {
    try {
        const account = assertSuperAdminAccount(req, res);
        if (!account) return;

        const uploaded = req.uploadedFiles?.[0];
        if (!uploaded) {
            return res.status(400).json({ success: false, error: 'Image file is required' });
        }

        const doc = await loadSuperAdminDocument(account);
        if (!doc) {
            return res.status(404).json({ success: false, error: 'Super admin not found' });
        }

        if (doc.avatar) {
            await deleteLocalUploadIfOwned(doc.avatar, doc._id);
        }

        doc.avatar = uploaded.url;
        await doc.save();

        res.status(201).json({
            success: true,
            message: 'Profile photo updated',
            url: uploaded.url,
            admin: serializeSuperAdminProfile(doc)
        });
    } catch (error) {
        console.error('Upload super admin avatar error:', error);
        res.status(500).json({ success: false, error: 'Server error', message: error.message });
    }
};

exports.getSuperAdminLoginHistory = async (req, res) => {
    try {
        const account = assertSuperAdminAccount(req, res);
        if (!account) return;

        const doc = await loadSuperAdminDocument(account);
        if (!doc) {
            return res.status(404).json({ success: false, error: 'Super admin not found' });
        }

        const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 50);
        const history = Array.isArray(doc.loginHistory)
        ?[...doc.loginHistory].sort((a, b) => new Date(b.at) - new Date(a.at)).slice(0, limit)
        :[];

        res.json({
            success: true,
            loginHistory: history,
            total: doc.loginHistory?.length || 0
        });
    } catch(error) {
        console.error('Get super admin login history error:', error);
        res.status(500).json({ success: false, error: 'Server error', message: error.message});
    }
};

exports.updateSuperAdminNotificationPreferences = async (req, res) => {
    try {
        const account = assertSuperAdminAccount(req, res);
        if (!account) return;

        const updates = buildMandatorySuperAdminNotificationUpdates();
        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ success: false, error: 'No valid notification preferences provided' });
        }
        
        const Model = resolveSuperAdminModel(account);
        const doc = await Model.findByIdAndUpdate(
            account._id,
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!doc) {
            return res.status(404).json({ success: false, error: 'Super admin not found' });
        }

        res.json({
            success: true,
            message: 'Notification preferences updated',
            notificationPreferences: doc.notificationPreferences,
            admin: serializeSuperAdminProfile(doc)
        });
    } catch (error) {
        console.error('Update super admin notification preferences error:', error);
        res.status(500).json({ success: false, error: 'Server error', message: error.message });
    
    }
};

exports.setupSuperAdminTwoFactor = async (req, res) => {
    try {
        const account = assertSuperAdminAccount(req, res);
        if (!account) return;

        const doc = await loadSuperAdminDocument(account);
        if (!doc) {
            return res.status(404).json({ success: false, error: 'Super admin not found' });
        }

        ensureNestedDefaults(doc);
        if (doc.twoFactor.enabled) {
            return res.status(400).json({ success: false, error: 'Two-factor authentication is already enabled' });
        }

        const secret = generateSecret();
        doc.twoFactor.tempSecret = secret;
        await doc.save();

        const issuer = process.env.APP_NAME || 'Horizon E-commerce';
        const otpauthURL = keyuri(doc.email, issuer, secret);

        res.json({
            success: true,
            secret,
            otpauthURL,
            message: 'Scan the otpauth URL in your authenticator app, then verify with a 6 digit code.'
        });
    } catch (error) {
        console.error('Setup super admin two-factor error:', error);
        res.status(500).json({ success: false, error: 'Server error', message: error.message });
    }
};

exports.verifySuperAdminTwoFactor = async (req, res) => {
    try {
        const account = assertSuperAdminAccount(req, res);
        if (!account) return;

        const { token } = req.body;
        const doc = await loadSuperAdminDocument(account);
        if (!doc) {
            return res.status(404).json({ success: false, error: 'Super admin not found' });
        }

        ensureNestedDefaults(doc);
        const secret = doc.twoFactor.tempSecret || doc.twoFactor.secret;
        if (!secret) {
            return res.status(400).json({ success: false, error: 'Run 2FA setup first' });
        }

        if (!verifyToken(token, secret)) {
            return res.status(400).json({ success: false, error: 'Invalid verification code' });
        }

        doc.twoFactor.enabled = true;
        doc.twoFactor.secret = secret;
        doc.twoFactor.tempSecret = undefined;
        doc.twoFactor.enabledAt = new Date();
        await doc.save();

        res.json({
            success: true,
            message: 'Two-factor authentication enabled',
            twoFactor: { enabled: true }
        });
    } catch (error) {
        console.error('Verify super admin 2FA error:', error);
        res.status(500).json({ success: false, error: 'Server error', message: error.message });
    }
};

exports.disableSuperAdminTwoFactor = async (req, res) => {
    try {
        const account = assertSuperAdminAccount(req, res);
        if (!account) return;

        const { currentPassword, token } = req.body;
        const doc = await loadSuperAdminDocument(account);
        if (!doc) {
            return res.status(404).json({ success: false, error: 'Super admin not found' });
        }

        ensureNestedDefaults(doc);
        if (!doc.twoFactor?.enabled) {
            return res.status(400).json({ success: false, error: 'Two-factor authentication is not enabled' });
        }

        const passwordOk = await doc.comparePassword(currentPassword);
        if (!passwordOk) {
            return res.status(400).json({ success: false, error: 'Current password is incorrect' });
        }

        if (doc.twoFactor.secret && !verifyToken(token, doc.twoFactor.secret)) {
            return res.status(400).json({ success: false, error: 'Invalid authenticator code' });
        }

        doc.twoFactor.enabled = false;
        doc.twoFactor.secret = undefined;
        doc.twoFactor.tempSecret = undefined;
        doc.twoFactor.enabledAt = undefined;
        await doc.save();

        res.json({
            success: true,
            message: 'Two-factor authentication disabled',
            twoFactor: { enabled: false }
        });
    } catch (error) {
        console.error('Disable super admin 2FA error:', error);
        res.status(500).json({ success: false, error: 'Server error', message: error.message });
    }
};