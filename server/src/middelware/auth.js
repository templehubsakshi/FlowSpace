const jwt = require('jsonwebtoken');

exports.protect = (req, res, next) => {
  try {
    // Get token from cookie (NOT from header anymore)
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ 
        message: 'Not authorized, please login' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Session expired, please login again' });
    }
    
    res.status(401).json({ message: 'Not authorized' });
  }
};