const User = require('../models/user');
const Order = require('../models/order');
const AuditLog = require('../models/auditLog');
const Dispute = require('../models/dispute');
const mongoose = require('mongoose');
const user = require('../models/user');

const ROLES = ['admin', 'manager', 'support'];
const VALID_ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

async function logAudit(userId, action, resource, resourceId, details, req) {
    await AuditLog.create({
        userId,
        action,
        resource,
        resourceId: resourceId || undefined,
        details: details || {},
        ip: req?.ip || req?.get?.('user-agent')
    });
}

//---1. Create, edit, delete admin account (superadmin only)---
async function createAdmin(req, res) {
    try {
        const { email, username, password, role, permissions } = req.body;
        if (!email || !username || !password) {
            return res.status(400).json({ success: false, message: 'Email, username and password are required.'})
        }const assignedRole = role && ROLES.includes(role) ? role : 'admin';
        const existing = await User.findOne({ $or: [{ email }, { username }] });
        if (existing) {
            return res.status(400).json({ success: false, message: 'User with this email or username already exists.'});
        }
        const admin = await User.create({
            email,
            username,
            password,
            role: assignedRole,
            permissions: Array.isArray(permissions) ? permissions : [],
            status: 'active'
        });
        await logAudit(req.user._id,'create_admin','user',admin._id, { email, username, role: assignedRole }, req);
        const out = admin.toObject();
        delete out.password;
        delete out.refreshToken;
        delete out.tokenBlacklist;
        return res.status(201).json({ success: true, data: out });
    } catch (err) {
        console.error('createAdmin error:', err);
        return res.status(500).json({ success: false, error: err.message });
    }
}

async function updateAdmin(req, res) {
    try {
        const { adminId } = req.params;
        const { username, email, role, permissions, status } = req.body;
        if (!mongoose.Types.ObjectId.isValid(adminId)) {
            return res.status(400).json({ success: false, message: 'Invalid admin ID.'});
        }
        const admin = await User.findById(adminId);
        if (!admin) {
            return res.status(403).json({ success: false, message: 'Cannot edit another super admin.'});
        }
        if (ROLES.includes(admin.role) || admin.role === 'admin') {
            //staff admin
        } else {
            return res.status(400).json({ success: false, message: 'Target user is not an admin.'});
        }
        if (username != null) admin.username = username;
        if (email != null) admin.email = email;
        if (role != null && ROLES.includes(role)) admin.role = role;
        if (Array.isArray(permissions)) admin.permissions = permissions;
        if (status != null && ['active', 'inactive'].includes(status)) admin.status = status;
        await admin.save();
        await logAudit(req.user._id, 'update_admin', 'user', admin._id, { email: admin.email, role: admin.role },req);
        const out = admin.toObject();
        delete out.password;
        delete out.refreshToken;
        delete out.tokenBlacklist;
        return res.json({ success: true, data: out });
    } catch (err) {
        console.error('updateAdmin error:', err);
        return res.status(500).json({ success: false, error: err.message });
    }
}

async function deleteAdmin(req, res) {
    try {
        const { adminId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(adminId)) {
            return res.status(400).json({ success: false, message: 'invalid adminID.'});
        }
        const admin = await User.findById(adminId);
        if (!admin) {
            return res.status(404).json({ success: false, message: 'Admin not found.'});
        }
        if (admin.role === 'super_admin') {
            return res.status(403).json({ success: false, message: 'Cannot delete a super admin.'});
        }
        const staffRoles = ['admin', 'manager', 'support'];
        if (!staffRoles.includes(admin.role)) {
            return res.status(400).json({ success: false, message: 'Target user is not an admin.'});
        }
        await User.findByIdAndDelete(adminId);
        await logAudit(req.user._id, 'delete_admin', 'user', adminId, { email: admin.email }, req);
        return res.json({ success: true, message: 'Admin deleted successfully.'});
    } catch (err) {
        console.error('deleteAdmin error:', err);
        return res.status(500).json({ success: false, error: err.message });
    }
}

//---2. Assign roles and permissions---
async function assignRole(req, res) {
    try {
        const { adminId } = req.params;
        const { role, permissions } = req.body;
        if (!mongoose.Types.ObjectId.isValid(adminId)) {
            return res.status(400).json({ success: false, message: 'invalid admin ID.'});
        }
        const admin = await User.findById(adminId);
        if(!admin) {
            return res.status(404).json({ success: false, message: 'User not found.'});
        }
        if (admin.role ==='super_admin') {
            return res.status(403).json({ success: false, message: 'Cannot change supoer admin role.'});
        }
        if (role && ROLES.includes(role)) {
            admin.role = role;
        }
        if (Array.isArray(permissions)) {
            admin.permissions = permissions;
        }
        await admin.save();
        await logAudit(req.user._id, 'assign_role', 'user', admin._id, { role: admin.role, permissions: admin.permissions }, req);
        const out = admin.toObject();
        delete out.password;
        return res.json({ success: true, data: out });
    } catch (err) {
        console.error('assignRole error:', err);
        return res.status(500).json({ success: false, error: err.message });
    }
}

