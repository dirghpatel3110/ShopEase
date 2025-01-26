const express = require("express");
const Transaction = require("../models/Transaction");
const Cart = require("../models/Cart");
const Store = require("../models/Store");
const OrderItem = require("../models/OrderItem");

const router = express.Router();

const generateOrderId = () => {
  return `ORD-${Math.floor(Math.random() * 90000) + 10000}`;
};

router.post("/transactions", async (req, res) => {
  try {
    const {
      deliveryOption,
      name,
      email,
      city,
      state,
      zipCode,
      creditCardNumber,
      cvv,
      cartId,
      storeId,
    } = req.body;

    if (
      !deliveryOption ||
      !name ||
      !email ||
      !creditCardNumber ||
      !cvv ||
      !cartId
    ) {
      return res
        .status(400)
        .json({ message: "All required fields must be provided." });
    }

    const orderId = generateOrderId();
    const orderDeliveryDate = new Date();
    orderDeliveryDate.setDate(orderDeliveryDate.getDate() + 15);

    const newTransactionData = {
      deliveryOption,
      name,
      email,
      city,
      state,
      zipCode,
      creditCardNumber,
      cvv,
      orderCreatedDate: new Date(),
      orderId,
      orderDeliveryDate,
      orderStatus: "Pending",
      cartId: Array.isArray(cartId) ? cartId : [cartId],
    };

    if (deliveryOption.toLowerCase() === "pickup") {
      if (!storeId) {
        return res
          .status(400)
          .json({
            message: "Store ID is required for pickup delivery option.",
          });
      }
      newTransactionData.storeId = Array.isArray(storeId) ? storeId : [storeId];
    }

    const newTransaction = new Transaction(newTransactionData);
    const savedTransaction = await newTransaction.save();

    const cartItems = await Cart.find({ _id: { $in: cartId } });

    const orderItemsData = cartItems.map((cartItem) => ({
      transactionId: savedTransaction._id,
      cartId: cartItem._id,
      id: cartItem.id,
      email: cartItem.email,
      productName: cartItem.name,
      quantity: cartItem.quantity,
      price: cartItem.discountedPrice,
      totalPrice: cartItem.totalAmount,
      accessories: cartItem.accessories || [],
    }));

    await OrderItem.insertMany(orderItemsData);

    res.status(201).json({
      message: "Transaction created successfully!",
      transaction: savedTransaction,
    });
  } catch (error) {
    console.error("Error creating transaction:", error.message);
    res.status(500).json({ message: "Internal server error", error });
  }
});

router.get("/transactions", async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate("cartId")
      .populate("storeId");

    res.status(200).json(transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error.message);
    res.status(500).json({ message: "Internal server error", error });
  }
});

router.get("/transactions", async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const transactions = await Transaction.find({ email })
      .populate("cartId")
      .populate("storeId");

    if (transactions.length === 0) {
      return res
        .status(404)
        .json({ message: "No orders found for this email" });
    }

    res.status(200).json(transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error.message);
    res.status(500).json({ message: "Internal server error", error });
  }
});

router.delete("/transactions/:orderId", async (req, res) => {
  const { orderId } = req.params;

  try {
    const deletedTransaction = await Transaction.findOneAndDelete({ orderId });

    if (!deletedTransaction) {
      return res.status(404).send({ error: "Transaction item not found" });
    }

    const deletedOrderItems = await OrderItem.deleteMany({
      transactionId: deletedTransaction._id,
    });

    res.status(200).send({
      message:
        "Transaction item and associated order items deleted successfully",
      deletedTransaction,
      deletedOrderItems,
    });
  } catch (error) {
    console.error("Error deleting Transaction item and order items:", error);
    res
      .status(500)
      .send({
        error: "Failed to delete Transaction item and associated order items",
      });
  }
});

router.put("/transactions/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;
    const { orderStatus } = req.body;

    if (!orderStatus) {
      return res.status(400).json({ message: "Order status is required." });
    }

    const updatedTransaction = await Transaction.findOneAndUpdate(
      { orderId },
      { orderStatus },
      { new: true }
    );

    if (!updatedTransaction) {
      return res.status(404).json({ message: "Transaction not found." });
    }

    res.status(200).json({
      message: "Order status updated successfully!",
      transaction: updatedTransaction,
    });
  } catch (error) {
    console.error("Error updating order status:", error.message);
    res.status(500).json({ message: "Internal server error", error });
  }
});

module.exports = router;
