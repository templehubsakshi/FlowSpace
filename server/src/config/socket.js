const socketIO = require('socket.io');

let io;

const initializeSocket = (server) => {
  // ✅ PRODUCTION-READY SOCKET.IO CONFIGURATION
  const allowedOrigins = process.env.SOCKET_CORS_ORIGIN 
    ? process.env.SOCKET_CORS_ORIGIN.split(',').map(url => url.trim())
    : ['http://localhost:5173', 'http://localhost:3000'];

  io = socketIO(server, {
    cors: {
      origin: function(origin, callback) {
        // Allow requests with no origin (mobile apps, etc.)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
          callback(null, true);
        } else {
          console.warn(`❌ Socket connection blocked from: ${origin}`);
          callback(new Error('Not allowed by CORS'));
        }
      },
      methods: ['GET', 'POST'],
      credentials: true,
      allowedHeaders: ['authorization', 'content-type']
    },
    // ✅ Production timeouts
    pingTimeout: 60000,
    pingInterval: 25000,
    // ✅ Connection settings
    transports: ['websocket', 'polling'],
    allowEIO3: true,
    // ✅ Performance settings
    perMessageDeflate: false,
    maxHttpBufferSize: 1e6 // 1MB
  });

  console.log('✅ Socket.IO initialized');
  console.log(`🔗 Socket allowed origins: ${allowedOrigins.join(', ')}`);

  // ✅ Connection monitoring
  io.engine.on('connection_error', (err) => {
    console.error('❌ Socket connection error:', err.message);
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