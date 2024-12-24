const mongoose = require('mongoose');

// Define OrderItem Schema
const orderItemSchema = new mongoose.Schema({
  transactionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction',
    required: true,
  },
  cartId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cart',
    required: true,
  },
  id: {type: String, required:true},
  productName: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true},
  totalPrice: { type: Number, required: true },
  accessories: [
    {
      name: { type: String },
      price: { type: Number },
      quantity: { type: Number },
    },
  ],
});

module.exports = mongoose.model('OrderItem', orderItemSchema);
