const mongoose = require("mongoose");

// Define Accessories Schema
const accessorySchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
});

// Define Product Schema
const productSchema = new mongoose.Schema({
id: { 
    type: String, 
    required: true, 
    unique: true 
},
name: { 
    type: String, 
    required: true 
},
description: { 
    type: String, 
    required: true 
},
price: { 
    type: Number, 
    required: true 
},
retailer_special_discounts: { 
    type: Number, 
    required: false 
},
manufacturer_rebates: { 
    type: Number, 
    required: false 
},
warranty_price: { 
    type: Number, 
    required: false 
},
category: { 
    type: String, 
    required: true 
},
likes: { 
    type: Number, 
    default: 0 
},
availableItems: { 
    type: Number, 
    required: true 
},
image: { 
    type: String, 
    required: true 
},
accessories: [accessorySchema], // Array of subdocuments
});

// Export the Product model
module.exports = mongoose.model("Product", productSchema);
