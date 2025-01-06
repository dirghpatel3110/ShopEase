const mongoose = require("mongoose");

const accessorySchema = new mongoose.Schema({
  id: {
    type: Number,
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

const productSchema = new mongoose.Schema({
  id: { 
    type: Number, 
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
    default: 0 
  },
  manufacturer_rebates: { 
    type: Number, 
    default: 0 
  },
  warranty_price: { 
    type: Number, 
    default: 0 
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
    required: true,
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)$/i.test(v);
      },
      message: props => `${props.value} is not a valid image URL!`,
    }
  },
  accessories: {
    type: [accessorySchema],
    default: [],  
  },
});

module.exports = mongoose.model("Product", productSchema);
