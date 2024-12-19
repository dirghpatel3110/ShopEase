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
      methods: ["GET", "POST", "DELETE", "PUT"],
      credentials: true,
    })
  );
  
app.use(express.json()); 

app.use("/api/auth",require("./routes/signup") );
app.use("/api/auth",require("./routes/login"));
app.use("/api/auth",require("./routes/products"));
app.use("/api/auth",require("./routes/cart"));

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
