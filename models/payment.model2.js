const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  phone: String,
  amount: Number,
  receipt: String,
  transactionDate: String
}, { timestamps: true });

module.exports = mongoose.model("Payment2", paymentSchema);