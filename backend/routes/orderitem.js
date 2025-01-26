const express = require("express");
const OrderItem = require("../models/OrderItem");
const Transaction = require("../models/Transaction");

const router = express.Router();

router.get("/order-items", async (req, res) => {
  try {
    const { transactionId } = req.query;

    let orderItems;
    if (transactionId) {
      orderItems = await OrderItem.find({ transactionId }).populate(
        "transactionId",
        "orderId name email orderDeliveryDate orderStatus"
      );
    } else {
      orderItems = await OrderItem.find().populate(
        "transactionId",
        "orderId name email orderDeliveryDate orderStatus"
      );
    }

    res.status(200).json(orderItems);
  } catch (error) {
    console.error("Error fetching order items:", error.message);
    res.status(500).json({ message: "Internal server error", error });
  }
});

router.get("/user-orders", async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const userOrders = await OrderItem.find({ email }).populate({
      path: "transactionId",
      select: "name email orderId orderDeliveryDate orderStatus",
    });

    if (userOrders.length === 0) {
      return res
        .status(404)
        .json({ message: "No orders found for this user." });
    }

    res.status(200).json(userOrders);
  } catch (error) {
    console.error("Error fetching user orders:", error.message);
    res.status(500).json({ message: "Internal server error", error });
  }
});

module.exports = router;
