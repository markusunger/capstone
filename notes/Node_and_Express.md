# What is Express.js?

_Express.js_ is a small, relatively unopinionated framework that relies on Node.js' internal web server functionality to add a clean and simple API and some additional functionality. 

In general, Node.js provides a way to handle HTTP or HTTPS requests via the `http` or `https` core modules:

```js
const http = require('http');

const server = http.createServer(function handleRequest(req, res) {
  res.end('pong');
};
server.listen(1338, () => console.log('Listening ...'));
```

The HTTP server in the example above is at its core a function (`handleRequest`) that receives two arguments: the request (`req`) and the response (`res`, both are streams). Actually defining routes and serving content requires writing lots of additional boilerplate code to extract information from the request object (e.g. the requested URL, headers) in order to determine the course of action and what should be sent to the response object (writing headers, defining the correct content type and length, etc.).

Once the `end` method or various other methods like `send` or `sendFile` on the response object are called, the response itself is sent to the client.

Enter _Express.js_! It basically wraps around that one handler function and instead exposes several smaller functions to define routes, middleware etc. It also enriches the request object with more information about the request and its sender.

There are four major features to Express:

1. Middleware
2. Routing
3. Subapplications
4. Conveniences

_Middleware_ allows to break up that one monolithic request handler function into several functions that each specialize in one part of the work. Those functions are called _middleware functions_ or just _middleware_. A logger is one example of a middleware. It receives the request object, extracts the information it needs and then passes execution on to the next middleware.

_Routing_ is similar to middleware in the sense that it also breaks up the request handler, but does so in a conditional way: depending on the requested URL, a different routing function is executed.

_Subapplications_ are called _routers_ in Express and allow for the compartmentalization of the app into smaller pieces. 

_Conveniences_ mainly refers to syntactic sugar around more complicated features like `sendFile()` that wraps a couple dozen lines of code into one convenient method. Express also adds a few helpful properties to the request object (but doesn't remove any).

Express is `require`'d like any Node.js module and exposes a function that - when called - returns a new Express application. This application object makes several methods available to control what Express does. The most simple example of an Express web application would be:

```js
const express = require('express');

const app = express();

app.get('/', (req, res) => res.send('It serves.')); // defines a route and the handler function for it

app.listen(8080); // starts the server to listen for incoming requests on the specified port
```

The call to `app.listen()` is a shorthand for `http.createServer(app).listen()`, because in the background, Express simply relies on Node's `http` (or `https`) module.

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
These special middleware functions take four (instead of three) arguments: the error first (the argument passed into `next()`) and then - as usual - `request`, `response` and `next`.
The error handler can call `next()` without an argument to exit error mode and continue with the execution of the normal middleware stack, or the handler uses e.g. `res.end` to end the request and send the response.  
If instead, `next()` is called with an argument again, error mode is kept active and the next error-handling middleware gets executed.

During the normal execution of the middleware stack, error handlers get skipped. They are only executed when the app is in error mode.

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
  response.status(500);
  response.end('Internal Server Error!');
});
```

Side note: sending a response status code is done with `response.status(statusCodeNumber)`. This method returns the response object itself again, so that calls can be chained: `response.status(404).render('notfound_page')`.

Express is a very barebones framework which has led to lots of third-party middleware libraries. A middleware function that comes built into Express would be `static` to serve static files:

```js
const path = require('path');

// ...

