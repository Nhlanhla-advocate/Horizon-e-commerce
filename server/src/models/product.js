const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {type: String, required: true, trim: true },
    description: { type: String },
    images: [{ type: String, required: true }],
    category: { type: String, trim: true },
    stock: { type: Number, default: 0},
    price: { type: Number, required: true },
    availableCount: { type: Number, required: true },
    genre: { type: String, trim: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date},
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);