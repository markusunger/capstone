# API Design in Node.js

Following the REST principles, a web API combines resources (like data from a database), URL paths and the different HTTP request verbs to present all possible interactions that an application provides.

## APIs with Express

The basic approach in writing an API server application with Node.js and Express is the same as for a normal Express application and detailed in [./Node_and_Express.md](Node_and_Express.md).

So a very simple API that can receive a `GET` and a `POST` request on the app root path might look like this:

```js
const http = require('http');

const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

require('dotenv').config();

const app = express();

app.disable('x-powered-by');

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  next();
});

app.get('/', (req, res) => {
  res.json({
    prop1: 'yeah',
    prop2: 1337,
  });
});

app.post('/', (req, res) => {
  res.status(200).json(req.body);
});

module.exports = () => {
  const server = http.createServer(app);
  server.listen(process.env.HTTP_PORT, () => console.log(`Server listening on port ${process.env.HTTP_PORT}`));
};
```

Disabling the `x-powered-by` header (would normally contain `'Express'`) is advised to hide the underlying server software. This is not something that's relevant to a client anyway.

Using the `cors` middleware is going to be described later here, but in essence, it allows a client from a different host than where the server runs on to make HTTP requests. CORS _(Cross-Origin Resource Sharing)_ is a mechanism that allows clients to make these cross-origin requests that would normally be prevented by the _same-origin policy_ implemented in web clients. `cors` is reponsible for setting a response header called `Access-Control-Allow-Origin` with a value of `*`.

Running `curl http://localhost:1337` proves that this simple and useless API runs correctly. A great open-source tool for making more complicated requests to a REST API with support for lots of payloads is _Insomnia_ (https://insomnia.rest/).

Express supports a wide variety of HTTP methods for handling requests. While a web application needs to deal only with `GET` and `POST` (those are the two types of requests that web browsers can issue), REST expects the appropriate HTTP verbs to be used in order to allow more fine-grained description of the intended operation. Express supports `DELETE`, `PUT`, `PATCH` and a whole heap of other HTTP verbs in its route definitions.

```js
app.put('/', (req, res) => {
  // handles a PUT request to the root path
});
```

A convenient way of handling different verbs for a specific route, the Express `route()` method can be called on a router object to chain verb methods quickly:

```js
const someMiddlewareForAllRoutes = (req, res, next) => next();

app.route('/user')
  .all(someMiddlewareForAllRoutes)
  .get((req, res) => res.json({ response: 'user get request' }))
  .post((req, res) => res.json(req.body));
```

Defining an `all()` handler first is one way of registering route-wide middleware as it runs for all HTTP verbs first.

## RESTfulness

_Resources_ stand at the center of REST. Every resource has its URI representation in the API. So a `device` resource would be accessible under the `/devices` URI, with a single resource of that type being accessible i.e. at `/devices/:id`. Using nouns in the plural is part of the REST convention.

// to be expanded

## API authentication with JSON Web Tokens (JWT)

Authentication is just one of the three things API auth (and web auth in general) often refers to:

1. Authentication (determining if a request can proceed or not)
2. Authorization (determining whether the authenticated request has the permissions to proceed)
3. Identification (determining who made the auth'ed request)

JWT is an open standard for securely transmitting information as JSON objects between i.e. a web browser and a server. To make this information trustable, it is digitally signed (by either using a secret or a public/private key pair).  
This means that a signed token can verify the integrity of the token's content. Optional encryption can also hide that content from any third party.

JWT consist of:

- a header
- the payload
- a signature

Those three parts are separated by a dot (`.`), making it look like `header.payload.signature`.

The header is a JSON object that typically consists of two parts: the token type and the algorithm used for signing the token. This JSON gets serialized by `Base64Url` encoding it, creating the first part of the JWT.

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

The payload contains so-called _claims_ in the form of another JSON object. Each claim maps to a key-value pair in the payload JSON object.

```json
{
  "sub": 1234567,
  "name": "superuser",
  "admin": true
}
```

Some of these claims are defined in the JWT spec and have a pre-defined meaning, others can be user-specific, custom information. Claims as defined in the spec have three-letter keys like `"sub"` in the payload above (a claim that identifies the subject of that JWT). Another commonly used defined claim is `"exp"` (for an expiration date from when the JWT will be considered invalid).

The (optional) signature uses a signing algorithm (often the SHA-256-based _HMAC_) that hashes both the encoded header and payload to form the third part of a JWT.

The header and payload examples above, signed with HMAC and the secret `NodeAPI` would result in the following JWT:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEyMzQ1NjcsIm5hbWUiOiJzdXBlcnVzZXIiLCJhZG1pbiI6dHJ1ZX0._kfM4_WwGMlxrdfyY_arJVJmNpAkxNJVOZ-k-rQq4VU
```

### JWTs in Practice

JWTs are issued by the server with a client response and are then sent in each subsequent request by that client, e.g. as a header field called `Authentication` with the content `Bearer <token>` (to signal the Bearer token strategy being used).

In Node.js, the `jsonwebtoken` package by Auth0 provides an easy-to-use interface to JWT signing and verifying. A very simple authentication might look like this:

```js
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
```

JWT can easily be integrated into a full-fledged auth library like Passport.js (see [./Node_and_Express.md](Node_and_Express.md)).