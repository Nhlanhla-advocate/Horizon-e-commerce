const mongoose = require('mongoose');
const { ItemSchema } = require('./dashboard');

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
  overriddenBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  overrideReason: { type: String },
  overriddenAt: { type: Date },
  refundStatus: { type: String, enum: ['none', 'requested', 'approved', 'rejected', 'refunded'], default: 'none' },
  refundedAt: { type: Date },
  refundedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isGuestOrder: { type: Boolean, default: false },
  guestDetails: {
    type: GuestDetailsSchema,
    required: function() { return this.isGuestOrder; }  // Required only for guest orders
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', OrderSchema);