const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  castBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
});

const Vote = mongoose.model('Vote', voteSchema);

module.exports = Vote;
