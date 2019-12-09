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
