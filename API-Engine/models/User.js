const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  // all the neccessary fields for this model
  name: {
    type: String,
    required: true,
  },

  role: {
    type: String,
    default: 'user'
  },

  email: {
    type: String,
    required: true,
    unique: true
  },
  
  password: {
    type: String,
    required: true
  },

  resetToken: {
    type: String
  }
});
// creating the user model
const User = mongoose.model('User', userSchema);
// exporting it to use in other files.
module.exports = User;
