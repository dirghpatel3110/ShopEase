const express = require('express');
const Cart = require('../models/Cart'); // Import the Cart model

const router = express.Router();

// Add product to cart
router.post('/cart', async (req, res) => {
  try {
    const {
      email, // User email
      id,
      name,
      originalPrice,
      discountedPrice,
      quantity,
      totalAmount,
      category,
      accessories
    } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Create a new cart entry
    const newCartItem = new Cart({
      email,
      id,
      name,
      originalPrice,
      discountedPrice,
      quantity,
      totalAmount,
      category,
      accessories
    });

    // Save the item to the database
    const savedCartItem = await newCartItem.save();

    res.status(201).json({
      message: 'Product added to cart successfully!',
      cartItem: savedCartItem
    });
  } catch (error) {
    console.error('Error adding product to cart:', error.message);
    res.status(500).json({ message: 'Internal server error', error });
  }
});

// Get all cart items for a specific user
router.get('/cart', async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Fetch cart items for the specific user
    const cartItems = await Cart.find({ email });

    res.status(200).json(cartItems);
  } catch (error) {
    console.error('Error fetching cart items:', error.message);
    res.status(500).json({ message: 'Internal server error', error });
  }
});

module.exports = router;
