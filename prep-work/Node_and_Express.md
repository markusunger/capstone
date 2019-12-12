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

Calling `use()` registers the middleware function to Express. Middleware gets executed top to bottom, as long as each handler includes a call to `next()` and defers to the next function in the chain.

Express is a very barebones framework which has lead to lots of third-party middleware libraries. A middleware function that comes built into Express would be `static` to serve static files:

```js
const path = require('path');

// ...

app.use(express.static(path.resolve(__dirname, 'public')));
// allows for files in the public directory to be accessed by their filename
```

`express.static` embraces the middleware approach: if the file requested is in the specified directory, it sends it as a response. If not, execution gets deferred to the next middleware function.

A third-party middleware for logging would be `morgan`, which has to be installed as an `npm` package.

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

Express adds a method to the response object called `render()` which renders the template (if it's found in the specified views folder) and sends it to the client.

```js
app.set('views', path.resolve(__dirname, 'views'));
app.set('view engine', 'ejs');

// ...

app.get('/', (req, res) => {
  res.render('index', { name: 'Markus' });
});
```

This renders the view `/views/index.ejs` and passes it data in the form of an object, whose properties can be dynamically inserted in the EJS template.