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

_Conveniences_ mainly refers to syntactic sugar around more complicated features like `sendFile()` that wraps a couple dozen lines of code into one convenient method.

Express is `require`'d like any Node.js module and exposes a function that - when called - returns a new Express application. This application object makes several methods available to control what Express does. The most simple example of an Express web application would be:

```js
const express = require('express');

const app = express();

app.get('/', (req, res) => res.send('It serves.')); // defines a route and the handler function for it

app.listen(8080); // starts the server to listen for incoming requests on the specified port
```

