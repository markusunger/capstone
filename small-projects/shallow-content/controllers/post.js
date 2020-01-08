/* eslint-disable no-underscore-dangle */
const User = require('../models/user');
const Post = require('../models/post');

module.exports = {
  main: function main(req, res) {
    res.render('createPost', { message: req.flash('error') });
  },

  createPost: function createPost(req, res, next) {
    const {
      title, content,
    } = req.body;
    if (!title || !content) {
      req.flash('error', 'A post must consist of a title and some content.');
      res.redirect('/post');
    }
    User.findOne({ _id: req.user._id }).exec()
      .then((user) => {
        const newPost = new Post({
          author: user._id,
          title,
          content,
        });
        newPost.save();
        res.redirect('/');
      },
      (err) => {
        next(err);
      });
  },

  heart: async function heart(req, res, next) {
    try {
      const newPost = await Post.findOneAndUpdate(
        { _id: req.params.id },
        { $inc: { hearts: 1 } },
      );
      await User.findOneAndUpdate(
        { name: req.user.name },
        { $push: { hearts: newPost._id } },
        { new: true },
      );
    } catch (err) {
      next(err);
    }
    res.redirect('/');
  },
};
