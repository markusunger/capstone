const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now(),
  },
  votes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vote',
  }],
});

postSchema.virtual('voteCount')
  .get(function getVoteCount() { return this.votes.length; });

const Post = mongoose.model('Post', postSchema);

module.exports = Post;