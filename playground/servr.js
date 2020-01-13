const server = require('http').createServer();
server.listen(8080);

const handleRequest = () => 'nothing';
const handleError = () => 'nothing';

server.on('request', handleRequest); // the anonymous arrow function from the previos snippet
                                       // works exactly the same way
server.on('clientError', handleError); // when an error with the request itself occurs, this event fires