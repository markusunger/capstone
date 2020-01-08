const User = require('../models/user');
const Post = require('../models/post');

module.exports = {
  main: function main(req, res, next) {
    Post
      .find({})
      .sort({ date: 'desc' })
      .limit(10)
      .populate('author')
      .exec()
      .then((posts) => {
        res.render('index', { user: req.user, posts });
      },
      (err) => {
        next(err);
      });
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
      name, mail, password, description,
    } = req.body;

    if (!name || !mail || !password) {
      req.flash('error', 'Information missing.');
      res.redirect('/register');
    }

    User.findOne({ name })
      .then((existingUser) => {
        if (existingUser) {
          req.flash('error', 'User already exists.');
          res.redirect('/register');
        } else {
          const newUser = new User({
            name, mail, password, description,
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
