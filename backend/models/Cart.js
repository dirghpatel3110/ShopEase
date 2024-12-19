const mongoose = require('mongoose');

// Define Accessories Schema for Cart
const accessorySchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: false 
},
  price: { 
    type: Number, 
    required: false 
},
  quantity: { 
    type: Number, 
    required: false 
}
});

// Define Cart Schema
const cartSchema = new mongoose.Schema({
  id: { 
    type: String, 
    required: true 
}, // Product ID
  name: { 
    type: String, 
    required: true 
},
email: { 
    type: String, 
    required: true 
}, // Product Name
  originalPrice: { 
    type: Number, 
    required: true 
}, // Original Price of Product
  discountedPrice: { 
    type: Number, 
    required: true 
}, // Discounted Price of Product
  quantity: { 
    type: Number, 
    required: true 
}, // Quantity of Product
  totalAmount: { 
    type: Number, 
    required: true 
}, // Total Amount (including accessories)
  category: { 
    type: String, 
    required: true 
}, // Product Category
  accessories: {
    type: [accessorySchema] ,
    required: false,
},
});

// Export the Cart model
module.exports = mongoose.model('Cart', cartSchema);
