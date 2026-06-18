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