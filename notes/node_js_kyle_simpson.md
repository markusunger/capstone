# Digging into Node.js

Node.js owes its strengths to how JavaScript handles asynchronous, I/O-bound tasks: the event loop allows for managing the intersection between the frontend (the user-facing UI) and the backend systems (databases etc.) with a non-blocking approach that allows lots of concurrent connections.

## Command-Line Applications with Node

### Input and Output

To integrate with the operating system, Node has to follow the POSIX standard and - for outputs and inputs - the Standard I/O system: there's an interface for standard input (`stdin`), standard output (`stdout`) and a special error output system (`stderr`).

The `process` object made available by Node allows POSIX access. `process.stdout` exposes a stream to the standard output, calling `write` on it allows output to be written to whatever output is defined in the hosting environment (`console.log` does a bit more processing internally, so it's not equivalent to the `process.stdout.write` method).

Similarly, `console.error` writes to the `stderr` stream. There's no visual difference between `log` and `error` in the standard environment output like a shell, but running this script:

```js
console.log("standard output");
console.error("standard error");
```

with a file redirection (`node script.js 1>/dev/null`, meaning that stream 1, the standard output, gets redirected into the eternal void), only the error message will be output to the console (because it is output to the stream with the identifier 2).

`process.stdin.read()` would be the equivalent of directly accessing the input stream, but is complex in its details and is dependent on a lot of factors like the hosting environment.

### Executing a Node CLI script

To enable direct execution of a Node script from the command line without prepending the `node` command, a _shebang_ line as the first line of the script, followed by the path to the Node executable (or the more system-agnostic `env`), is required.

```js
#! /usr/bin/env node

console.log('This works!');
```

This tells the system to find `node` on the system and runs the script through it (`./script.js`). Changing the access flags in a UNIX environment might be necessary (`chmod u+x script.js`).

### Arguments

Command line parameters are often used to configure what the script does or specify certain data that it needs. Those arguments passed into the wscript can be accessed via `process.argv`, an array with:

1. the location of the executable the script runs through
2. the file location of the script itself
3. the arguments themselves as separate array elements (basically everything space-delimited)

The `minimist` package (cool, because it requires no other dependencies, alternatives: `yargs`, which uses and builds on `minimist`) is useful to automatically parse the arguments, creating an object with key-value-pairs for the common syntax of passing arguments to a Node script:

```js
const args = require('minimist')(process.argv.slice(2));
```

If calling the script with `./script.js --hello=world`, the `args` object would contain a key `hello` with the value `world` (with possible unrecognized and unparsed input being collected as an array under the `_` key).

`minimist` allows for a configuration object to be passed as the second argument:

```js
  const args = require('minimist')(process.argv.slice(2), {
    boolean: ['help'],
    string: ['file']
  });
  ```

Calling the script with `./script.js --help=foobar --file=test`, the `args` object will hold a boolean value (`true`) in the `help` key, and a string under `file`.

### Handling files

The `path` module provided by Node allows for resolving filenames to get a full, valid path:

```js
const path = require('path');
// *snip*
console.log(path.resolve(args.file));
```

Running the script with `./script.js --file=hello` would output a full path to `hello` based on the location where the script is run from (e.g. `/home/markus/node-exercises/hello`). It can also handle relative file names (`../hello`).

The global `__dirname` variable holds a reference to the current working directory (where the script resides). This is used by `path.resolve()` if there is no full path provided.

`path.join()` is useful to combine any provided file paths with the OS-specific separator (`/` or `\`) and form a valid path.

The `fs` module from Node is used for accessing files. The basic method for reading a file's contents is by using `readFileSync`:

```js
fs.readFileSync(filePath);
```

By default, `readFileSync` (as well as other methods) outputs a binary buffer (which would be displayed correctly when fed into `process.stdout.write`, but not if written with `console.log`). In order to convert into a usable string, a second argument can specify the character encoding:

```js
fs.readFileSync(filePath, 'utf8');
```

In general, writing buffers with `process.stdout.write` is slightly more efficient than having the internal processing done by `console.log`.

`readFile()` expects a callback to read the file asynchronously instead of in a synchronous way (which seldomly matters for CLI scripts).

```js
fs.readFile(filePath, function onRead(err, content) {
  if (err) {
    console.error(err.toString());
  } else {
    // content is a binary buffer, so it would need to be converted
    // to a string for further operations
  }
});
```

### Input

`get-stdin` is a package for easy input reading from the standard input stream:

```js
getStdin().then(readHandler).catch(errorHandler);
```

### Environment variables

Environment variables can be accessed with the `process.env` object, where an environment variable defined with:

```
HELLO=WORLD ./script.js
```

can be read as the property `HELLO` with the value `WORLD`:

```js
console.log(process.env.HELLO); // WORLD
```

## Streams

Resource for deeper understanding: https://github.com/substack/stream-handbook

Streams are a fantastic way of elegantly handling larger data. For example, if a file needs to be read from the disk and then sent via the Node `http` server to the client, the standard approach of doing it would be pretty inefficient: reading with `fsReadFileSync()` would require buffering the whole file in memory before it can be sent to the client. Depending on the size of the file, this could not just take up lots of memory but it also increases the time the client has to wait before data is finally sent to it. Plus, if the client is on a throttled or slow connection, that big buffer of data is not necessary. Instead, by using streams, data can be read in chunks from the disk and immediately sent to the client. Streams automatically handle backpressure so that a slow or high-latency client does not create a huge buffer of data chunks that will then be only slowly sent.

_Simplex streams_ are streams that can be either read from or written to, _duplex_ means that both can be done on the same stream.

```js
stream1.pipe(stream2); // returns another readable stream
```

This pipes a readable stream (`stream1`) into a writeable stream (`pipe2`) by calling `pipe()` on the readable one, allowing chunks of data (~ 65k bytes) to flow directly from one stream to another. The `pipe` method returns the writeable target stream as another readable stream, so multiple `pipe` commands can be used together:

```js
a.pipe(b).pipe(c).pipe(d);
```

Creating a readable stream is possible with the `stream` package or by using the `fs` module (if it should be read from a file):

```js
const Readable = require('stream').Readable;
const readableStream = new Readable;

const otherReadableStream = fs.createReadStream(filePath);
```

In order to send data to the manually created stream, `push` is used on the stream object:

```js
readableStream.push('some data');
readableStream.push('more data');
readableStream.push(null); // signals the end of the stream
```

In the example above, `readableStream` does not have a receive to consume the input, so any chunk is buffered until, let's say, `readableStream` is piped into `stdout`.

Accordingly, a writeable stream can be created in a similar fashion:

```js
const Writable = require('stream').Writable;
const writeableStream = new Writable();

writeableStream.write('data');
```

Outputting a stream means either piping it into `stdout` (`outgoingStream.pipe(process.stdout))`) or writing it into a file. For the latter, the `fs` module provides a method to create a writeable stream for a file on the disk:

```js
let targetStream = fs.createWriteStream(filePath);
```

For transforming a stream, the built-in `stream` module has a `Transform` constructor.

```js
const Transform = require('stream').Transform;
const transformedStream = new Transform({
  transform(chunk, encoding, callback) {
    this.push(chuck.toString().processChunk());
    callback();
  }
});
```

The `Transform` constructor takes a configuration object with the most important property being a `transform` function. This function takes three arguments: the `chunk` portion of the stream that is fed into it, the encoding and a callback to get executed when the transformation is finished. `chunk` itself is going to be another buffer object, so in order to process it with String methods, a `toString()` conversion is necessary. To push the processed chunk into the new stream, `push()` is used on that `Transform` object.

All streams are treated asynchronously, so in order to define code that runs after a stream is finished processing, Promises come in handy:

```js
async function processStream(inStream) {
  // some piping and stuff
}

processStream(stream)
  .then(function onComplete() {
    console.log('Finished processing.');
  })
  .catch(function onError(error) {
    console.error('Stream not processed correctly :(');
  });
```

Every stream also fires an `"end"` event once it has streamed completely. Handling that can be done with `stream.on("end", function onEnd() { ... });`.

To cancel or let stream access time out if it exceeds a specific time limit, a third-party module called CAF (_Cancellable Async Flows_) can be included. It wraps a function generator (see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*) so that it looks and behaves like an asynchronous function that can be cancelled at any time. So instead of the `async` approach above, it's possible to rewrite this as:

```js
const caf = require('caf');
function *processStream(signal, inStream) { // returns a generator
  signal.pr.catch(function onError() {
    // the promise on the signal is rejected when it fires,
    // so it's helpful to undo the last piping step and destroy the stream
    outputStream.unpipe(targetStream);
    outputStream.destroy();
  });
  // whatever else is done with the code
  yield outputStream;
}

processStream = CAF(processStream);
let cancellationToken = CAF.timeout(250); // fires the signal once 250 ms have passed
```

### GZIP-compressing a stream

`zlib` is a Node module that supports zipping stream chunks.

```js
let gzipStream = zlib.createGzip();
outgoingStream = outgoingStream.pipe(gzipStream);
```

In Order to decompress a stream, `zlib` again provides a method:

```js
let gunzipStream = zlib.createGunzip();
outgoingStream = outgoingStream.pipe(gunzipStream);
```

## Databases

Databases are used for persistently storing data and being able to access it. A simple relational database is SQLite and its advantage is that it doesn't require a separate server application but it handles the database as a file that is managed by the Node application itself. There's a package for creating and managing connections to a SQLite database in Node:

```js
const sqlite3 = require('sqlite3');
```

Since the `sqlite3` package does not support Promises (and instead only supports the old callbacks), it makes sense to use `util.promisify` to convert the common access methods into a promisifies version:

```js
const util = require('util');

var myDB = new sqlite3.Database(DB_PATH);
SQL3 = {
  run(...args) {
    return new Promise(function c(resolve, reject) {
      myDB.run(...args, function onResult(err) {
        if (err) reject(err);
        else resolve(this);
      });
    });
  },
  get: util.promisify(myDB.get.bind(myDB)), // select a single results
  all: util.promisify(myDB.all.bind(myDB)), // select multiple results
  exec: util.promisify(myDB.exec.bind(myDB)), // 
};
```

To initialize the database scheme, we have to either create it from the application or load a file with SQL statements from disk. For the latter, this would use the async interface created above like this:

```js
const initSQL = fs.readFileSync('./DB_SCHEME.sql', 'utf-8');
await SQL3.exec(initSQL);
```

Any of the SQL methods that have been promisified can be `await`'ed and therefore used in an asynchronous context.

# Web Servers

For handling HTTP request and response cycles, Node.js comes with a standard module called `http`. This can be used to create a simple HTTP web server.

```js
const http = require('http');

http.createServer((req, res) => res.end('pong')).listen(1338, () => console.log('Listening ...'));
```

In theory, the `http` module (and probably `https`) is all that is needed. The request object contains all information to correctly identify routes for different URLs, the path could be regex'ed to allow parameters, etc. In practice, a framework like `Express.js` or `Koa` provides an easier API to handle all this functionality.