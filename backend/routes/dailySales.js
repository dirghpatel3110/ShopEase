const express = require("express");
const router = express.Router();
const OrderItem = require("../models/OrderItem");

router.get("/daily-sales-report", async (req, res) => {
  try {
    const dailySalesReport = await OrderItem.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$Date" } },
          totalItemsSold: { $sum: "$quantity" },
          totalSales: { $sum: "$totalPrice" },
          productsSold: { $push: "$productName" },
        },
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          totalItemsSold: 1,
          totalSales: 1,
          productsSold: 1,
        },
      },
      {
        $sort: { date: -1 },
      },
    ]);

    res.status(200).json(dailySalesReport);
  } catch (error) {
    console.error("Error fetching daily sales report:", error.message);
    res.status(500).json({ message: "Internal server error", error });
  }
});

module.exports = router;
