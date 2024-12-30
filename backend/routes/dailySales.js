const express = require('express');
const router = express.Router();
const OrderItem = require('../models/OrderItem'); // Import OrderItem model

// API to get Daily Sales Report
router.get('/daily-sales-report', async (req, res) => {
  try {
    // MongoDB aggregation pipeline
    const dailySalesReport = await OrderItem.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$Date' } }, // Group by day (YYYY-MM-DD)
          totalItemsSold: { $sum: '$quantity' }, // Sum of quantities sold
          totalSales: { $sum: '$totalPrice' }, // Sum of totalPrice
          productsSold: { $push: '$productName' }, // List of product names sold on that day
        },
      },
      {
        $project: {
          _id: 0, // Exclude the default _id field from the output
          date: '$_id', // Rename _id to date
          totalItemsSold: 1,
          totalSales: 1,
          productsSold: 1,
        },
      },
      {
        $sort: { date: -1 }, // Sort by date in descending order
      },
    ]);

    res.status(200).json(dailySalesReport);
  } catch (error) {
    console.error('Error fetching daily sales report:', error.message);
    res.status(500).json({ message: 'Internal server error', error });
  }
});

module.exports = router;
