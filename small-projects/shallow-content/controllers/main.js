const User = require('../models/user');

module.exports = {
  main: function main(req, res) {
    res.render('index', { user: req.user });
  },

  login: function login(req, res) {
    res.render('login', { message: req.flash('error') });
  },

  logout: function logout(req, res) {
    req.logout();
    res.redirect('/');
  },

  register: function register(req, res) {
    res.render('register', { message: req.flash('error') });
  },

  createUser: function createUser(req, res, next) {
    const {
      username, mail, password, description,
    } = req.body;

    if (!username || !mail || !password) {
      req.flash('error', 'Information missing.');
      res.redirect('/register');
    }

    User.findOne({ username })
      .then((existingUser) => {
        if (existingUser) {
          req.flash('error', 'User already exists.');
          res.redirect('/register');
        } else {
          const newUser = new User({
            username, mail, password, description,
          });
          newUser.save();
          req.login(newUser, (err) => {
            if (err) return next(err);
            return res.redirect('/');
          });
        }
      },
      ((err) => {
        console.log(`Something went wrong: ${err}`);
        next(err);
      }));
  },
};
