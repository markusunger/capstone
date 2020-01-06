const express = require('express');
const postController = require('../controllers/post');

const post = express.Router();

post.use((req, res, next) => {
  // middleware to make sure that the user is authenticated for doing any
  // post creation
  if (!req.isAuthenticated()) {
    req.flash('error', 'You need to be logged in to post.');
    res.redirect('/login');
  }
  next();
});

post.get('/', postController.main);
post.get('/:id', postController.view);

post.post('/', postController.createPost);

module.exports = post;
