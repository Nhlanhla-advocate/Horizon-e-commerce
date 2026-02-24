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
    }
}