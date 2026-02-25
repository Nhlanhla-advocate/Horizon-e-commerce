const User = require('../models/user');
const Order = require('../models/order');
const AuditLog = require('../models/auditLog');
const Dispute = require('../models/dispute');
const mongoose = require('mongoose');

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
