const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
    // Keep field name aligned with controller/populate usage.
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true },
    name: { type: String },
    image: { type: String }
}, { _id: false });

const cartSchema = new mongoose.Schema({
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [ItemSchema],
    totalPrice: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true});

module.exports = mongoose.model('Cart', cartSchema);