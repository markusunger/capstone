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

// **************************************

function getFile(file) {
  return new Promise((resolve) => {
    fakeAjax(file, resolve);
  });
}

// request all files at once in "parallel"
// ???

const promise1 = getFile('file1');
const promise2 = getFile('file2');
const promise3 = getFile('file3');

// promise1
//   .then((text) => {
//     console.log(text);
//     return promise2;
//   })
//   .then((text) => {
//     console.log(text);
//     return promise3;
//   })
//   .then((text) => {
//     console.log(text);
//     console.log('completed');
//   });

// better solution according to Kyle Simpson, to keep the callbacks
// clean and make them have a single responsibility

promise1
  .then(output)
  .then(() => promise2)
  .then(output)
  .then(() => promise3)
  .then(output)
  .then(() => output('Complete!'));
