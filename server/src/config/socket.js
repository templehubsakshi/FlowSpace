const socketIO = require('socket.io');

let io;

const initializeSocket = (server) => {
  io = socketIO(server, {//server ke upar socket laga do
    cors: {
      origin: process.env.SOCKET_CORS_ORIGIN || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true
    },
    pingTimeout: 60000, // 60 seconds
    pingInterval: 25000 // 25 seconds
  });

  console.log('✅ Socket.IO initialized');

  // Handle connections
  io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.id}`);

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized!');
  }
  return io;
};

module.exports = { initializeSocket, getIO };