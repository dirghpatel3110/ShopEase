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
    required: false 
}, // Product ID
  name: { 
    type: String, 
    required: false 
},
email: { 
    type: String, 
    required: false 
}, // Product Name
  originalPrice: { 
    type: Number, 
    required: false 
}, // Original Price of Product
  discountedPrice: { 
    type: Number, 
    required: false 
}, // Discounted Price of Product
  quantity: { 
    type: Number, 
    required: false 
}, // Quantity of Product
  totalAmount: { 
    type: Number, 
    required: false 
}, // Total Amount (including accessories)
  category: { 
    type: String, 
    required: false 
}, // Product Category
  accessories: {
    type: [accessorySchema] ,
    required: false,
},
});

// Export the Cart model
module.exports = mongoose.model('Cart', cartSchema);
