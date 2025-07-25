const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  farmer_id: { type: Number, required: true },
  message: { type: String, required: true },
  reply: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Chat', chatSchema);
