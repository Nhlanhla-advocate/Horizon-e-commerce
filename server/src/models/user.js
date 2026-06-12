const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const AddressSchema = new mongoose.Schema({
    label: {
        type: String,
        enum: ['home', 'work', 'other'],
        default: 'home'
    },
    fullName: { type: String },
    phone: { type: String },
    street: { type: String },
    city: { type: String },
    state: { type: String },
    postalCode: { type: String },
    country: { type: String },
    isDefault: { type: Boolean, default: false }
}, { _id: true });

const userSchema = new mongoose.Schema({
    // Auth & account
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    username: { type: String, required: true },
    role: {
        type: String,
        enum: ['user', 'admin', 'manager', 'support', 'super_admin'],
        default: 'user'
    },
    permissions: [{ type: String }],
    wishlist: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Wishlist'
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'suspended', 'banned'],
        default: 'active'
    },
    suspendedAt: { type: Date },
    suspensionReason: { type: String },
    bannedAt: { type: Date },
    banReason: { type: String },
    cart: { type: mongoose.Schema.Types.ObjectId, ref: 'Cart' },
    refreshToken: { type: String },
    refreshTokenExpiry: { type: Date },
    tokenBlacklist: [{ type: String }],
    resetPasswordToken: String,
    resetPasswordExpires: Date,

   //Personal Information
   personalInfo: {
    firstName: { type: String },
    lastName: { type: String },
    displayName: { type: String },
    phone: { type: String },
    dateOfBirth: { type: Date },
    bio: { type: String, maxlength: 500 }
},

//Saved addresses (Shipping / billing)
addresses: [AddressSchema],

//Profile photo and optional gallery
avatar: { type: String },
profileImage: [{ type: String }],

// Admin-only settings (used when role is admin / super_admin / manager / support)
twoFactor: {
    enabled: { type: Boolean, default: false },
    secret: { type: String },
    tempSecret: { type: String },
    enabledAt: { type: Date }
},
loginHistory: [{
    at: { type: Date, default: Date.now },
    ip: { type: String },
    userAgent: { type: String },
    success: { type: Boolean, default: true }
}],
notificationPreferences: {
    orderAlerts: { type: Boolean, default: true },
    stockAlerts: { type: Boolean, default: true },
    reviewAlerts: { type: Boolean, default: false },
    securityAlerts: { type: Boolean, default: true },
    weeklyReports: { type: Boolean, default: false }
},

// Site activity (updated by the app, not edited directly by the user)
activity: {
    lastLoginAt: { type: Date },
    lastActiveAt: { type: Date },
    loginCount: { type: Number, default: 0 },
    orderCount: { type: Number, default: 0 },
    lastOrderAt: {type: Date },
    passwordChangedAt: { type: Date }
},

// User preferences and account settings
preferences: {
    newsletter: { type: Boolean, default: false },
    marketingEmails: { type: Boolean, default: false },
    orderUpdates: { type: Boolean, default: true },
    smsNotifications: { type: Boolean, default: false },
    language: { type: String, default: 'en' },
    currency: { type: String, default: 'USD' },
    theme: {
        type: String,
        enum: ['light', 'dark', 'system'],
        default: 'system'
    }
}


}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        this.activity = this.activity || {};
        this.activity.passwordChangedAt = new Date();
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw error;
    }
};

module.exports = mongoose.model('User', userSchema);
