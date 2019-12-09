/*
  goal: create backend API that streams a 10 MB text file
        when hitting an endpoint with a HTTP request to see
        how a client handles stream responses that are piped
        to the res object of an Express request
  observation: the client receives the response as chunks, but
               treats it as one request and needs special
               instructions to stream the response as well,
               but browser support for stream creation and processing
               is still in its early phases

*/

const fs = require('fs');
const path = require('path');
// const stream = require('stream');
const cors = require('cors');
const app = require('express')();

app.use(cors());

app.get('/', function onRequest(req, res) {
  console.log('Handling request ...');
  const fileStream = fs.createReadStream(path.resolve('10mb.txt'));
  fileStream.pipe(res);
});

app.listen(1337, function onStartup() {
  console.log('Server started on port 1337');
});
