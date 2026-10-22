const socketIO = require('socket.io');
const { originCheck } = require('./origins');

let io;

const initializeSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: originCheck,
      methods: ['GET', 'POST'],
      credentials: true,
      allowedHeaders: ['content-type', 'cookie'],
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    transports: ['websocket', 'polling'],
    perMessageDeflate: false,
    maxHttpBufferSize: 1e6,
    // FIX: removed allowEIO3 (legacy v2 client support nobody needs).
  });

  console.log('✅ Socket.IO initialized');

  io.engine.on('connection_error', (err) => {
    console.error('❌ Socket connection error:', err.message);
  });

  return io;
};

const getIO = () => {
  if (!io) throw new Error('Socket.IO not initialized!');
  return io;
};

module.exports = { initializeSocket, getIO };
