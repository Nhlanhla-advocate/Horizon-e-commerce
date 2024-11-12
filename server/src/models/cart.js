const mongoose = required('mongoose');
const ItemSchema = require('./ItemSchema');

const cartSchema = new mongoose.schema({
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    items: [ItemSchema],
    totalPrice: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true});

module.exports = mongoose.model('Cart', cartSchema);