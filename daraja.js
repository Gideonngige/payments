// daraja.js
const axios = require("axios");
require("dotenv").config();

const generateAccessToken = async () => {
  const auth =
    Buffer.from(`${process.env.DARJA_CONSUMER_KEY}:${process.env.DARJA_CONSUMER_SECRET}`).toString("base64");

  try {
    const response = await axios.get("https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials", {
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });

    return response.data.access_token;
  } catch (error) {
    console.error("Error getting access token", error.response.data);
    return null;
  }
};

module.exports = generateAccessToken;
