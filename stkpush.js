// stkpush.js
const axios = require("axios");
const moment = require("moment");
const Payment = require("./models/payment.model");
require("dotenv").config();

const generateAccessToken = require("./daraja");

const initiateSTKPush = async (req, res) => {
  const { phone, amount, sellerId, farmerId, productId, quantity } = req.body;

  const token = await generateAccessToken();
  const timestamp = moment().format("YYYYMMDDHHmmss");
  const password = Buffer.from(
    `${process.env.SHORTCODE}${process.env.PASSKEY}${timestamp}`
  ).toString("base64");

  try {
    const response = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      {
        BusinessShortCode: process.env.SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: amount,
        PartyA: phone,
        PartyB: process.env.SHORTCODE,
        PhoneNumber: phone,
        CallBackURL: process.env.CALLBACK_URL,
        AccountReference: "Farm Link",
        TransactionDesc: "Payment for goods",
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = response.data;

    // Save to DB immediately if request is accepted
    if (data.ResponseCode === "0") {
      const payment = new Payment({
        sellerId,
        farmerId,
        amount,
        productId,
        quantity,
        time: new Date(),
        MerchantRequestID: data.MerchantRequestID,
        CheckoutRequestID: data.CheckoutRequestID,
      });

      await payment.save();
      console.log("Payment saved immediately after STK push");
    }

    res.status(200).json(data);
  } catch (error) {
    console.error("STK Push Error", error.response?.data || error.message);
    res.status(500).json(error.response?.data || { error: error.message });
  }
};

module.exports = initiateSTKPush;
