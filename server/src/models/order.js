const mongoose = require('mongoose');
const ItemSchema = require('./Items');

const OrderSchema = new mongoose.Schema({
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [ ItemSchema],
    totalPrice: { type: Number, required: true },
    status: { type: String, default: 'pending'},
    createdAt: { type: Date, default: Date.now}
});

module.exports = mongoose.model('Order', OrderSchema);