const express = require('express');
const OrderItem = require('../models/OrderItem'); // Import the OrderItem model

const router = express.Router();

// Get all order items or filter by transactionId
router.get('/order-items', async (req, res) => {
  try {
    const { transactionId } = req.query; // Optional query parameter to filter by transactionId

    let orderItems;
    if (transactionId) {
      // Fetch order items for a specific transaction
      orderItems = await OrderItem.find({ transactionId }).populate('transactionId', 'orderId name email orderDeliveryDate');
    } else {
      // Fetch all order items
      orderItems = await OrderItem.find().populate('transactionId', 'orderId name email orderDeliveryDate');
    }

    res.status(200).json(orderItems);
  } catch (error) {
    console.error('Error fetching order items:', error.message);
    res.status(500).json({ message: 'Internal server error', error });
  }
});

module.exports = router;
