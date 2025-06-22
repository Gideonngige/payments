// server.js
const express = require("express");
const mongoose = require("mongoose");
const initiateSTKPush = require("./stkpush");
const Payment = require('./models/payment.model');
require("dotenv").config();
const axios = require('axios');
const cors = require('cors');
const app = express();

const bodyParser = require("body-parser");
const initiateB2C = require("./b2c");
const Payment2 = require("./models/payment.model2");
app.use(bodyParser.json());


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


// gemini api
const API_KEY = process.env.API_KEY;
app.use(cors());
app.use(express.json());

app.post('/chat', async (req, res) => {
  const { message } = req.body;

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
      {
        contents: [{ parts: [{ text: message }] }]
      },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );

    const reply = response.data.candidates[0].content.parts[0].text;
    res.json({ reply });
  } catch (err) {
    console.error('Gemini API error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Error from Gemini API', details: err.response?.data });
  }
});


// business to customer api
app.post("/b2c/send", initiateB2C);

app.post("/b2c/result", async (req, res) => {
  const result = req.body.Result;
  console.log("B2C Result:", result);

  const params = {};
  result.ResultParameters?.ResultParameter?.forEach(p => {
    params[p.Key] = p.Value;
  });

  const payment = new Payment2({
    phone: params.ReceiverPartyPublicName,
    amount: params.TransactionAmount,
    receipt: params.TransactionReceipt,
    transactionDate: params.TransactionCompletedDateTime
  });

  await payment.save();
  console.log("Payment saved:", payment);
  res.status(200).send("B2C result received");
});

app.post("/b2c/timeout", (req, res) => {
  console.log("B2C Timeout:", req.body);
  res.status(200).send("Timeout handled");
});





const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
