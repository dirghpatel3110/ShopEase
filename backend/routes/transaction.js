const express = require('express');
const Transaction = require('../models/Transaction');
const Cart = require('../models/Cart');
const Store = require('../models/Store');
const OrderItem = require('../models/OrderItem'); // OrderItem model


const router = express.Router();

const generateOrderId = () => {
    return `ORD-${Math.floor(Math.random()*90000) + 10000}`;
}

// router.post('/transactions', async(req,res)=> {

//     try {
//         const { deliveryOption, name, email, city, state, zipCode, creditCardNumber, cvv, cartId, storeId } = req.body;

//         if (!deliveryOption || !name || !email || !city || !state || !zipCode || !creditCardNumber || !cvv || !cartId) {
//             return res.status(400).json({ message: 'All required fields must be provided.' });
//           }

//         const orderId = generateOrderId();

//         const orderDeliveryDate = new Date();
//         orderDeliveryDate.setDate(orderDeliveryDate.getDate() + 15);

//         const newTransactionData = {
//             deliveryOption,
//             name,
//             email,
//             city,
//             state,
//             zipCode,
//             creditCardNumber,
//             cvv,
//             orderCreatedDate: new Date(),
//             orderId,
//             orderDeliveryDate,
//             orderStatus: 'Pending',
//             cartId: Array.isArray(cartId) ? cartId : [cartId], // Ensure cartId is stored as an array
//           };

//           if (deliveryOption.toLowerCase() === 'pickup') {
//             if (!storeId) {
//               return res.status(400).json({ message: 'Store ID is required for pickup delivery option.' });
//             }
//             newTransactionData.storeId = Array.isArray(storeId) ? storeId : [storeId]; // Ensure storeId is stored as an array
//           }
        
//           const newTransaction = new Transaction(newTransactionData);
//           const savedTransaction = await newTransaction.save();

//           res.status(201).json({
//             message:"Transation created successfully",
//             transaction: savedTransaction,
//           });

//     } catch (error) {
//         console.log("error creating transactions", error);
//         res.status(500).json({message: "internal server error", error});
//     }
// });

router.post('/transactions', async (req, res) => {
    try {
      const { deliveryOption, name, email, city, state, zipCode, creditCardNumber, cvv, cartId, storeId } = req.body;
  
      if (!deliveryOption || !name || !email || !creditCardNumber || !cvv || !cartId) {
        return res.status(400).json({ message: 'All required fields must be provided.' });
      }
  
      const orderId = generateOrderId();
      const orderDeliveryDate = new Date();
      orderDeliveryDate.setDate(orderDeliveryDate.getDate() + 15);
  
      // Create the transaction object
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
        orderStatus: 'Pending',
        cartId: Array.isArray(cartId) ? cartId : [cartId],
      };
  
      if (deliveryOption.toLowerCase() === 'pickup') {
        if (!storeId) {
          return res.status(400).json({ message: 'Store ID is required for pickup delivery option.' });
        }
        newTransactionData.storeId = Array.isArray(storeId) ? storeId : [storeId];
      }
  
      // Save the transaction to the database
      const newTransaction = new Transaction(newTransactionData);
      const savedTransaction = await newTransaction.save();
  
      // Copy cart data into OrderItems table
      const cartItems = await Cart.find({ _id: { $in: cartId } });
  
      const orderItemsData = cartItems.map((cartItem) => ({
        transactionId: savedTransaction._id,
        cartId: cartItem._id,
        id: cartItem.id,
        productName: cartItem.name,
        quantity: cartItem.quantity,
        price: cartItem.discountedPrice,
        totalPrice: cartItem.totalAmount,
        accessories: cartItem.accessories || [],
      }));
  
      await OrderItem.insertMany(orderItemsData);
  
      res.status(201).json({
        message: 'Transaction created successfully!',
        transaction: savedTransaction,
      });
    } catch (error) {
      console.error('Error creating transaction:', error.message);
      res.status(500).json({ message: 'Internal server error', error });
    }
  });
  

// Get all transactions/orders
router.get('/transactions', async (req, res) => {
    try {
      const transactions = await Transaction.find()
        .populate('cartId') // Populate cart details if needed
        .populate('storeId'); // Populate store details if needed
  
      res.status(200).json(transactions);
    } catch (error) {
      console.error('Error fetching transactions:', error.message);
      res.status(500).json({ message: 'Internal server error', error });
    }
  });

// Get transactions/orders by email
router.get('/transactions', async (req, res) => {
    try {
      const { email } = req.query; // Get email from query parameters
  
      if (!email) {
        return res.status(400).json({ message: 'Email is required' });
      }
  
      const transactions = await Transaction.find({ email })
        .populate('cartId') // Populate cart details if needed
        .populate('storeId'); // Populate store details if needed
  
      if (transactions.length === 0) {
        return res.status(404).json({ message: 'No orders found for this email' });
      }
  
      res.status(200).json(transactions);
    } catch (error) {
      console.error('Error fetching transactions:', error.message);
      res.status(500).json({ message: 'Internal server error', error });
    }
  });

  router.delete("/transactions/:id", async (req, res) => {
    const { id } = req.params;
  
    try {
      const deletedItem = await Transaction.findByIdAndDelete(id);
      if (!deletedItem) {
        return res.status(404).send({ error: "Transaction item not found" });
      }
      res.status(200).send({ message: "Transaction item deleted successfully" });
    } catch (error) {
      console.error("Error deleting Transaction item:", error); // Log the full error
      res.status(500).send({ error: "Failed to delete Transaction item" });
    }
  });

  // Update order status by _id
router.put('/transactions/:id', async (req, res) => {
    try {
      const { id } = req.params; // Extract _id from URL parameters
      const { orderStatus } = req.body; // Extract the new orderStatus from the request body
  
      // Validate required fields
      if (!orderStatus) {
        return res.status(400).json({ message: 'Order status is required.' });
      }
  
      // Find the transaction by _id and update its status
      const updatedTransaction = await Transaction.findByIdAndUpdate(
        id, // Find transaction by _id
        { orderStatus }, // Update the orderStatus field
        { new: true } // Return the updated document
      );
  
      if (!updatedTransaction) {
        return res.status(404).json({ message: 'Transaction not found.' });
      }
  
      res.status(200).json({
        message: 'Order status updated successfully!',
        transaction: updatedTransaction,
      });
    } catch (error) {
      console.error('Error updating order status:', error.message);
      res.status(500).json({ message: 'Internal server error', error });
    }
  });
  

module.exports = router;