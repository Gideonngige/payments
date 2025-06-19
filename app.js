const express = require("express");
// const mongoose = require("mongoose");
// const initiateSTKPush = require("./stkpush");
// const Payment = require('./models/payment.model');
// require("dotenv").config();

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
    res.send("Hello from server");
})

app.listen(3500);