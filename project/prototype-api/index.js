const http = require('http');
const express = require('express');
const logger = require('morgan');

const argDestructuring = require('./argDestructuring');

const handleGetRequest = require('./handleGetRequest');
const handlePostRequest = require('./handlePostRequest');

require('dotenv').config();

/*
  for real api server:
  - gzipping
  - proper logging
  - dev/prod env checks
*/

const app = express();

app.use(logger('dev'));

app.use(argDestructuring);

app.get('/*', (req, res) => {
  // passes all GET requests to the GET handler
  const { status, response } = handleGetRequest(req);
  res.status(status).json(response);
});

app.post('/*', (req, res) => {
  // passes all POST requests to the POST handler
  const { status, response } = handlePostRequest(req);
  res.status(status).json(response);
});

http.createServer(app).listen(process.env.API_PORT, () => {
  console.log(`Started API on port ${process.env.API_PORT}.`);
});
