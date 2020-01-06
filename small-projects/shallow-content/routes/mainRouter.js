const express = require('express');
const passport = require('passport');
const mainController = require('../controllers/main');

const main = express.Router();

main.get('/', mainController.main);
main.get('/login', mainController.login);
main.get('/logout', mainController.logout);
main.get('/register', mainController.register);

main.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true,
}));
main.post('/register', mainController.createUser);

module.exports = main;
