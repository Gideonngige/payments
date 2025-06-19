// server.js
const express = require("express");
const mongoose = require("mongoose");
const initiateSTKPush = require("./stkpush");
const Payment = require('./models/payment.model');
require("dotenv").config();

const app = express();
app.use(express.json());


mongoose.connect('mongodb+srv://ushindigideon01:%40mongodb2024@cluster0.lc4qeak.mongodb.net/FarmLink?retryWrites=true&w=majority&appName=Cluster0')
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB connection error:', err));

app.post("/api/stkpush", initiateSTKPush);


app.get('/', (req, res) => {
    res.send("Hello from server");
})
// Callback URL endpoint
app.post("/callback", async (req, res) => {
  const callback = req.body.Body.stkCallback;
  console.log("callback function outside")

  // Only save if transaction was successful
  if (callback.ResultCode === 0) {
    const metadata = callback.CallbackMetadata.Item;
    console.log("Callback function inside");
    
    const getValue = (name) => {
      const found = metadata.find(i => i.Name === name);
      return found ? found.Value : null;
    };

    const payment = new Payment({
      MerchantRequestID: callback.MerchantRequestID,
      CheckoutRequestID: callback.CheckoutRequestID,
      ResultCode: callback.ResultCode,
      ResultDesc: callback.ResultDesc,
      Amount: getValue("Amount"),
      MpesaReceiptNumber: getValue("MpesaReceiptNumber"),
      PhoneNumber: getValue("PhoneNumber"),
      TransactionDate: getValue("TransactionDate")
    });

    try {
      await payment.save();
      console.log("Payment saved:", payment);
      res.status(200).send("Payment received and saved");
    } catch (err) {
      console.error("Error saving payment:", err);
      res.status(500).send("Server error");
    }
  } else {
    console.log("Transaction failed:", callback);
    res.status(200).send("Failed transaction received");
  }
});




app.get("/payments", async (req, res) => {
  const all = await Payment.find().sort({ createdAt: -1 });
  res.json(all);
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
