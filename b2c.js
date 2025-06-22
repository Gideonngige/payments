const axios = require("axios");
const getAccessToken = require("./darajaToken");
require("dotenv").config();

const initiateB2C = async (req, res) => {
  try {
    const token = await getAccessToken();

    const b2cPayload = {
      InitiatorName: process.env.INITIATOR_NAME,
      SecurityCredential: process.env.SECURITY_CREDENTIAL,
      CommandID: "BusinessPayment",
      Amount: req.body.amount,
      PartyA: process.env.SHORTCODE2,
      PartyB: req.body.phone, // e.g., 2547XXXXXX
      Remarks: "Salary payment",
      QueueTimeOutURL: process.env.TIMEOUT_URL,
      ResultURL: process.env.RESULT_URL,
      Occasion: "Monthly Salary"
    };

    const response = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/b2c/v1/paymentrequest",
      b2cPayload,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    res.status(200).json(response.data);
  } catch (err) {
    console.error("B2C Error:", err.response?.data || err.message);
    res.status(500).json({ error: "B2C failed" });
  }
};

module.exports = initiateB2C;
