const express = require('express');
const userController = require('../controllers/user');

const user = express.Router();

user.get('/', userController.main);
user.get('/:name', userController.profile);
user.get('/edit/:name', userController.edit);

user.post('/edit/:name', userController.update);

module.exports = user;
