const User = require('../models/user');
const Post = require('../models/post');

module.exports = {
  main: async function main(req, res) {
    if (!req.user) res.redirect('/');
    res.redirect(`/user/${req.user.name}`);
  },

  profile: async function profile(req, res, next) {
    // view any profile and edit your own profile
    let selectedUser;
    let lastPosts = [];
    let isOwner = false;

    try {
      selectedUser = await User.findOne({ name: req.params.name });
      if (req.user && selectedUser.name === req.user.name) isOwner = true;
      lastPosts = await Post
        .find({ author: selectedUser.id })
        .sort({ date: 'desc' })
        .limit(5)
        .exec();
    } catch (err) {
      next(err);
    }
    res.render('profile', { user: selectedUser, lastPosts, isOwner });
  },

  edit: async function edit(req, res, next) {
    if (!req.user || req.user.name !== req.params.name) res.redirect('/user');

    let selectedUser;
    try {
      selectedUser = await User.findOne({ name: req.params.name });
    } catch (err) {
      next(err);
    }
    res.render('editProfile', { user: selectedUser });
  },

  update: async function update(req, res, next) {
    if (req.user && req.user.name !== req.params.name) res.redirect('/user');
    try {
      await User.findOneAndUpdate(
        { name: req.user.name },
        {
          password: req.body.password,
          description: req.body.description,
        },
        { new: true },
      ).exec();
    } catch (err) {
      next(err);
    }
    res.redirect('/user');
  },
};
