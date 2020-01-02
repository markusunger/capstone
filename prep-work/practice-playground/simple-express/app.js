const express = require('express');
const mongoose = require('mongoose');
const logger = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');

const path = require('path');
const Entry = require('./entries');

const HTTP_PORT = 3030;

const app = express();

mongoose.connect('mongodb://localhost:27017/guestbook');

app.set('views', path.resolve(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('short'));
app.use(cookieParser());
app.use(compression());
app.use(express.static(path.resolve(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  Entry.find()
    .sort({ createdAt: 'descending' })
    .exec((err, entries) => {
      if (err) {
        console.log(err);
      } else {
        res.render('index', { entries });
      }
    });
});

app.get('/add', (req, res) => {
  res.render('add', { fillinMore: false });
});

app.post('/add', (req, res) => {
  const { name, mail, entry } = req.body;
  if (!name || !entry) {
    res.render('add', { fillinMore: true });
  } else {
    const newEntry = new Entry({
      name,
      mail,
      entry,
    });
    newEntry.save();
    res.redirect('/');
  }
});

// handle 404's
app.use((req, res) => {
  res.status(404).render('notfound');
});

app.listen(HTTP_PORT, () => console.log(`Listening on port ${HTTP_PORT}`));
