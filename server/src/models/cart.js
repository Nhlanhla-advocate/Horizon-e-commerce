const mongoose = require('mongoose');
const ItemSchema = require('./Items');

const cartSchema = new mongoose.Schema({
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    items: [ItemSchema],
    totalPrice: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true});

module.exports = mongoose.model('Cart', cartSchema);