const express = require('express');
const logger = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');

const path = require('path');
const entries = require('./entries');

const HTTP_PORT = 3030;

const app = express();

app.set('views', path.resolve(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('short'));
app.use(cookieParser());
app.use(compression());
app.use(express.static(path.resolve(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.render('index', { entries: entries.all() });
});

app.get('/add', (req, res) => {
  res.render('add', { fillinMore: false });
});

app.post('/add', (req, res) => {
  const { name, mail, entry } = req.body;
  if (!name || !entry) {
    res.render('add', { fillinMore: true });
  } else {
    entries.add(name, mail, entry);
    res.redirect('/');
  }
});

// handle 404's
app.use((req, res) => {
  res.status(404).render('notfound');
});

app.listen(HTTP_PORT, () => console.log(`Listening on port ${HTTP_PORT}`));
