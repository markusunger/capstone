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

function getFile(name) {
  return new Promise(resolve => fakeAjax(name, resolve));
}

const pr1 = getFile('file1');

pr1
  .then(v => v)
  .then(v => v.toUpperCase())
  .then(v => console.log(v));
