const socketIO = require('socket.io');

let io;

const initializeSocket = (server) => {
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://flow-space-black.vercel.app'
  ];

  io = socketIO(server, {
    cors: {
      origin: function(origin, callback) {
        // Allow requests with no origin
        if (!origin) return callback(null, true);
        
        // Check if origin is in allowed list
        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        
        // ✅ NEW: Allow ALL Vercel preview deployments
        if (origin && origin.endsWith('.vercel.app')) {
          console.log(`✅ Socket allowing Vercel origin: ${origin}`);
          return callback(null, true);
        }
        
        console.warn(`❌ Socket blocked origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      },
      methods: ['GET', 'POST'],
      credentials: true,
      allowedHeaders: ['authorization', 'content-type']
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    transports: ['websocket', 'polling'],
    allowEIO3: true,
    perMessageDeflate: false,
    maxHttpBufferSize: 1e6
  });

  console.log('✅ Socket.IO initialized');
  console.log(`🔗 Socket allowed: ${allowedOrigins.join(', ')} + all *.vercel.app`);

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