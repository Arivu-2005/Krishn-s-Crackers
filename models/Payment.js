const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  orderId: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  status: {
    type: String,
    enum: ['Created', 'Authorized', 'Captured', 'Failed', 'Refunded'],
    default: 'Created'
  },
  method: {
    type: String,
    default: 'Razorpay'
  },
  razorpayOrderId: {
    type: String
  },
  razorpayPaymentId: {
    type: String
  },
  razorpaySignature: {
    type: String
  },
  verified: {
    type: Boolean,
    default: false
  },
  failureReason: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.models.Payment || mongoose.model('Payment', paymentSchema);
