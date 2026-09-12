const express = require('express');
const { signup, login, logout, getMe } = require('../controllers/authController');
const { protect } = require('../middelware/auth');
const { authLimiter } = require('../middelware/rateLimiter');

const router = express.Router();

// Public routes — rate limited to block brute-force attempts
router.post('/signup', authLimiter, signup);
router.post('/login', authLimiter, login);
router.post('/logout', logout);

// Protected route
router.get('/me', protect, getMe);

module.exports = router;
