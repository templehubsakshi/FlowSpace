const socketIO = require('socket.io');

let io;

const initializeSocket = (server) => {
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',  // ✅ Added
    'http://localhost:3000',
    'https://flow-space-black.vercel.app'
  ];

  io = socketIO(server, {
    cors: {
      origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        if (origin.endsWith('.vercel.app')) return callback(null, true);
        console.warn(`❌ Socket blocked origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      },
      methods: ['GET', 'POST'],
      credentials: true,
      allowedHeaders: ['content-type', 'cookie'],
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    transports: ['websocket', 'polling'],
    allowEIO3: true,
    perMessageDeflate: false,
    maxHttpBufferSize: 1e6
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