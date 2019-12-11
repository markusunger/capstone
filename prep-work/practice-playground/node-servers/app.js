const http = require('http');
const fs = require('fs');

function handleRequest(req, res) {
  let body = fs.readFileSync('./template.html', 'utf8');
  body = body.replace('%%URL%%', req.url);
  res.writeHead(200, {
    'Content-Length': Buffer.byteLength(body),
    'Content-Type': 'text/html',
  });
  res.end(body);
}

const httpserv = http.createServer(handleRequest);

httpserv.listen(3030);
