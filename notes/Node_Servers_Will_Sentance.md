# The Hard Parts of Servers & Node.js

Internally, _Node.js_  relies on underlying C++ code for access to a lot of the bare-metal internals of the server: file system, sockets, CPU (for intensive computing like in Node's cryptography module).

For example, the `http` module of Node.js relies on C++ code that itself relies on a multi-platform library called `libuv` that drives most of Node's event-driven, asynchronous, single-threaded I/O. `libuv` handles the actual socket creation, activity polling and callback execution when a socket has incoming data.

## A primer on `libuv`

`libuv` (http://docs.libuv.org/en/v1.x/design.html) is a library written in C. At its core lives an event loop for all I/O operations that gives non-blocking access to sockets which are regularly polled by an OS-dependent mechanism. Socket activity (events like data that is ready to be read, a timer that has timed out, ...) is passed to any registered callbacks.

This polling is responsible for the asynchronous, non-blocking nature of `libuv`. While normally a `read` operation on a socket would completely block execution, `libuv` is using background polling to watch the socket for actual activity which triggers a notification that Node can use to allow an application to process the data.

`libuv` supports _handles_ (long-lived objects, like a timer or a persistent TCP connection) and _requests_ (short-lived operations like writing data or opening a file, can and often will be tied to a handle).

`libuv` also relies on a thread pool, mainly for file I/O (but not network I/O!) whose OS-specific implementations seem to be lacking somewhat, making blocking operations under the hood necessary. The default thread pool size of 4, meaning that four parallel file I/O operations can actually run in parallel before any more get queued.

It's pretty obvious why `libuv` fits so well into JavaScript's asynchronous, non-blocking nature.

## Events and Errors with `http`

A simple `http` server can look like this:

```js
require('http').createServer((req, res) => res.end('pong')).listen(8080);
```

The request-handling function passed into `createServer` only gets invoked, though, when a valid HTTP request is received. So if a malformed or otherwise invalid HTTP request is received through a `libuv` I/O operation (reading from the socket that the `http` server was bound to), the request handler is not called. But the underlying error doesn't get swallowed, instead, an event is fired by Node that the server object (returned by `createServer()`) could listen to:

```js
const server = require('http').createServer();
server.listen(8080);

server.on('request', handleRequest); // handleRequest gets called for each successful HTTP request,
                                     // providing access to the request and response object, like before
server.on('clientError', handleError); // when an error with the request itself occurs, this event fires
                                       // and handleError gets invoked
```

## Node Streams

File streaming (or I/O streams in general) all follow the same pattern of `libuv` doing the actual I/O and Node's C++ bindings emitting events that trigger the callbacks provided in Node.js code to execute. In the case of a stream, an event fires for each chunk of data received from the I/O operation, allowing processing parts of it and not having to store everything in memory before it can be processed as a whole.

In the case of streams, this looks like:

```js
const fs = require('fs');

const streamingData = fs.createReadStream('./some_file_on_disk.txt'); // create the stream

streamingData.on('data', handleChunk); // for each (by default 16kb-sized) chunk received, invoke handleChunk
```

## Event loop & queues

There are a few parts playing an important role in Node's asynchronicity:

- the **call stack**: a LIFO data structure that contains all functions currently being run and information about their call site
- the **callback queue**: a FIFO data structure that contains all functions that came from finishing a delayed task (like an I/O operation) or from an emitted event that triggered a callback to be executed.
- the **event loop**: in a series of repeating steps, determines which functions to run next from the several queues (and therefore gets put onto the call stack). Node actually relies on `libuv`'s event loop.

Node.js internally relies on `libuv`'s implementation of an event loop. Each turn of that loop consists of multiple steps, where each step checks and potentially executes certain types of callbacks. There is an order to those checks, that's roughly represented in the following list:

1. Microtasks (`process.nextTick()` callbacks or resolved Promises)
2. Timer-based callbacks (`setTimeout()`/`setInterval()`)
3. I/O callbacks
4. Checks (mainly `setImmediate()` which seems to be badly named, considering that those callbacks execute last)

It's worth remembering that the event loop only progresses through those steps once the call stack is empty. Intensive, blocking operations (like processing a 50 million entry array) can block the event loop and create unresponsiveness of the whole Node application. Thus, the fair treatment of each connection or client is the _application's responsibility_ compared for example to a system like Apache, where each client request is handled by its own thread, with the OS ensuring that execution time gets fairly distributed amongst those threads.

That also means that a Node process is going to exit once there is nothing registered to wait on for the event loop (or a handler is marked with `unref()` to not count towards keeping the event loop alive).

For good in-depth explanations on Node.js, the event loop and `libuv` see:
- https://www.youtube.com/watch?v=P9csgxBgaZ8 (Node's Event Loop From The Inside Out)
- https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/
- http://docs.libuv.org/en/v1.x/design.html

## The exceptions to Node's non-blocking, asynchronous nature

dns.lookup() getaddrinfo() (used in connections with net also when the hostname needs to be resolved)
fs module
crypto for a few methods
http.get/request with a hostname