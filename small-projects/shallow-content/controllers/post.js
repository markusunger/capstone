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
    User.findOne({ _id: req.user.id }).exec()
      .then((user) => {
        const newPost = new Post({
          author: user.id,
          title,
          content,
        });
        newPost.save();
        res.redirect(`/post/${newPost.id}`);
      },
      (err) => {
        next(err);
      });
  },

  view: function view(req, res, next) {
    const postId = req.params.Id;
    Post
      .findOne({ id: postId })
      .populate('User')
      .exec()
      .then((post) => {
        res.render('viewPost', { post });
      },
      (err) => {
        next(err);
      });
  },
};
