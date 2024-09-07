const mongoose= required('mongoose');

const cartSchema = new mongoose.schema({
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    items: [
        {
            items: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
            quantity: { type: Number, required: true }
        }
    ]
});

module.exports = mongoose.model('Cart', cartSchema);