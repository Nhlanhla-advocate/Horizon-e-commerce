const mongoose = require('mongoose');

const forgotPasswordSchema = new mongoose.Schema({
    email: { type: String, 
            required: true,
            unique: true 
        },
        userId: { type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true },
            resetToken: { type: String,
                required: true },
            expiresAt: { type: Date,
                required: true },
            resetPasswordToken: String,
            resetPasswordToken: Date,
});

const ForgotPassword = mongoose.model('ForgotPassword', forgotPasswordSchema);

module.exports = ForgotPassword;