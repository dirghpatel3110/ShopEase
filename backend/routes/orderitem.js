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

router.get('/order-items', async (req, res) => {
    try {
      const { email, transactionId } = req.query; // Query parameters for filtering
  
      if (!email) {
        return res.status(400).json({ message: 'Email is required.' });
      }
  
      let orderItems;
  
      if (transactionId) {
        // Fetch order items for a specific transaction and email
        orderItems = await OrderItem.find({ transactionId })
          .populate({
            path: 'transactionId',
            match: { email }, // Filter transactions by email
            select: 'orderId name email orderDeliveryDate orderStatus',
          });
      } else {
        // Fetch all order items for a specific email
        orderItems = await OrderItem.find()
          .populate({
            path: 'transactionId',
            match: { email }, // Filter transactions by email
            select: 'orderId name email orderDeliveryDate orderStatus',
          });
      }
  
      // Filter out any null results (transactions that don't match the email)
      orderItems = orderItems.filter((item) => item.transactionId !== null);
  
      res.status(200).json(orderItems);
    } catch (error) {
      console.error('Error fetching order items:', error.message);
      res.status(500).json({ message: 'Internal server error', error });
    }
  });
  
  

module.exports = router;
