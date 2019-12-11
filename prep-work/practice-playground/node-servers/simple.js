const http = require('http');

http.createServer((req, res) => res.end('pong')).listen(1338, () => console.log('Listening ...'));
