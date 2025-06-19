const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  sellerId: Number,
  farmerId: Number,
  amount: Number,
  productId: Number,
  quantity: Number,
  time: {
    type: Date,
    default: Date.now,
  },
  MerchantRequestID: String,
  CheckoutRequestID: String
});

module.exports = mongoose.model('Payment', paymentSchema);
