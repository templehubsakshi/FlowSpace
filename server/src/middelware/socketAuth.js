const jwt    = require('jsonwebtoken');
const User   = require('../models/User');
const cookie = require('cookie');

const MAX_TIMEOUT = 2 ** 31 - 1; // setTimeout limit (~24.8 days)

const socketAuthMiddleware = async (socket, next) => {
  try {
    // Token comes from the httpOnly cookie sent automatically with the handshake.
    const rawCookies = socket.handshake.headers.cookie || '';
    const token      = cookie.parse(rawCookies).token;

    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user    = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return next(new Error('Authentication error: User not found'));
    }

    socket.user   = user;
    socket.userId = user._id.toString();

    // socket.data is the officially supported place for per-socket state: it is
    // also visible through fetchSockets()/RemoteSocket (needed with the Redis
    // adapter on multiple servers, where custom properties like socket.user
    // are NOT available on remote sockets).
    socket.data.userId = socket.userId;
    socket.data.name   = user.name;
    socket.data.email  = user.email;

    // FIX: auth used to run only at connect time, so a socket stayed alive
    // forever after its JWT expired. Disconnect when the token expires.
    if (decoded.exp) {
      const ms = decoded.exp * 1000 - Date.now();
      if (ms <= 0) return next(new Error('Authentication error: Token expired'));
      const timer = setTimeout(() => socket.disconnect(true), Math.min(ms, MAX_TIMEOUT));
      timer.unref?.();
      socket.once('disconnect', () => clearTimeout(timer));
    }

    next();
  } catch (error) {
    console.error('Socket auth error:', error.message);
    next(new Error('Authentication error'));
  }
};

module.exports = socketAuthMiddleware;
