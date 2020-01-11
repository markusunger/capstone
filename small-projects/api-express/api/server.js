// Node internal module import
const http = require('http');

// yarn package import
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

require('dotenv').config();

const app = express();

app.disable('x-powered-by');

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect(`mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
})
  .catch((error) => {
    console.log(`Error connecting to database. ${error}`);
  });

const authJWT = (req, res, next) => {
  // check for valid JWT
  if (!req.headers.authorization) {
    req.isAuthed = false;
    return next();
  }

  const token = req.headers.authorization.split(/\s+/).pop().replace(/"/g, '');
  jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
    if (error) req.isAuthed = false;
    if (decoded) req.isAuthed = true;
    return next();
  });
};

app.get('/', authJWT, (req, res) => {
  if (req.isAuthed) res.status(200).json({ ok: 'no token necessary' });
  jwt.sign({ authed: true }, process.env.JWT_SECRET, { algorithm: 'HS256' }, (error, token) => {
    if (error) res.status(500).json({ error });
    res.status(200).json({ ok: 'token sent', token });
  });
});

app.get('/authed', authJWT, (req, res) => {
  if (!req.isAuthed) {
    res.status(401).json({ error: 'token not found or not validated' });
  } else {
    res.status(200).json({ ok: 'authed and permitted to access' });
  }
});


module.exports = () => {
  const server = http.createServer(app);
  server.listen(process.env.HTTP_PORT, () => console.log(`Server listening on port ${process.env.HTTP_PORT}`));
};
