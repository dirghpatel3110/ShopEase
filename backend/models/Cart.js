const mongoose = require('mongoose');

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

const cartSchema = new mongoose.Schema({
  id: { 
    type: String, 
    required: false 
},
  name: { 
    type: String, 
    required: false 
},
email: { 
    type: String, 
    required: false 
}, 
  originalPrice: { 
    type: Number, 
    required: false 
}, 
  discountedPrice: { 
    type: Number, 
    required: false 
}, 
  quantity: { 
    type: Number, 
    required: false 
}, 
  totalAmount: { 
    type: Number, 
    required: false 
}, 
  category: { 
    type: String, 
    required: false 
}, 
  accessories: {
    type: [accessorySchema] ,
    required: false,
},
});

module.exports = mongoose.model('Cart', cartSchema);
