const mongoose = require('mongoose');

const disputeSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['refund', 'dispute', 'complaint'], default: 'refund' },
  status: { type: String, enum: ['open', 'in_review', 'resolved', 'rejected'], default: 'open' },
  reason: { type: String },
  amount: { type: Number },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  resolvedAt: { type: Date },
  resolution: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

disputeSchema.index({ orderId: 1 });
disputeSchema.index({ status: 1 });
disputeSchema.index({ assignedTo: 1 });

module.exports = mongoose.model('Dispute', disputeSchema);
