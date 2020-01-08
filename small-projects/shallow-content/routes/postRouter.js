const express = require('express');
const postController = require('../controllers/post');

const post = express.Router();

const requireAuth = (req, res, next) => {
  // middleware to make sure that the user is authenticated for doing any
  // post creation
  if (!req.isAuthenticated()) {
    req.flash('error', 'You need to be logged in for that.');
    res.redirect('/login');
  } else {
    next();
  }
};

post.get('/', requireAuth, postController.main);
post.get('/heart/:id', requireAuth, postController.heart);

post.post('/', requireAuth, postController.createPost);

module.exports = post;
