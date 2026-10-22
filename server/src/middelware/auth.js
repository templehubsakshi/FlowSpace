const jwt = require('jsonwebtoken');
const User = require('../models/User');

const clearedCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  path: '/',
});

exports.protect = async (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, please login' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // FIX: a valid JWT for a since-deleted account used to keep working on every
    // HTTP route for up to 7 days (only the socket layer checked the DB).
    // One cheap indexed query (_id only) closes that.
    const exists = await User.exists({ _id: decoded.userId });
    if (!exists) {
      res.clearCookie('token', clearedCookieOptions());
      return res.status(401).json({ message: 'Account no longer exists' });
    }

    req.userId = decoded.userId;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Session expired, please login again' });
    }
    if (error.name === 'JsonWebTokenError' || error.name === 'NotBeforeError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    // CastError (malformed userId inside a validly-signed token) or DB failure
    console.error('Auth middleware error:', error);
    res.status(error.name === 'CastError' ? 401 : 500).json({
      message: error.name === 'CastError' ? 'Not authorized' : 'Server error',
    });
  }
};
