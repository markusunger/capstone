const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
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
  hearts: [{
    type: mongoose.Schema.Types.ObjectId,
  }],
});

userSchema.pre('save', function hashPassword(done) {
  if (!this.isModified('password')) return done();
  bcrypt.hash(this.password)
    .then((hashedPassword) => {
      this.password = hashedPassword;
      return done();
    },
    err => done(err));
  return done();
});

userSchema.methods.correctPassword = function correctPassword(password) {
  return bcrypt.compare(password, this.password);
};

userSchema.virtual('heartCount')
  .get(function getHeartCount() {
    return this.hearts.length;
  });

const User = mongoose.model('User', userSchema);

module.exports = User;
