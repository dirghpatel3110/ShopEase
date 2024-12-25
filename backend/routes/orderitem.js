const express = require('express');
const OrderItem = require('../models/OrderItem'); 
const Transaction = require("../models/Transaction");// Import the OrderItem model

const router = express.Router();

// Get all order items or filter by transactionId
router.get('/order-items', async (req, res) => {
  try {
    const { transactionId } = req.query; // Optional query parameter to filter by transactionId

    let orderItems;
    if (transactionId) {
      // Fetch order items for a specific transaction
      orderItems = await OrderItem.find({ transactionId }).populate('transactionId', 'orderId name email orderDeliveryDate orderStatus');
    } else {
      // Fetch all order items
      orderItems = await OrderItem.find().populate('transactionId', 'orderId name email orderDeliveryDate orderStatus');
    }

    res.status(200).json(orderItems);
  } catch (error) {
    console.error('Error fetching order items:', error.message);
    res.status(500).json({ message: 'Internal server error', error });
  }
});

router.get('/user-orders', async (req, res) => {
    try {
      const { email } = req.query;
  
      // Validate email
      if (!email) {
        return res.status(400).json({ message: 'Email is required.' });
      }
  
      // Query the orders for the specific email
      const userOrders = await OrderItem.find({ email }).populate({
        path: 'transactionId',
        select: 'name email orderId orderDeliveryDate orderStatus',
      });
  
      // If no orders are found
      if (userOrders.length === 0) {
        return res.status(404).json({ message: 'No orders found for this user.' });
      }
  
      // Return the user's orders
      res.status(200).json(userOrders);
    } catch (error) {
      console.error('Error fetching user orders:', error.message);
      res.status(500).json({ message: 'Internal server error', error });
    }
  });
  
  
  
  
  

module.exports = router;
