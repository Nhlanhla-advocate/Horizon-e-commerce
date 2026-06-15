const mongoose = require('mongoose');

const paymentAttemptSchema = new mongoose.Schema({
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    amount: { type: Number, default: 0 },
    status: {
        type: String,
        enum: ['pending', 'failed', 'succeeded'],
        default: 'pending',
        index: true
    },
    failureReason: { type: String },
    paymentMethod: { type: String },
    metadata: { type: mongoose.Schema.Types.Mixed },
    flagged: { type: Boolean, default: false, index: true },
    flaggedReason: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('PaymentAttempt', paymentAttemptSchema);
