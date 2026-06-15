const mongoose = require('mongoose');

const apiKeySchema = new mongoose.Schema({
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    keyPrefix: { type: String, required: true },
    keyHash: { type: String, required: true, unique: true },
    scopes: [{ type: String }],
    active: { type: Boolean, default: true },
    lastUsedAt: { type: Date },
    expiresAt: { type: Date },
}, { timestamps: true });

apiKeySchema.index({ ownerId: 1, active: 1 });

module.exports = mongoose.model('ApiKey', apiKeySchema);