app.use(express.static(path.resolve(__dirname, 'public')));
// allows for files in the public directory to be accessed by their filename
```

`express.static` embraces the middleware approach: if the file requested is in the specified directory, it sends it as a response. If not, execution gets deferred to the next middleware function.

There are many commonly used third-party middleware packages. Some of them are listed here:

- `morgan`: a logger
- `body-parser`: makes the request body available as a parsed object, included in Express 4.16+
- `cookie-parser`:can be coupled with `express-session` to make cookie data available on the client and the server
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

The second argument is usually a callback function that gets executed like a middleware if the route is matched. There can also be multiple callbacks (either as an array or just separated by commas) that get treated like a series of midleware functions (with a call to `next('route')` bypassing any remaining route callbacks).

For more fine-grained control over the route, regular expressions can be used:

```js
app.get(/^\/users\/(\d+)$/, (req, res) => {
  // only matches if the parameter consists of purely digits
  // e.g. /users/3456, *not* /users/horse_poo 
  const userId = Number(req.params[0]);
});
```

URL parameters are not the only way to pass information via the URL. Another way is to use _query strings_ (e.g. `/search?for=javascript&src=stackoverflow`). Query strings are made available in the `request.query` object. For the example, there would be `req.query.search` and `req.query.src`.  
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

`response.redirect()` can redirect to a different path (and therefore hand over control to a different routing handler).

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

Express adds a method to the response object called `render()` which renders the template (if it is found in the specified `views` folder) and sends it to the client.

```js
app.set('views', path.resolve(__dirname, 'views'));
app.set('view engine', 'ejs');

// ...

app.get('/', (req, res) => {
  res.render('index', { name: 'Markus' });
});
```

This renders the view `/views/index.ejs` and passes it data in the form of an object, whose properties can be dynamically inserted in the EJS template.

## Embedded JavaScript (EJS)

_Embedded JavaScript (EJS)_ is one of the simplest and also most popular view engines available for use in Express. Its syntax is very similar to the ERB templating language available in the Ruby world.

EJS templates can simply represent HTML with no difference in syntax. Several tags are used to inject dynamic content into the surrounding HTML:

- `<%` - no output, used for control flow or other operations without visual representation
- `<%=` - outputs the value into the HTML (escaped)
- `<%-` - outputs unescaped value into the HTML
- `%>` - normal ending tag
- `-%>`- trim-mode end tag, trims the following newline

_Includes_ can be included into the current template by calling `include` (d'oh).

```html
<%- include('users/show', { userData: user }); -%>
```

The raw output tag should be used for includes to prevent double-escaping the HTML output.

The easiest way to pass data into an EJS template from Express is by using the data object for the `render` method.

```js
response.render('index', { data: 'someData' });
```

This means explicitly setting properties on that object for every `render()` call in every route. Another option is to use properties on `app.locals` or `res.locals`, which are automatically mixed into the data object for any `res.render()` call.

```js
app.locals.delimiter = '?';
```

# Express and MongoDB

MongoDB is a _document database_, compared to the relational databases like PostgreSQL or MySQL. Each MongoDB server manages multiple databases, that consist of one or many collections with one or many documents in it. Those documents are in BSON format (_Binary JSON_) which get translated to and from a Node.js application to a proper JavaScript object. Therein lies one of the advantages of MongoDB: its data model is almost identical to what JavaScript uses for its object storage/parsed JSON.

In order to communicate with MongoDB from a Node.js application, an ORM (or ODM) like _Mongoose_ can be used, that provides an easy API for the MongoDB driver implementation for Node.js.

Everything starts with a _Mongoose Schema_. While _schema_ is a loaded word from the SQL world, it basically describes the fields of a MongoDB collection: their properties, types and requirements. It might look like this:

```js
const entrySchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  mail: String,
  date: {
    type: Date,
    default: Date.now,
  },
  entry: {
    type: String,
    required: true,
  },
});
```

The simplest form of a field declaration is by just declaring the type (`mail: String` is a shorthand for `mail: { type: String }`).

Permitted data types are: `String`, `Number`, `Date`, `Buffer`, `Boolean`, `Array`, `Map` and the more uncommon types `Mixed`, `ObjectId` and `Decimal128`.

A schema can also hold instance methods that will be available on all documents created from a model (that itself is compiled from the schema). Those instance methods can either be added via the `Schema.prototype.method()` or directly on the `Schema.methods` object.

```js
entrySchema.methods.getMail = function getMail() {
  return this.mail || 'no-mail@provid.ed';
}
```

The schema now needs to be attached to an actual model:

```js
const Entry = mongoose.model('Entry', entrySchema);
module.exports = Entry;
```

In a Node.js context, this `Entry` model will be used for documents created from the model, so exporting it for external requiring is necessary.

The application itself can now use a model to either
- create a new document (an instance of a model)
- query existing documents by using model functions (like `find`)

In order to do both, a connection to a MongoDB server needs to be established:

```js
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/guestbook'); // connects to database 'guestbook' on localhost
```

Creating a document from a model is as simple as calling its constructor function.

```js
const Entry = require('./models/entry');

