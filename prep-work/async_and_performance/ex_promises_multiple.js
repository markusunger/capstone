/* eslint-disable */

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
  return new Promise((resolve) => {
    fakeAjax(file, resolve);
  });
}

// ['file1', 'file2', 'file3']
//   .map(getFile)
//   .reduce((chain, p) => chain.then(() => p).then(output), Promise.resolve());

['file1', 'file2', 'file3']
  .map(getFile)
  .reduce(function combine(chain, prom) {
    return chain.then(function funcThen() {
      return prom;
    }).then(output);
  }, Promise.resolve());

// The above is equivalent to:

// Promise.resolve()
//   .then(function() {
//     return p1;
//   }).then(output)
//   .then(function() {
//     return p2;
//   }).then(output)
//   .then(function () {
//     return p3;
//   }).then(output);
