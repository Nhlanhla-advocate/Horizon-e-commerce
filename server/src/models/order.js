const mongoose = require('mongoose');
const ItemSchema = require('./Items');

const GuestDetailsSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  address: { type: String, required: true }
}, { _id: false });

const OrderSchema = new mongoose.Schema({
  customerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: function() { return !this.isGuestOrder; }  // Only required for non-guest orders
  },
  items: [ItemSchema],
  totalPrice: { type: Number, required: true },
  status: { type: String, default: 'pending' },
  isGuestOrder: { type: Boolean, default: false },
  guestDetails: {
    type: GuestDetailsSchema,
    required: function() { return this.isGuestOrder; }  // Required only for guest orders
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', OrderSchema);