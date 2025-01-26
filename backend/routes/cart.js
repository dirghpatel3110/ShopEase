const express = require("express");
const Cart = require("../models/Cart");

const router = express.Router();

router.post("/cart", async (req, res) => {
  try {
    const {
      email,
      id,
      name,
      originalPrice,
      discountedPrice,
      quantity,
      totalAmount,
      category,
      accessories,
    } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const newCartItem = new Cart({
      email,
      id,
      name,
      originalPrice,
      discountedPrice,
      quantity,
      totalAmount,
      category,
      accessories,
    });

    const savedCartItem = await newCartItem.save();

    res.status(201).json({
      message: "Product added to cart successfully!",
      cartItem: savedCartItem,
    });
  } catch (error) {
    console.error("Error adding product to cart:", error.message);
    res.status(500).json({ message: "Internal server error", error });
  }
});

router.get("/cart", async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const cartItems = await Cart.find({ email });

    res.status(200).json(cartItems);
  } catch (error) {
    console.error("Error fetching cart items:", error.message);
    res.status(500).json({ message: "Internal server error", error });
  }
});

router.delete("/cart", async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const result = await Cart.deleteMany({ email });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "No cart found for this email" });
    }

    res.status(200).json({ message: "Cart clear successfully" });
  } catch (error) {
    console.log("Error clearing cart:", error);
    res.status(500).json({ message: "Failed to clear the cart", error });
  }
});

router.delete("/cart/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const deletedItem = await Cart.findByIdAndDelete(id);
    if (!deletedItem) {
      return res.status(404).send({ error: "Cart item not found" });
    }
    res.status(200).send({ message: "Cart item deleted successfully" });
  } catch (error) {
    console.error("Error deleting cart item:", error);
    res.status(500).send({ error: "Failed to delete cart item" });
  }
});

module.exports = router;
