const mongoose = require('mongoose');

const entrySchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  mail: {
    type: String,
    required: false,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  entry: {
    type: String,
    required: true,
  },
});

const Entry = mongoose.model('Entry', entrySchema);

module.exports = Entry;
