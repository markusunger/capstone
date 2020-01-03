const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  mail: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  description: String,
});

userSchema.methods.correctPassword = function correctPassword(password) {
  return password === this.password;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
