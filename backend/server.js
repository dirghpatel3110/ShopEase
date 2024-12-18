const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
require('dotenv').config();
const app = express();

connectDB();

app.use(
    cors({
      origin: "http://localhost:3000",
      methods: ["GET", "POST", "DELETE"],
      credentials: true,
    })
  );
  
app.use(express.json()); 

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
