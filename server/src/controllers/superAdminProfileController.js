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