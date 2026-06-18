const AuditLog = require('../models/auditLog');
const { getClientIp, getUserAgent } = require('./adminProfileHelpers');

const logAudit = async (userId, action, resource, resourceId, details, req) => {
    await AuditLog.create({
        userId,
        action,
        resource,
        resourceId: resourceId || undefined,
        details: details || {},
        ip: getClientIp(req),
        userAgent: getUserAgent(req)
    });
};

module.exports = { logAudit };