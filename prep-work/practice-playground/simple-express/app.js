const express = require('express');
const logger = require('morgan');
const path = require('path');
const entries = require('./entries');

const HTTP_PORT = 3030;

const app = express();

app.set('views', path.resolve(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('short'));
app.use(express.static(path.resolve(__dirname, 'public')));

app.get('/', (req, res) => {
  res.render('index', { entries: entries.all() });
});

app.get('/add', (req, res) => {
  res.render('add');
});

app.post('/add', (req, res) => {
  const { name, entry } = req.body;
  entries.add(name, entry);
  res.redirect('/');
});

app.listen(HTTP_PORT, () => console.log(`Listening on port ${HTTP_PORT}`));
