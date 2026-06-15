const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const adminSchema = new mongoose.Schema({
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    username: { 
        type: String, 
        required: true 
    },
    role: { 
        type: String, 
        default: 'admin',
        enum: ['admin', 'super_admin']
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    lastLogin: {
        type: Date
    },

    // Personal information shown on the admin's own account page
    personalInfo: {
        firstName: { type: String },
        lastName: { type: String },
        displayName: { type: String },
        phone: { type: String },
        bio: { type: String, maxlength: 500 }
    },

    // Profile photo
    avatar: { type: String },

    // Two-factor authentication (TOTP). `tempSecret` holds the secret between
    // setup and verification; it becomes `secret` once the first code is verified.
    twoFactor: {
        enabled: { type: Boolean, default: false },
        secret: { type: String },
        tempSecret: { type: String },
        enabledAt: { type: Date }
    },

    // Rolling login history (latest entries kept, oldest dropped)
    loginHistory: [{
        at: { type: Date, default: Date.now },
        ip: { type: String },
        userAgent: { type: String },
        success: { type: Boolean, default: true }
    }],

    // Admin notification preferences
    notificationPreferences: {
        orderAlerts: { type: Boolean, default: true },
        stockAlerts: { type: Boolean, default: true },
        reviewAlerts: { type: Boolean, default: false },
        securityAlerts: { type: Boolean, default: true },
        weeklyReports: { type: Boolean, default: false }
    },

    // Granular permissions (e.g. manage_products, view_audit_logs)
    permissions: [{ type: String }]
}, {
    timestamps: true 
});

// Hash password before saving
adminSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password
adminSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw error;
    }
};

module.exports = mongoose.model('Admin', adminSchema); 