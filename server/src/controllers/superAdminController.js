const User = require('../models/user');
const Admin = require('../models/admin');
const Order = require('../models/order');
const AuditLog = require('../models/auditLog');
const Dispute = require('../models/dispute');
const mongoose = require('mongoose');
const { logAudit } = require('../utilities/auditLogHelpers');
const {
    sanitizeStaff,
    STAFF_ROLES,
    findStaffAccount
} = require('./superAdminManagementController');
const { normalizeNotificationPreferences } = require('../utilities/adminProfileHelpers');

const ROLES = STAFF_ROLES;
const VALID_ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
const ALL_PERMISSIONS = [
    'manage_products',
    'manage_orders',
    'view_users',
    'manage_users',
    'manage_admins',
    'view_audit_logs',
    'view_system_activity',
    'suspend_ban_users',
    'override_orders'
];

//---1. Create, edit, delete admin account (superadmin only)---
async function createAdmin(req, res) {
    try {
        const { email, username, password, role, permissions, notificationPreferences } = req.body;
        if (!email || !username || !password) {
            return res.status(400).json({ success: false, message: 'Email, username and password are required.'});
        }
        const assignedRole = role && ROLES.includes(role) ? role : 'admin';
        const resolvedPermissions = Array.isArray(permissions)
            ? permissions.filter((p) => ALL_PERMISSIONS.includes(p))
            : [];
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        const existingAdmin = await Admin.findOne({ $or: [{ email }, { username }] });
        if (existingUser || existingAdmin) {
            return res.status(400).json({ success: false, message: 'User with this email or username already exists.'});
        }
        const admin = await User.create({
            email,
            username,
            password,
            role: assignedRole,
            permissions: resolvedPermissions,
            status: 'active',
            notificationPreferences: normalizeNotificationPreferences(notificationPreferences),
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
        const { username, email, role, permissions, status, notificationPreferences } = req.body;
        if (!mongoose.Types.ObjectId.isValid(adminId)) {
            return res.status(400).json({ success: false, message: 'Invalid admin ID.'});
        }

        const found = await findStaffAccount(adminId);
        if (!found) {
            return res.status(404).json({ success: false, message: 'Admin not found.'});
        }
        const admin = found.doc;
        if (admin.role === 'super_admin') {
            return res.status(403).json({ success: false, message: 'Cannot edit another super admin.'});
        }
        if (String(admin._id) === String(req.user._id)) {
            return res.status(403).json({ success: false, message: 'Use profile settings to edit your own account.'});
        }

        if (username != null) admin.username = username;
        if (email != null) admin.email = email;
        if (role != null && ROLES.includes(role)) admin.role = role;
        if (Array.isArray(permissions)) {
            admin.permissions = permissions.filter((p) => ALL_PERMISSIONS.includes(p));
        }
        if (status != null && ['active', 'inactive'].includes(status)) admin.status = status;
        if (notificationPreferences != null) {
            admin.notificationPreferences = normalizeNotificationPreferences(notificationPreferences);
        }
        await admin.save();
        await logAudit(req.user._id, 'update_admin', 'admin', admin._id, { email: admin.email, role: admin.role, accountSource: found.source }, req);
        return res.json({ success: true, data: sanitizeStaff(admin, found.source) });
    } catch (err) {
        console.error('updateAdmin error:', err);
        return res.status(500).json({ success: false, error: err.message });
    }
}

async function deleteAdmin(req, res) {
    try {
        const { adminId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(adminId)) {
            return res.status(400).json({ success: false, message: 'Invalid admin ID.'});
        }

        const found = await findStaffAccount(adminId);
        if (!found) {
            return res.status(404).json({ success: false, message: 'Admin not found.'});
        }
        if (found.doc.role === 'super_admin') {
            return res.status(403).json({ success: false, message: 'Cannot delete a super admin.'});
        }
        if (String(found.doc._id) === String(req.user._id)) {
            return res.status(403).json({ success: false, message: 'You cannot delete your own account.'});
        }

        await found.model.findByIdAndDelete(adminId);
        await logAudit(req.user._id, 'delete_admin', 'admin', adminId, { email: found.doc.email, accountSource: found.source }, req);
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
            return res.status(400).json({ success: false, message: 'Invalid admin ID.'});
        }

        const found = await findStaffAccount(adminId);
        if (!found) {
            return res.status(404).json({ success: false, message: 'Admin not found.'});
        }
        const admin = found.doc;
        if (admin.role === 'super_admin') {
            return res.status(403).json({ success: false, message: 'Cannot change super admin role.'});
        }

        if (role && ROLES.includes(role)) {
            admin.role = role;
        }
        if (Array.isArray(permissions)) {
            admin.permissions = permissions.filter((p) => ALL_PERMISSIONS.includes(p));
        }
        await admin.save();
        await logAudit(req.user._id, 'assign_role', 'admin', admin._id, { role: admin.role, permissions: admin.permissions, accountSource: found.source }, req);
        return res.json({ success: true, data: sanitizeStaff(admin, found.source) });
    } catch (err) {
        console.error('assignRole error:', err);
        return res.status(500).json({ success: false, error: err.message });
    }
}

//---3. List admins (who can access what is enforced by requireSuperAdmin on route)---
async function listAdmins(req, res) {
    try {
        const [userAdmins, adminAccounts] = await Promise.all([
            User.find({ role: { $in: ['admin', 'manager', 'support', 'super_admin'] } })
                .select('-password -refreshToken -tokenBlacklist -resetPasswordToken -resetPasswordExpires -twoFactor.secret -twoFactor.tempSecret')
                .sort({ createdAt: -1 })
                .lean(),
            Admin.find({ role: { $in: ['admin', 'super_admin'] } })
                .select('-password -twoFactor.secret -twoFactor.tempSecret')
                .sort({ createdAt: -1 })
                .lean()
        ]);

        const data = [
            ...userAdmins.map((item) => sanitizeStaff(item, 'user')),
            ...adminAccounts.map((item) => sanitizeStaff(item, 'admin'))
        ];

        return res.json({ success: true, data });
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

// --- 5. View and override orders ---
async function overrideOrder(req, res) {
    try {
        const { orderId } = req.params;
        const { status, overrideReason } = req.body || {};
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
        order.status = status;
        order.overriddenBy = req.user._id;
        order.overrideReason = overrideReason || '';
        order.overriddenAt = new Date();
        await order.save();
        await logAudit(req.user._id, 'override_order', 'order', order._id, { status, overrideReason }, req);
        return res.json({ success: true, message: 'Order overridden.', data: order });
    } catch (err) {
        console.error('overrideOrder error:', err);
        return res.status(500).json({ success: false, error: err.message });
    }
}

// ---6. Disputes ---
async function listDisputes(req, res) {
    try {
        const { status, type } = req.query;
        const filter = {};
        if (status) filter.status = status;
        if (type) filter.status = status;
        if (type) filter.type = type;
        const disputes = await Dispute.find(filter)
        .populate('orderId', 'totalPrice status createdAt')
        .populate('userId', 'username email')
        .populate('assignedTo', 'username email')
        .populate('resolvedBy', 'username email')
        .sort({ createdAt: -1 })
        .lean();
        return res.json({ success: true, data: disputes });
    } catch (err) {
        console.error('listDisputes error:', err);
        return res.status(500).json({ success: false, error: err.message });
    }
} 

async function createDispute(req, res) {
    try {
        const { orderId, userId, type, reason } = req.body;
        if (!orderId || !userId) {
            return res.status(400).json({ success: false, message: 'orderId and userId are required.'});
        }
        const dispute = await Dispute.create({ 
            orderId,
            userId,
            type: type || 'general',
            reason: reason || '',
            status: 'open'
        });
        await logAudit(req.user._id, 'creatte_dispute', 'dispute', dispute._id, { orderId, type: dispute.type }, req);
        return res.status(201).json({ success: true, data: dispute });
    } catch (err) {
        console.error('createDispute error:', err);
        return res.status(500).json({ success: false, error: err.message });
    }
}

async function assignDispute(req, res) {
    try {
        const { disputeId} = req.params;
        const { assignedTo } = req.body;
        if (!mongoose.Types.ObjectId.isValid(disputeId)) {
            return res.status(400).json({ success: false, message: 'Invalid dispute ID.'});
        }
        const dispute = await Dispute.findById(disputeId);
        if (!dispute) {
            return res.status(404).json({ success: false, message: 'Dispute not found.'});
        }
        dispute.assignedTo = assignedTo || undefined;
        dispute.status = 'in_review';
        await dispute.save();
        await logAudit(req.user._id, 'assign_dispute', 'dispute', dispute._id, { assignedTo }, req);
        return res.json({ success: true, data: dispute });
    } catch (err) {
        console.error('assignDispute error:', err);
        return res.status(500).json({ success: false, error: err.message });
    }
}

async function resolveDispute(req, res) {
    try {
        const {disputeId} = req.params;
        const { status, resolution } = req.body;
        if (!mongoose.Types.ObjectId.isValid(disputeId)) {
            return res.status(400).json({ success: false, message: 'Invalid dispute ID.'});
        }
        const validStatuses = ['resolved', 'rejected'];
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'status must be resolved or rejected.'});
        }
        const dispute = await Dispute.findById(disputeId);
        if (!dispute) {
            return res.status(404).json({ success: false, message: 'Dispute not found.'});
        }
        dispute.status = status;
        dispute.resolution = resolution || '';
        dispute.resolvedBy = req.user._id;
        dispute.resolvedAt = new Date();
        await dispute.save();
        await logAudit(req.user._id, 'resolve_dispute', 'dispute', dispute._id, { status, resolution }, req);
        return res.json({ success: true, data: dispute });
    } catch (err) {
        console.error('resolveDispute error:', err);
        return res.status(500).json({ success: false, error: err.message });
    }
}

