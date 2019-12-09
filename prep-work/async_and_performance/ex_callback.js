#!/usr/bin/env node

const responses = {};
const order = [];

function fakeAjax(url, cb) {
  const fakeResponses = {
    file1: 'The first text',
    file2: 'The middle text',
    file3: 'The last text',
  };
  const randomDelay = (Math.round(Math.random() * 1E4) % 8000) + 1000;

  console.log(`Requesting: ${url}`);
  order.push(url);

  setTimeout(() => {
    cb(fakeResponses[url]);
  }, randomDelay);
}

function handleResponse(file, text) {
  if (!(file in responses)) {
    responses[file] = text;
  }

  for (let i = 0; i < order.length; i += 1) {
    const filename = order[i];
    if (filename in responses) {
      if (typeof responses[filename] === 'string') {
        console.log(responses[filename]);
        responses[filename] = false;
      }
    } else {
      return;
    }
  }
  console.log('Completed');
}

function getFile(file) {
  fakeAjax(file, (text) => {
    handleResponse(file, text);
  });
}

// request all files at once in "parallel"
getFile('file1');
getFile('file2');
getFile('file3');