//---3. List admins (who can access what is enforced by requireSuperAdmin on route)---
async function listAdmins(req, res) {
    try {
        const filter = { role: { $in: ['admin', 'manager', 'support', 'super_admin']}};
        const admins = await User.find(filter)
        .select('-password -refreshToken -tokenBlacklist -resetPasswordToken -resetPasswordExpires')
        .sort({ createdAt: -1 })
        .lean();
        return res.json({ success: true, data: admins });
    } catch (err) {
        console.error('listAdmins error:', err);
        return res.status(500).json({ success: false, error: err.message });
    }
}

//--- 4. View and manage all users (getAllUsers in dashboard; super admin can also suspend or ban) ---
async function suspendUser(req, res) {
    try {
        const { userId } = req.params;
        const { reason } = req.body || {};
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ success: false, message: 'Invalid user ID.'});
        }
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.'});
        }
        if (['super_admin', 'admin', 'manager', 'support'].includes(user.role)) {
            return res.status(403).json({ success: false, message: 'Use admin management to suspend staff.'});
        }
        user.status = 'suspended';
        user.suspendedAt = new Date();
        user.suspensionReason = reason || '';
        user.bannedAt = undefined;
        user.banReason = undefined;
        await user.save();
        await logAudit(req.user._id, 'suspended_user', 'user', user._id, { reason: user.suspensionReason }, req);
        return res.json({ success: true, message: 'User suspended.', data: { _id: user._id, status: user.status}});
    } catch (err) {
        console.error('suspendUser error:', err);
        return res.status(500).json({ success: false, error: err.message });
    }
}

async function unsuspendUser(req, res) {
    try {
        const { userId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ success: false,message: 'Invalid user ID.'});
        }
        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({ success: false, message: 'User not found.'});
        }
        user.status = 'active';
        user.suspendedAt = undefined;
        user.suspensionReason = undefined;
        await user.save();
        await logAudit(req.user._id, 'unsuspend_user', 'user', user._id, {}, req);
        return res.json({ success: true, message: 'User unsuspended.', data: { _id: user._id, status: user.status}});
    } catch (err) {
        console.error('unsuspendUser error:', err);
        return res.status(500).json({ success: false, error: err.message });
    }
}

async function banUser(req, res) {
    try {
        const { userId } = req.params;
        const { reason } = req.body || {};
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ success: false, message: 'Invalid user ID.'});
        }
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.'});
        }
        if (user.role === 'super_admin') {
            return res.status(403).json({ success: false, message: 'Cannot ban a super admin.'});
        }
        user.status = 'banned';
        user.bannedAt = new Date();
        user.banReason = reason || '';
        user.suspendedAt = undefined;
        user.suspensionReason = undefined;
        await user.save();
        await logAudit(req.user._id, 'ban_user', 'user', user._id, { reason: user.banReason }, req);
        return res.json({ success: true, message: 'User banned.', data: { _id: user._id, status: user.status}});
    } catch (err) {
        console.error('banUser error:', err);
        return res.status(500).json({ success: false, error: err.message });
    }
}

async function unbanUser(req, res) {
    try {
        const { userId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ success: false, message: 'Invalid user ID.'});
        }
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.'});
        }
        user.status = 'active';
        user.bannedAt = undefined;
        user.banReason = undefined;
        await user.save();
        await logAudit(req.user._id, 'unban_user', 'user', user._id, {}, req);
        return res.json({ success: true, message: 'User unbanned.', data: { _id: user._id, status: user.status}});
    } catch (err) {
        console.error('unbanUser error:', err);
        return res.status(500).json({ success: false, error: err.message });
    }
}

// --- 6. View and override orders ---
async function overrideOrder(req, res) {
    try {
        const { orderId } = req.params;
        const { status, overrideReason   = req.body;
            if (!mongoose.Types.ObjectId.isValid(orderId)) {
                return res.status(400).json({ success: false, message: 'Invalid order ID.'});
            }
            if (!status || !VALID_ORDER_STATUSES.includes(status)) {
                return res.status(400).json({ success: false, message: 'Valid status is required.', validStatuses: VALID_ORDER_STATUSES});
            }
            const order = await Order.findById(orderId);
            if (!order) {
                return res.status(404).json({ success: false, message: 'Order not found.'});
            }
        }
    }
}

module.exports = {
    createAdmin,
    listAdmins,
    updateAdmin,
    deleteAdmin,
    assignRole,
    suspendUser,
    unsuspendUser,
    banUser,
    unbanUser,
    overrideOrder
};