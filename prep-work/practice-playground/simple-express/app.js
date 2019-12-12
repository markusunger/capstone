const express = require('express');
const logger = require('morgan');
const path = require('path');

const HTTP_PORT = 3030;

const app = express();

app.set('views', path.resolve(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('short'));
app.use(express.static(path.resolve(__dirname, 'public')));

app.use((req, res, next) => {
  console.log(`Here, I logged a request to ${req.url} ...`);
  next();
});

// app.use((req, res, next) => {
//   if (req.query.auth) {
//     next();
//   } else {
//     res.sendStatus(403);
//     res.end('Auth failed!');
//     console.log(`Authentication from ${req.ip} failed.`);
//   }
// });

app.get('/', (req, res) => {
  res.render('index', { name: 'Markus' });
});

app.get('/about/:person', (req, res) => {
  res.end(`You requested information about ${req.params.person}.`);
});

app.get('/details/:person', (req, res) => {
  res.redirect(`/about/${req.params.person}`);
});

app.listen(HTTP_PORT, () => console.log(`Listening on port ${HTTP_PORT}`));
