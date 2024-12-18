const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Define User Schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    require: true,
  },
  userAge:{
    type: String,
    require: true,
  },
  userGender:{
    type: String,
    require: true,
  },
  street:{
    type: String,
    require: true,
  },
  city:{
    type: String,
    require: true,
  },
  state:{
    type: String,
    require: true,
  },
  zipCode:{
    type: String,
    require: true,
  },
});

// Hash the password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Export the model
module.exports = mongoose.model('User', userSchema);
