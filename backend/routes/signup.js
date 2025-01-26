const express = require("express");
const User = require("../models/User");

const router = express.Router();

router.post("/signup", async (req, res) => {
  const {
    name,
    email,
    password,
    role,
    userAge,
    userGender,
    street,
    city,
    state,
    zipCode,
  } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "email already exists" });
    }
    const newUser = new User({
      name,
      email,
      password,
      role,
      userAge,
      userGender,
      street,
      city,
      state,
      zipCode,
    });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error registering user", error });
  }
});

module.exports = router;