const newEntry = new Entry({
  username: 'Testuser',
  mail: 'testuser@testuserland.com',
  entry: 'Am I done here?',
});
newEntry.save();
```

Running queries is done by calling one of a model's static helper functions. There are several functions for standard CRUD operations like:
- `deleteMany()` and `deleteOne()`
- `find()` and `findOne()`
- `updateMany()` and `updateOne()`

Each of those functions returns a `Query` object. Since every query is resolved asynchronously, it will need either a callback or a chained `then` call to actually be able to access the query results.

```js
Entry.findOne({ name: 'Markus' }, function (err, entry) {
  if(err) handleError(err);
  console.log(`Entry is ${entry}`);
});

// or use the query as a thenable:

Entry.findOne({ name: 'Markus' })
  .then(entry => console.log(`Entry is ${entry}`),
        err => console.log(`Encountered an error: ${err}`));
```

Note, however, that queries in Mongoose are **not** Promises: multiple `then()` calls execute the query multiple times as well! In order to recieve a real promise as the return value, the `exec()` method can be called on a query.

One of Mongoose's convenience features is _chainable queries_. Calling query functions without a callback or a `then()` allows for chaining query helper functions together.

```js
Entry
  .find({ name: 'Markus' })
  .limit(3)
  .sort({ date: 'desc' })
  .exec(callback);
```

In a query chain `.lean()` would convert the mongoose document(s) - that have all those properties and complex helper methods on them - to plain JS objects. This can save both memory and runtime if simple objects are all that's needed (e.g. in an API that will send only JSON as a response anyway).

(See https://mongoosejs.com/docs/api.html#Query for a list of all query helpers.)

### Associations

Relationships between collections in MongoDB can be expressed with _associations_. For that to work, a schema can define a field of the type `ObjectId` (which the default `_id` property of any document is an instance of) plus a _reference_.

```js
const userSchema = new mongoose.Schema({
  name: String,
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Orga',
  }
});

const orgaSchema = mongoose.Schema({
  name: String,
});

const User = mongoose.model('User', userSchema);
const Orga = mongoose.model('Orga', orgaSchema);
```

The `ref` property of the `organization` field in the `userSchema` references the name provided to the `mongoose.model` creation method.

When saving such an `ObjectId`, the appropriate id can be determined by querying for the desired document and referencing the `<object>._id` property.

In order to receive data from a query in those fields that is the actual referenced object itself (and not just the `ObjectId`), a query can be constructed like this:

```js
const match = User.find({})
  .populate('organization')
  .exec()
```

In comparison to an SQL `JOIN`, this actually executes a second query and combines the two afterwards, so liberally using `populate()` to simulate a foreign key is not advised for performance reasons. 

### Virtuals

_Virtuals_ are a kind of computed property that doesn't exist in the document itself, but instead gets computed every time the virtual property is accessed. There can bei either virtual getters or virtual setters.

```js
const entrySchema = new mongoose.Schema({
  // ...
  favorites: [],
});

entrySchema.virtual('favoriteCount')
  .get(function() {
    return this.favorites.length;
    // remember to not use arrow functions here, so that `this`
    // correctly refers to the entry, not the global object
  })
```

### Middleware

_Middleware_ (also referred to as _hooks_) are functions that will be executed before or after a certain operation via `pre` and `post` hooks. Middleware can be defined for:
- documents (supporting operations to hook into like `validate`, `save` or `remove`)
- queries (for e.g. `find`, `findOne` or `update`)
- aggregates
- models

```js
const entrySchema = new mongoose.Schema({
  // ...
});

entrySchema.pre('validation', function() {
  console.log('stuff done before validation, so doing my own first.');
});

