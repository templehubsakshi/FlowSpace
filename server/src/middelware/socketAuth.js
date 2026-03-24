const jwt    = require('jsonwebtoken');
const User   = require('../models/User');
const cookie = require('cookie'); // ✅ Node built-in cookie parser

const socketAuthMiddleware = async (socket, next) => {
  try {
    // ✅ Read token from httpOnly cookie (sent automatically by browser)
    // socket.handshake.headers.cookie contains raw cookie string e.g. "token=xxx; othercookie=yyy"
    const rawCookies = socket.handshake.headers.cookie || '';
    const cookies    = cookie.parse(rawCookies);
    const token      = cookies.token;

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
    next();

  } catch (error) {
    console.error('Socket auth error:', error.message);
    next(new Error('Authentication error'));
  }
};

module.exports = socketAuthMiddleware;