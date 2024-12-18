const express = require('express');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const router = express.Router();

// Login Route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists in the database
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Send response with user details and token
    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        userAge: user.userAge,
        userGender: user.userGender,
      },
    });

    console.log(
      `User logged in - Name: ${user.name}, Age: ${user.userAge}, Gender: ${user.userGender}`
    );
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

module.exports = router;