entrySchema.post('save', function() {
  console.log('right after saving'.);
});
```

Middleware functions can receive a function argument `next` that refers to the next middleware function to be called afterwards. With that, multiple middleware functions can be executed one after the other asynchronously.

`post` hooks receive an object as their first function argument that - depending on what the the middleware type is - refers to the affected document(s)/model(s)/...

Middleware can be used for many things, one common use case is maintaining integrity with the `ObjectId` references mentioned above. If a document is deleted and another document references that deleted document via its `_id`, there is no automatic deletion of that reference. Instead, a middleware can be defined for that schema that checks with a `post` hook after the removal for any possible references in another schema's documents and update them as well.

### Compound indexes

Using the `unique` property in a schema creates an index for that field automatically. This can also be done in a different way by explicitly defining such an index:

```js
const schema = new mongoose.Schema({ name: String } });

schema.index({
    name: 1,
  }, {
    unique: true,
  }
});
```

This notation can also be used to create _compound indexes_, meaning indexes over more than one field:

```js
  schema.index({
    item: 1,
    qty: 1,
  });
```

For a schema with two fields `item` and `qty`, this index would support quick lookup for queries over the two fields like `Stock.find({ item: 'fnords', qty: { $gt: 5 }})`. The sort order actually matters for compound indexing, so the field property can be set to either `1` (ascending) or `-1` (descending).

## Authentication with Passport.js

_Passport_ is an authentication middleware that can easily be used as middleware in Express. Setting it up and using it inside of an app requires a few steps of configuration.

### Defining an authentication strategy

There are different mechanisms that can be used for authentication. One common approach is to verify a username and a password by looking both up in a data store and determining if some valid credentials have been provided by a user.

Passport has packages for this and a ton of third-party authentication services like _OAuth_. `passport-local` is used for a username/password strategy and exposes a constructor function called `Strategy` to use in the Passport configuration.

```js
const LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy((name, password, done) => {
  User.findOne({ name })
    .then((user) => {
      if (!user) return done(null, false, { message: 'Username not found.' });
      if (!user.correctPassword(password)) return done(null, false, { message: 'Password incorrect.' });
      return done(null, user);
    },
    (err => done(err)));
}));
```

`passport.use()` registers an authentication strategy. Each strategy then requires a _verification callback_ to resolve the credentials for any user. This callback receives three arguments: the provided `username` and `password` and a `done` function that will be returned with certain arguments depending on whether the credentials are valid or not.

This `done` callback follows the typical Node.js style:

```js
return done(null, user);
```

The first parameter will either contain an error that occured during the credential verification (like the database not responding) or will otherwise just be `null`. The second parameter receives the user information on a successful lookup, which will be populated to `req.user` to be used in routes/other middleware.

```js
passport.serializeUser((user, done) => {
  return done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id)
    .then(user => done(null, user),
      err => done(err, null));
});
```

After the initial login, a session can be created for each user (using either cookies or another data store like Redis). Passport serializes information about each user as defined with the `serializeUser` and `deserializeUser` methods. When used like above, Passport will only store the user ID in the session cookie and lookup the whole user data on each subsequent request for the population of `req.user`. Again, those methods return a `done` callback specifying errors or the required information.

### Defining application middleware

This is as simple as registering to middleware functions for an Express app.

```js
app.use(passport.initialize());
app.use(passport.session());
```

The first line adds Passport functionality to the app itself, the second handles support for session-based persistence of authentication.  
Note that this requires general session support to be intialized before. Express no longer includes this functionality out of the box, so a middleware like `express-session` needs to be registered before Passport's session middleware.

### Using Passport authentication in a route handler

Passport provides a middleware function called `authenticate` that can be passed into a route handler for authentication.

```js
router.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true,
}));
```

`'local'` refers to the strategy to be used (local username/password verification in this case) and can receive another object defining behavior on either success or failure. When using `failureFlash` (or its counterpart `successFlash`), it can be either set to `true` or receive a string notification to pass to `req.flash()` instead. Since we've declared optional messages directly in Passport's verification callback, passing `true` in case of an error will have the flash message middleware use those instead. The conditional redirects specify which route handler will be responsible for finishing the request and sending the actual response.