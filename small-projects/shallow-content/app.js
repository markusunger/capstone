const http = require('http');
const path = require('path');

const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const bodyParser = require('body-parser');
const flash = require('connect-flash');

const LocalStrategy = require('passport-local').Strategy;

require('dotenv').config();

const mainRouter = require('./routes/mainRouter');
const postRouter = require('./routes/postRouter');
const userRouter = require('./routes/userRouter');
const User = require('./models/user');

const { env } = process;

const app = express();

mongoose.connect(`mongodb://${env.DB_HOST}:${env.DB_PORT}/${env.DB_NAME}`, {
  useNewUrlParser: true,
  useFindAndModify: false,
  useCreateIndex: true,
  useUnifiedTopology: true,
});

app.set('views', path.resolve(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(morgan('dev'));
app.use(express.static(path.resolve(__dirname, 'static')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(flash());

app.use(session({
  secret: env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
}));

// auth stuff
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy((name, password, done) => {
  User.findOne({ name })
    .then((user) => {
      if (!user) return done(null, false, { message: 'Username not found.' });
      if (!user.correctPassword(password)) return done(null, false, { message: 'Password incorrect.' });
      return done(null, user);
    },
    (err => done(err)));
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id)
    .then(user => done(null, user),
      err => done(err, null));
});

// populate res.locals with the current user
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

// routes
app.use('/user', userRouter);
app.use('/post', postRouter);
app.use('/', mainRouter);

// handle 404's
app.use((req, res) => {
  res.render('notfound');
});

// handle errors
app.use((err, req, res, next) => {
  console.log(err);
  res.render('error');
  next(); // leave error mode
});

http.createServer(app).listen(env.HTTP_PORT, () => {
  console.log(`Server started on port ${env.HTTP_PORT}`);
});
