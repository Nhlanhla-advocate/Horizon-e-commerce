const mongoose = required('mongoose');

const orderSchema = new mongoose.Schema({
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    items: [
        {
            item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
            quantity: { type: Number, required: true }
        }
    ],
    totalBill: { type: Number, required: true }
});

module.exports = mongoose.model('Order', orderSchema);