//---7. Audit logs---
    async function getAuditLogs(req, res) {
        try {
            const { page = 1, limit = 50, userId, action, resource, startDate, endDate } = req.query;
            const filter = {};
            if (userId) filter.userId = userId;
            if (action) filter.action = action;
            if (resource) filter.resource = resource;
            if (startDate || endDate) {
                filter.createdAt = {};
                if (startDate) filter.createdAt.$gte = new Date(startDate);
                if (endDate) {
                    const end = new Date(endDate);
                    end.setHours(23, 59, 59, 999);
                    filter.createdAt.$lte = end;
                }
            }
            const skip = (parseInt(page) - 1) * parseInt(limit);
            const [logs, total] = await Promise.all([AuditLog.find(filter)
                .populate('userId', 'username email role')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .lean(),
                AuditLog.countDocuments(filter)
            ]);
            return res.json({
                success: true,
                data: logs,
                pagination: { total, pages: Math.ceil(total / parseInt(limit)), page: parseInt(page), limit: parseInt(limit)}
            });
        } catch (err) {
            console.error('getAuditLogs error:', err);
            return res.status(500).json({ success: false, error: err.message });
        }
    }

    //--- 8. System activity (recent audit + recent logins/ key actions)---
    async function getSystemActivity(req, res) {
        try {
            const limit = Math.min(parseInt(req.query.limit) || 100, 200);
            const recentLogs = await AuditLog.find()
            .populate('userId', 'username email role')
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();
            const byAction = await AuditLog.aggregate([
                { $group: { _id: '$action', count: { $sum: 1 }}},
                { $sort: { count: -1 }},
                { $limit: 20 }
            ]);
            return res.json({
                success: true,
                data: {
                    recentActivity: recentLogs,
                    byAction
                }
            });
        } catch (err) {
            console.error('getSystemActivity error:', err);
            return res.status(500).json({ success: false, error: err.message });
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
    overrideOrder,
    listDisputes,
    createDispute,
    assignDispute,
    resolveDispute,
    getAuditLogs,
    getSystemActivity
};