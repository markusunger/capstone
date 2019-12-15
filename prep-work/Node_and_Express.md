# What is Express.js?

_Express.js_ is a small, relatively unopinionated framework that relies on Node.js' internal web server functionality to add a clean and simple API and some additional functionality. 

In general, Node.js provides a way to handle HTTP or HTTPS requests via the `http` or `htttps` core modules:

```js
const http = require('http');

const server = http.createServer(function handleRequest(req, res) {
  res.end('pong');
};
server.listen(1338, () => console.log('Listening ...'));
```

The HTTP server in the example above is at its core a function (`handleRequest`) that receives two arguments: the request (`req`) and the response (`res`, both are streams). Actually defining routes and serving content requires writing lots of additional boilerplate code to extract information from the request object (e.g. the requested URL, headers) in order to determine the course of action and what should be sent to the response object (writing headers, defining the correct content type and length, etc.).

Once the `end` method (or various other methods like `send` or `sendFile`) on the response object is called, the response itself is sent to the client.

Enter _Express.js_! It basically wraps around that one handler function and instead exposes several smaller functions to define routes, middleware etc. It also enriches the request object with more information about the request and its sender.

There are four major features to Express:

1. Middleware
2. Routing
3. Subapplications
4. Conveniences

_Middleware_ allows to break up that one monolithic request handler function into several functions that each specialize in one part of the work. Those functions are called _middleware functions_ or just _middleware_. A logger is one example of a middleware. It receives the request object, extracts the information it needs and then passes execution on to the next middleware.

_Routing_ is similar to middleware in the sense that it also breaks up the request handler, but does so in a conditional way: depending on the requested URL, a different routing function is executed.

_Subapplications_ are called _routers_ in Express and allows for the compartmentalization of the app into smaller pieces. 

