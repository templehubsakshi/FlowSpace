const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const http = require('http');
require('dotenv').config();

const authRoutes         = require('./routes/authRoutes');
const workspaceRoutes    = require('./routes/workspaceRoutes');
const taskRoutes         = require('./routes/taskRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const { initializeSocket }   = require('./config/socket');
const { originCheck, getAllowedOrigins } = require('./config/origins');
const socketAuthMiddleware   = require('./middelware/socketAuth');
const handleWorkspaceSocket  = require('./sockets/workspaceSocket');

const isProd = process.env.NODE_ENV === 'production';

// FIX: fail fast. Without JWT_SECRET, jwt.sign() throws on every login (500).
if (!process.env.JWT_SECRET) {
  console.error('❌ JWT_SECRET is not set. Refusing to start.');
  process.exit(1);
}
if (!process.env.MONGO_URI) {
  console.error('❌ MONGO_URI is not set. Refusing to start.');
  process.exit(1);
}

const app    = express();
const server = http.createServer(app);

app.disable('x-powered-by');

// FIX: behind a reverse proxy (Render, Heroku, Railway, Vercel…) req.ip is the
// proxy's address, so express-rate-limit would treat ALL users as one client.
// Trust the first proxy hop in production.
if (isProd) app.set('trust proxy', 1);

// CORS — one exact-match allow-list (config/origins.js); no *.vercel.app wildcard.
// `cors()` already answers preflight (OPTIONS) requests itself, so the old
// hand-written OPTIONS middleware (which echoed ANY origin back with
// Allow-Credentials: true — undoing the allow-list) is removed.
app.use(cors({
  origin: originCheck,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  // X-Socket-Id lets the client tell us which tab made a change, so the live
  // broadcast skips that tab.
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Socket-Id'],
}));

// Parsers must run BEFORE the routes that read req.cookies / req.body.
app.use(cookieParser());
app.use(express.json({ limit: '100kb' }));

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'FlowSpace API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/', (req, res) => {
  res.json({ message: 'FlowSpace API', version: '1.0.0' });
});

app.use('/api/auth',          authRoutes);
app.use('/api/workspaces',    workspaceRoutes);
app.use('/api/tasks',         taskRoutes);
app.use('/api/notifications', notificationRoutes);

const io = initializeSocket(server);
io.use(socketAuthMiddleware);
io.on('connection', (socket) => {
  console.log(`✅ User connected: ${socket.user.name} (${socket.id})`);
  handleWorkspaceSocket(io, socket);
});

// 404 + error handler MUST stay last.
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  console.error('Error:', err.stack || err);
  res.status(status).json({
    success: false,
    // FIX: never leak internal error text for 5xx responses in production.
    message: status >= 500 && isProd ? 'Internal Server Error' : (err.message || 'Internal Server Error'),
  });
});

const PORT = process.env.PORT || 5000;

// FIX: connect to MongoDB FIRST, then listen. Before, the server accepted
// requests while the DB was still connecting (first requests failed / buffered).
async function start() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ MongoDB connected');

  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Allowed origins: ${getAllowedOrigins().join(', ')}`);
  });
}

start().catch((err) => {
  console.error('❌ Startup error:', err);
  process.exit(1);
});

// Graceful shutdown (Render/Docker send SIGTERM on every deploy)
const shutdown = (signal) => {
  console.log(`${signal} received — shutting down`);
  io.close(() => {
    mongoose.connection.close(false).finally(() => process.exit(0));
  });
  setTimeout(() => process.exit(1), 10000).unref();
};
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
