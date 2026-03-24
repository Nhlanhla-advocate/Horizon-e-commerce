const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    username: { type: String, required: true },
    role: {
        type: String,
        enum: ['user', 'admin', 'manager', 'support', 'super_admin'],
        default: 'user'
    },
    permissions: [{ type: String }], // e.g. 'manage_products', 'manage_orders', 'handle_refunds'
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
    resetPasswordExpires: Date
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