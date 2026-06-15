const mongoose = require('mongoose');

const securityPolicySchema = new mongoose.Schema({
    singletonKey: {
        type: String,
        default: 'global',
        unique: true
    },
    passwordMinLength: { type: Number, default: 8, min: 6, max: 128 },
    passwordRequireUppercase: { type: Boolean, default: true },
    passwordRequireNumber: { type: Boolean, default: true },
    passwordRequireSpecial: { type: Boolean, default: true },
    sessionTimeoutMinutes: { type: Number, default: 1440, min: 15, max: 10080 },
    maxLoginAttempts: { type: Number, default: 5, min: 3, max: 20 },
    lockoutDurationMinutes: { type: Number, default: 30, min: 5, max: 1440 },
    requireTwoFactorForAdmins: { type: Boolean, default: false },
    requireTwoFactorForSuperAdmins: { type: Boolean, default: true },
    ipAllowlist: [{ type: String }],
    apiKeyDefaultExpiryDays: { type: Number, default: 90, min: 1, max: 365 },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('SecurityPolicy', securityPolicySchema);
