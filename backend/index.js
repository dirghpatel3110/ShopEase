const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
require('dotenv').config();
const path = require('path');
const fs = require('fs');
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

// Create uploads folder if it doesn't exist
if (!fs.existsSync('./uploads')) {
  fs.mkdirSync('./uploads');
}

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use("/api/auth",require("./routes/signup") );
app.use("/api/auth",require("./routes/login"));
app.use("/api/auth",require("./routes/products"));
app.use("/api/auth",require("./routes/cart"));
app.use("/api/auth",require("./routes/store"));
app.use("/api/auth",require("./routes/transaction"));
app.use("/api/auth",require("./routes/orderitem"));
app.use("/api/auth",require("./routes/salesReport"));
app.use("/api/auth",require("./routes/dailySales"));
app.use("/api/auth",require("./routes/ticketRoutes"));

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
