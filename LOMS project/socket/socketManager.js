const { Server } = require('socket.io');

let io = null;

function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: '*', // for dev only — restrict this later for production
    },
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

// Called from anywhere (simulator, routes) to broadcast updates
function emitUpdate(event, data) {
  if (io) {
    io.emit(event, data);
  }
}

module.exports = { initSocket, emitUpdate };