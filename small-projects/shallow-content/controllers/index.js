const User = require('../models/user');

module.exports = {
  index: function index(req, res) {
    res.render('index');
  },

  login: function login(req, res) {
    res.render('login');
  },

  register: function register(req, res) {
    res.render('register');
  },

  createUser: function createUser(req, res) {
    const { username, password } = req.body;
    if (!username || !password) res.redirect('/register');
    User.findOne({ name: username })
    const newUser = new User({

    });
  },
};
