const axios = require("axios");
require("dotenv").config();

const getAccessToken = async () => {
  const auth = Buffer.from(
    `${process.env.DARAJA_CONSUMER_KEY2}:${process.env.DARAJA_CONSUMER_SECRET2}`
  ).toString("base64");

  const response = await axios.get("https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials", {
    headers: {
      Authorization: `Basic ${auth}`
    }
  });

  return response.data.access_token;
};

module.exports = getAccessToken;