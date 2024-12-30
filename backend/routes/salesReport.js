const express = require('express');
const router = express.Router();
const OrderItem = require('../models/OrderItem'); // Import OrderItem model

// API to get Product Sales Report
router.get('/product-sales-report', async (req, res) => {
  try {
    // MongoDB aggregation pipeline
    const salesReport = await OrderItem.aggregate([
      {
        $group: {
          _id: '$productName', // Group by product name
          productId: { $first: '$id' }, // Get the product ID
          price: { $first: '$price' },// Get the product price
          totalItemsSold: { $sum: '$quantity' }, // Sum of quantities sold
          totalSales: { $sum: { $multiply: ['$price', '$quantity'] } }, // Total sales (price * quantity)
        },
      },
      {
        $project: {
          _id: 0, // Exclude the default _id field from the output
          productId: 1,
          productName: '$_id',
          price: 1,
          totalItemsSold: 1,
          totalSales: 1,
        },
      },
    ]);

    res.status(200).json(salesReport);
  } catch (error) {
    console.error('Error fetching product sales report:', error.message);
    res.status(500).json({ message: 'Internal server error', error });
  }
});

module.exports = router;
