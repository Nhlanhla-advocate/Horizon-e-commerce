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