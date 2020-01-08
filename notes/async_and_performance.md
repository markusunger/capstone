# Asynchrony in JavaScript

While JavaScript is a single-threaded language (meaning that in general, JS only ever executes one piece of code at the time), it is also asynchronous at its core: many methods and built-in browser APIs are executed _asynchronously_, meaning that code doesn't get executed strictly in the order it is written.

The _Event Loop_ is at the core of JavaScript's asynchronous behavior: if, for example, an AJAX request is issued, the call to `fetch` will be passed a _callback function_. The network request itself is handed from the JS engine to the _hosting environment_. Whenever the request is finished, the callback function gets scheduled for execution with the received data made available to it.

The event loop runs until its own queue is empty and each iteration of the loop is called a _tick_. 

## Run-to-completion and race conditions

Due to the single-threaded behavior, JavaScript code chunks without additional asynchronous calls always _run to completion_. But if a function `foo()` and a function `bar()` are:

1. scheduled to be run as a callback after an asynchronous call completes, and
2. mutate some variable in both their scopes

the result is non-determistic (so-called _function-ordering nondeterminism_). There's no way to reliably predict whether `foo()` or `bar()` are scheduled for execution first, because the time it takes for the asynchronous call to complete can wildly differ. This results in what is called a _race condition_, where two functions race for who gets run first.

If both of those functions don't interact however, nondeterminism is no problem.

## Concurrency

_Concurrency_ is the concept of two (or more) chains of events mix and interleave over time and appear to be run simultaneously, even though they're strictly running one event at a time. There are multiple solutions to allow those concurrent "processes" (due to the single-threadedness of JS, they are not processes in a strict sense, but over time, they execute together) to interact with each other. This can be especially necessary if race conditions are a possibility.

# Callbacks

Callbacks are function with deferred execution, meaning that it gets put on the queue of the event loop when a certain operation is finishd (I/O, database write/read, fetching of resources, ...).

There are two major problems with callbacks (what _callback hell_ really refers to):

1. _Lack of sequentiality_, meaning that the order of execution is often non-obvious if multiple callbacks are nested and rely on the completion of the predecessor.

2. _Inversion of control_, meaning that the execution of the callback code and its eventual return (and therefore the continuation of the code!) is controlled by that callback. Possible errors, accidental calling of the callback more often than necessary, swallowed errors, lost context etc. can all happen and give over control of the callback function code to whatever receives the callback. There is a lot of trust issues that have to be mitigated by code to be able to handle all possible results of a callback function.

One try on a solution were _split callbacks_. Asynchronous functions would often take two callbacks: one for a success of the asynchronous operation, one for errors. That just multiplies the trust issues, though: What if none of those callbacks gets called? Or both? In different order?
_Error-first style_ (as seen in most Node.js functions) mans that the callback function has as its first parameter an error value, that - if not false - signals a non-successful operation. That still doesn't solve the trust issue: what if the error doesn't get set? What if it gets set but data is still returned?

# Thunks

A thunk is a function that has no arguments on its own but instead relies on doing a - potentially expensive - operation with a set of hard-coded values, in the end returning the result of that operation.

```js
function add(x, y) {
  return x + y;
}

const thunk = function () {
  return add(4, 5);
}
```

The thunk is a container around that particular collection of state, that can be passed around and calling it always returns the same value. At its core, thunks are very similar to how Promises work when looked at for asynchronous situations:

```js
function asyncAdd(x, y, callback) {
  setTimeout(function () {
    const sum = x + y;
    callback(sum);
  }, 500);
}

const thunk = function (callback) {
  asyncAdd(5, 10, callback);
}

thunk(function (sum) {
  console.log(sum);
});
```

Being able to treat the thunk as the representation of a value removes the time dependency from it (like when dealing with callbacks). The thunk can be passed around and always be treated as a representation of the value. This, however, does not yet solve the problem of inversion of control.

For an example of thunks being used to avoid the time-dependency of regular callbacks, consider this:

```js
function fakeAjax(url, cb) {
  const fakeResponses = {
    file1: 'The first text',
    file2: 'The middle text',
    file3: 'The last text',
  };
  const randomDelay = (Math.round(Math.random() * 1E4) % 8000) + 1000;

  console.log(`Requesting: ${url}`);

  setTimeout(() => {
    cb(fakeResponses[url]);
  }, randomDelay);
}

function output(text) {
  console.log(text);
}

function getFile(file) {
  let text;
  let fn;

  fakeAjax(file, (response) => {
    if (fn) fn(response);
    else text = response;
  });

  return (callback) => {
    if (text) callback(text);
    else fn = callback;
  };
}

const thunk1 = getFile('file1');
const thunk2 = getFile('file2');
const thunk3 = getFile('file3');

thunk1((text1) => {
  output(text1);
  thunk2((text2) => {
    output(text2);
    thunk3((text3) => {
      output(text3);
      output('Completed!');
    });
  });
});
```

The `fakeAjax` function simulates an asynchronous request. We now want to request three strings and output them in the correct order. Each thunk gets defined with its internal state (`'file1'`, `'file2'`, ...) and takes a callback when being called. In order to have the nested thunk output to properly work, an _active thunk_ is needed: if calling `thunk2()` would just initiate the `fakeAjax()` call, nothing would be gained. Instead, in `getFile` we handle both possibilities: if the response text is present before the thunk gets called, it gets saved and we can then immediately pass it to the callback function when the thunk is called. Conversely, if the thunk gets called first, we save the callback function and call it once the response arrives.