_Conveniences_ mainly refers to syntactic sugar around more complicated features like `sendFile()` that wraps a couple dozen lines of code into one convenient method. Express also adds a few helpful properties to the request object (but doesn't remove any).

Express is `require`'d like any Node.js module and exposes a function that - when called - returns a new Express application. This application object makes several methods available to control what Express does. The most simple example of an Express web application would be:

```js
const express = require('express');

const app = express();

app.get('/', (req, res) => res.send('It serves.')); // defines a route and the handler function for it

app.listen(8080); // starts the server to listen for incoming requests on the specified port
```

The call to `app.listen()` is a shorthand for `http.createServer(app).listen()`. In the background, Express simply relies on Node's `http` module.

# Middleware

Middleware allows for many request handler functions to run in sequence. It's comparable to the Rack middleware introduced in _Launch School_'s backend Ruby courses. A middleware function in Express takes three arguments: the request object, the response object and a reference to the next middleware function. With that, the middleware can - but need not - manipulate the request (like adding another property) or influence the response (like setting special headers).

```js
app.use((req, res, next) => {
  console.log(`Here, I logged a request to ${req.url} ...`);
  next();
});
```

Calling `use()` registers the middleware function to Express. Middleware gets executed top to bottom, as long as each handler includes a call to `next()` and defers to the next function in the stack.  
Eventually, one of those middleware functions has to call `end` (or some equivalent).

There is one exception to this rule, though: _error-handling middleware_.

Whenever the `next()`  call gets passed an argument (a general convention is to use a an error object, e.g. `next(new Error('Something went wrong)))`, the Express app enters _error mode_. Now all normal middleware executions are skipped and only error-handling middleware gets executed.  
Thes special middleware functions take four (instead of three) arguments: the error first (the argument passed into `next()`) and then - as usual - `request`, `response` and `next`.
This error handler can call `next()` without an argument to exit error mode and continue with the execution of the normal middleware stack, or the handler uses e.g. `res.end` to end the request and send the response.  
If instead, `next()` is called with an argument again, error mode is kept active and the next error-handling middleware gets executed.

During the normal execution of the middleware stack, error handlers get skipped. They are only executed when the app is in error mode!

An example:

```js
app.use((request, response, next) => {
  res.sendFile(pathTofile, function cb(error) {
    if (error) {
      next(new Error('Error when sending file!')); // error mode entered
    }
  });
});

// two error-handling middleware functions follow, see the no. of arguments
app.use((error, request, response, next) => {
  console.error(error);
  next(error); // error mode continues
});

app.use((error, request, response, next) => {
  res.status(500);
  res.end('Internal Server Error!');
});
```

Express is a very barebones framework which has lead to lots of third-party middleware libraries. A middleware function that comes built into Express would be `static` to serve static files:

```js
const path = require('path');

// ...

app.use(express.static(path.resolve(__dirname, 'public')));
// allows for files in the public directory to be accessed by their filename
```

`express.static` embraces the middleware approach: if the file requested is in the specified directory, it sends it as a response. If not, execution gets deferred to the next middleware function.

There are many commonly used third-party middleware packages. Some of the mare listed here:

- `morgan`: a logger
- `body-parser`: makes the request body available as a parsed object, included in Express 4.16+
- `cookie-parser`: needs to be coupled with `express-session` to make cookie data availalbe on the client and the server
- `compression`: for gzipping responses

# Routing

Express' routing methods basically act like middleware, it's just that they're put at the bottom (so that other middleware will be executed first).

```js
app.get('/', (req, res) => res.send('Accessed root path'));
```

There are methods available for all HTTP verbs (`post`, `put` etc.). There is also an `all()` method that can execute middleware for a route requested with *any* HTTP request type.

The first argument specifies the path that the handler should be executed on, like `'/'` or `'/api/v1'`. Those paths can be parameterized by prepending a colon (`:`) to any part of the path. `'/about/:person'` would catch all paths like `'/about/markus'` or `'/about/bharat'`, providing access to that variable part with the request property `req.params` (in that case under `req.params.person`).

```js
app.get('/about/:person', (req, res) => {
  res.end(`You requested information about ${req.params.person}.`);
});
```

For more fine-grained control over the route, regular expressions can be used:

```js
app.get(/^\/users\/(\d+)$/, (req, res) => {
  // only matches if the parameter consists of purely digits
  // e.g. /users/3456, *not* /users/horse_poo 
  const userId = Number(req.params[0]);
});
```

URL parameters are not the only way to pass information via the URL. Another way is to use _query strings_ (e.g. `/search?for=javascript&src=stackoverflow`). Query strings are made available in th `request.query` object. For the example, there would be `req.query.search` and `req.query.src`.  
There are a few common headaches caused by query strings, one would be that each query parameter is normally a string, but when used twice (`?src=so&src=mdn`) it becomes an array.

## Express Router

Starting with version 4, Express supports so-called _routers_, which are basically isolated instances (or "mini-apps") with their own middleware and route definitions.

These routers can be used like middleware (i.e. `app.use(aRouter)`).

Here's an example, first the main `app.js` file:

```js
const apiRouter = require('./routes/api.js');

// ...

app.use('/api', apiRouter); // for all URLs starting with /api, the
                            // router is used
```

`/routes/api.js`:

```js
const express = require('express');

const api = express.Router();

api.use((req, res, next) => {
  // some middleware stuff
  next();
});

api.get('/users', (req, res) => {
  // do whatever on that route
  // -> /api/users
});

module.exports = api;
```

As can be seen from the `app.js` file, middleware can be mounted to a specific URL path. Through `app.use(path, middlewareFunc)`, the middleware only responds to a request if it starts with `path`.

# Express and HTTPS

Supporting HTTPS is as simple as reading the private key and certificate and starting another server on the appropriate port (443).

```js
const express = require('express');
const http = require('http');
const https = require('https');
const fs = require('fs');

const app = express();

const httpsOptions = {
  key: fs.readFileSync('path/to/private/key.pem'),
  cert: fs.readFileSync('path/to/certificate.pem'),
};

http.createServer(app).listen(80);
https.createServer(httpsOptions, app).listen(443);
```

HTTP and HTTPS servers can run in parallel from the same application file. The only difference is the required module and the key and certificate being passed in as an options object for the `https.createServer()` call.

# Express convenience methods

Express augments both the request and response objects with useful properties and methods.

`response.redirect()` can redirect to a different path (and therefore hand control over to a different routing handler).

```js
app.get('/details/:person', (req, res) => {
  res.redirect(`/about/${req.params.person}`);
  // a route handling the /about/:person path will be called for this request
});
```

`response.sendFile(pathToFile, options, cb)` can send a whole file to the client, allowing fine-grained control with the `options` object. A callback gets invoked once the transfer is completed or an error is encountered.

# Templating and View Engines

Express supports _view engines_, meaning it allows the use of templating languages to serve dynamically generated HTML. In order to use such an engine, two setting are necessary:

```js
app.set('views', path.resolve(__dirname, 'views'));
app.set('view engine', 'ejs');
```

The first line sets the path to look for a view file when a template render is invoked. The second line sets the templating language, in this case `EJS` (alternatives are the usual suspects: Handlebars, pug, Mustache, ...). Those have to be pulled in as an `npm` package.

Express adds a method to the response object called `render()` which renders the template (if it is found in the specified views folder) and sends it to the client.

```js
app.set('views', path.resolve(__dirname, 'views'));
app.set('view engine', 'ejs');

// ...

app.get('/', (req, res) => {
  res.render('index', { name: 'Markus' });
});
```

This renders the view `/views/index.ejs` and passes it data in the form of an object, whose properties can be dynamically inserted in the EJS template.