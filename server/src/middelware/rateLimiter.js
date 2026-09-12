const rateLimit = require('express-rate-limit');

// express-rate-limit was already a dependency but was never wired up, so
// login/signup had no brute-force protection at all. This limits repeated
// attempts per IP without affecting normal usage.
exports.authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,                  // 10 attempts per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts. Please try again in a few minutes.' },
});
