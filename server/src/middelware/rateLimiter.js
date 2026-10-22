const rateLimit = require('express-rate-limit');

// Limits repeated login/signup attempts per IP.
// FIX: skipSuccessfulRequests — only FAILED attempts count. Before, 10
// legitimate logins from one office/NAT IP in 15 minutes locked everybody out.
// (server.js also sets `trust proxy` in production, otherwise behind
// Render/Heroku/Vercel every user shares the proxy's IP and one bad actor
// would rate-limit the whole site.)
exports.authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,                  // 10 failed attempts per IP per window
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts. Please try again in a few minutes.' },
});
