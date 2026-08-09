const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

app.use(express.static('public'));

io.on('connection', (socket) => {
  console.log('⚡ Client Connected:', socket.id);

  socket.on('toggle-relay', (data) => {
    console.log('Control Command Received:', data);
    io.emit('hardware-status', data);
  });

  socket.on('disconnect', () => {
    console.log('❌ Client Disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Real-time Control Server running on http://localhost:${PORT}`);
});