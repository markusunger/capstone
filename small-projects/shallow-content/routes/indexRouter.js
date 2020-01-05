const express = require('express');
const passport = require('passport');
const indexController = require('../controllers/index');

const index = express.Router();

index.get('/', indexController.index);
index.get('/login', indexController.login);
index.get('/logout', indexController.logout);
index.get('/register', indexController.register);

index.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true,
}));
index.post('/register', indexController.createUser);

module.exports = index;