# Promises

Promises are _future values_. They encapsulate the _time-dependent_ state of an asynchronous operation (is the value already present or not) and therefore make the Promise itself _time-independent_. Promises are a container around the value, providing an API to easily handle the possible mechanisms surrounding all the cases around the value resolving.

A good analogy to describe a promise would be to view it as an event listener for an event that fires exactly once. The Promise can be passed around so that multiple receivers can listen to it (like declaring an event listener).

Using the event analogy, Promises reverse the _inversion of control_ problem, handing the control of the code execution back to its origin. Listening to an event means being able to determine, for example, unsubscribing after it has first fired to ensure that the following code only gets executed once.

```js
function asyncOperation() {
  return new Promise(function (resolve, reject) {
    // either call resolve(), if the operation was successful
    // or reject(error) if it wasn't
  });
}
```

Promises can have only one resolution value. So multiple parameters to either `resolve()` or `reject()` get ignored. To have multiple values, they can easily be wrapped in an array or object, though.

The Promise resolvement has only two possible outcomes: either a success (with the call of `resolve()`) or a failure (followed by the call to `reject()`). To define this events for the receiver of the Promise, the API provides the `then` method:

```js
const result = asyncOperation(); // asyncOperation returns a Promise

result
  .then(function () {
    // do whatever on a success
  },
  function(err) {
    // do whatever when the Promise was rejected
  });
```

The inheritent _trust issues_ (since callbacks are still used with the Promise API) are solved:

- a Promise only ever resolves once
- it can **either** be a success **or** an error (never both)
- exceptions happening during the Promise's resolving become errors
- Promises are immutable once resolved (the value cannot be changed)

One of the advantages of using Promises is for flow control. In comparison to nested callbacks, Promises can be chained (because a Promise is returned from the success handler of the previous Promise):

```js
firstAsyncOperation()
.then(function () {
  return secondAsyncOperation();
})
.then(function () {
  return thirdAsyncOperation();
})
.then(
  complete,
  error
);
```

Every `then` call returns either a new, immediately resolved Promise with the value of the Promise resolution that the `then` handled (to be able to chain multiple `then` handlers together) or can explicitly return another Promise to sequentially chain Promise resolves.

```js
promise1
  .then(output)
  .then(() => promise2)
  .then(output)
  .then(() => promise3)
  .then(output)
  .then(() => output('Complete!'))
  .catch((err) => output(err));
```

`Promise.resolve()` is a built-in method in the Promise API that returns an immediately resolved Promise with the value passed in as an argument.

## Promise Abstractions

`Promise.all()` takes an array of Promises and allows for one `then` call whose callback receives a list of values in the same order as the origin Promise collection. It's a _Promise gate_, waiting for all Promises to resolve. If any of the Promises passed in rejects, the `then` resolution will not happen.

```js
Promise.all([
  asyncTask1(),
  asyncTask2(),
  asyncTask3()
])
.then(function handleResult(results) {
  return asyncTask4(
    Math.max(
      results[0],
      results[1],
      results[2]
    );
  );
});
```

`Promise.race()` instead only cares if one Promise resolves successfully, no matter which one. It can be used, for example, to set a timeout for another Promises resolution:

```js
  const pr = asyncOperation();

  Promise.race([
    pr,
    new Promise(function (_, reject) {
      setTimeout(() => reject('Async operation timed out!'), 3000);
    });
  ])
  .then(
    success,
    error
  );
```

In the code above, `then` is called when one of Promises for `Promise.race()` gets fulfilled (either a resolve or a reject), which will either be the `asyncOperation()` or the timeout after 3 seconds.

## Error Handling for Promises

If an exception is thrown at any point during the Promise's creation or its resolution (like a `TypeError`), this exception will get caught and the Promise will become rejected. In those cases, the `error` object passed to `reject()` will contain whatever exception object would be caught normally (i.e. when using `try .. catch`).

Rejections propagate through the whole Promise chain until they get handled, either by a second function of a `then` method or a separate `catch` method (with `catch` being a shorthand for a `then(null, function rejected(err) { ... })` construct where the `null` resolution function just passes through the return value from the previous resolution).

That error propagation is possible because if a rejection handler function is omitted, it's implicitly set as a `function rejection(err) { throw err; }`, essentially just rethrowing the error for the next handler to catch.

If a `catch` is added, for example, after the first `then` handler in a chain, the chain continues to resolve. Therefore, if an error isn't a critical failure for the whole Promise chain, it can get catched early. If any error means that the whole chain should stop being executed, a final `catch` statement is the correct approach.

Beware: an exception thrown in the handler for the successful fulfillment of a Promise is not caught by this `then`'s rejection handler!

```js
const p = Promise.resolve(42);

p.then(
    function onFulfilled(val) {
      console.log(val.toLowerCase());
      // throws exception because numbers don't have access to string methods
    },
    function onRejection(err) {
      console.log(err);
      // never reached
    }
);
```

# Generators

_Generators_ are a unique type of function that was introduced with JavaScript ES6. With regards to asynchronous programming, generators  can help solve the issues posed by using callbacks. Whenever a generator function is invoked, it returns a so-called _iterator_ which will step through the generator, pausing anytime when it encounters the keyword `yield`.