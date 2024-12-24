const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
deliveryOption: { 
    type: String, 
    required: true,
}, 
name: { 
    type: String, 
    required: true,
},
email: {
    type: String,
    require: true,
},
city: {
    type: String,
    require: false,
}, 
state: {
    type: String,
    require: false,
}, 
zipCode: {
    type: String,
    require: false,
}, 
creditCardNumber: {
    type: String,
    require: true,
}, 
cvv: {
    type: String,
    require: true,
}, 
orderCreatedDate: { 
    type: Date, 
    default: Date.now,
}, 
orderId: { 
    type: String, 
    required: true, 
    unique: true,
}, 
orderDeliveryDate: { 
    type: Date, 
    required: true,
}, 
orderStatus: { 
    type: String, 
    default: 'Pending',
},
storeId: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true,
}],
cartId:[{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cart',
    require: true,
}],

});

module.exports = mongoose.model('Transaction', transactionSchema);
