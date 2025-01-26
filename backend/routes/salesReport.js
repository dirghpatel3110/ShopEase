const express = require("express");
const router = express.Router();
const OrderItem = require("../models/OrderItem");

router.get("/product-sales-report", async (req, res) => {
  try {
    const salesReport = await OrderItem.aggregate([
      {
        $group: {
          _id: "$productName",
          productId: { $first: "$id" },
          price: { $first: "$price" },
          totalItemsSold: { $sum: "$quantity" },
          totalSales: { $sum: { $multiply: ["$price", "$quantity"] } },
        },
      },
      {
        $project: {
          _id: 0,
          productId: 1,
          productName: "$_id",
          price: 1,
          totalItemsSold: 1,
          totalSales: 1,
        },
      },
    ]);

    res.status(200).json(salesReport);
  } catch (error) {
    console.error("Error fetching product sales report:", error.message);
    res.status(500).json({ message: "Internal server error", error });
  }
});

module.exports = router;
