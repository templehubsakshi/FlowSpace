const socketIO = require('socket.io');

let io;

const initializeSocket = (server) => {
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://flow-space-black.vercel.app', // ✅ Your exact Vercel URL
    'https://flow-space-b1f3frmhf-templehubsakshis-projects.vercel.app'
  ];

  io = socketIO(server, {
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST'],
      credentials: true,
      allowedHeaders: ['authorization', 'content-type']
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    transports: ['websocket', 'polling'],
    allowEIO3: true
  });

  console.log('✅ Socket.IO initialized');
  console.log(`🔗 Socket allowed origins: ${allowedOrigins.join(', ')}`);

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized!');
  }
  return io;
};

module.exports = { initializeSocket, getIO };