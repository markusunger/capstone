const WebSocket = require('ws');

const server = new WebSocket.Server({ port: 8080 });

const broadcastMessage = msg => server.clients.forEach(client => client.send(msg));

function handleConnection(socket, request) {
  console.log(request.headers.host);
  socket.send('Connected!');

  socket.on('message', msg => broadcastMessage)
}

server.on('connection', handleConnection);