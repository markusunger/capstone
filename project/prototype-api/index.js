const http = require('http');
const express = require('express');
const logger = require('morgan');
const data = require('./dataHandler');

require('dotenv').config();

const app = express();

app.use(logger('dev'));


/*
  route handling depending on request type, treat path as wildcard

  determine arguments (= number of path segments) -> middleware that populates request object

  on GET:
    try to find entity in first argument
      if found
        without additional arguments
          find all entity items
        with one additional argument
          try to determine if entity with id of second argument exists
            if so
              return that item
            if not
              return 404 (?)
      if not
        determine if entity needs to be created and empty collection returned
        or if endpoint is not a collection-type entity (like /login)
  on POST:
    try to find entity in first argument
      if found and no other arguments
        create new entity item from request body
      if not found
        create new entity and new entity item from request body

  MORE INFO/THOUGHTS NEEDED:
    - REST best practices (how are API paths structured and best defined, read book on API design)
    - determine if first route path segment is entity or other endpoint
      (difference between /users and /login)
    - how to allow access to structured save data for sorting, selecting specific items,
      think about data store carefully (SQL would be great for that, but does serialization
      of JSON have any drawbacks?)
    - how can endpoint rules be integrated into this design? Maybe allow both modes: "intelligent"
      auto-detection and rule-based/pre-defined data delivery
*/

app.use((req, res, next) => {
  // splits path into separate arguments and make them available
  // in request object
  let path = req.originalUrl;
  if (path[0] === '/') path = path.slice(1);
  req.args = path.split('/');
  next();
});

app.get('/*', (req, res) => {
  res.json({
    requestPath: req.originalUrl,
  });
});

app.post('/*', (req, res) => {
  res.status(200).json({
    success: 'ok',
  });
});

http.createServer(app).listen(process.env.API_PORT, () => {
  console.log(`Started API on port ${process.env.API_PORT}.`);
});
