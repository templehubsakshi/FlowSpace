const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { EMAIL_RE, normalizeEmail } = require('../utils/validators');
const { sendError } = require('../utils/httpErrors');

// Generate JWT
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Cookie options
const getCookieOptions = () => ({
  httpOnly: true,                                                          // JS cannot read this
  secure: process.env.NODE_ENV === 'production',                          // HTTPS only in prod
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',      // Cross-domain in prod
  maxAge: 7 * 24 * 60 * 60 * 1000,                                       // 7 days
  path: '/'
});

// Compared against when the email doesn't exist, so "unknown email" takes as
// long as "wrong password" (stops user enumeration through response timing).
const DUMMY_HASH = bcrypt.hashSync('flowspace-dummy-password', 10);

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  // Falls back to the ObjectId timestamp for old accounts created before the
  // `cratedAt` typo was fixed in the model.
  createdAt: user.createdAt || user._id.getTimestamp(),
});

// Signup
exports.signup = async (req, res) => {
  try {
    const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
    const email = normalizeEmail(req.body?.email);
    const password = req.body?.password;

    // FIX: no validation at all before — non-string values (objects, arrays)
    // reached the DB layer, and 1-character passwords were accepted.
    if (!name || !email || typeof password !== 'string' || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    if (name.length > 50) return res.status(400).json({ message: 'Name must be at most 50 characters' });
    if (!EMAIL_RE.test(email)) return res.status(400).json({ message: 'Please enter a valid email' });
    if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });
    // bcrypt only uses the first 72 bytes
    if (Buffer.byteLength(password) > 72) return res.status(400).json({ message: 'Password is too long (max 72 bytes)' });

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);

    // Token goes ONLY in the httpOnly cookie — never in the response body
    res.cookie('token', token, getCookieOptions());

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user: publicUser(user),
    });
  } catch (error) {
    // FIX: two simultaneous signups with the same email both passed the
    // findOne() check; the unique index rejects the second one — that is a
    // duplicate (409), not a server error.
    if (error && error.code === 11000) {
      return res.status(409).json({ message: 'Email already registered' });
    }
    sendError(res, error, 'Signup');
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const password = req.body?.password;

    // FIX: `{ "email": { "$ne": null } }` used to reach User.findOne() as an
    // operator object (NoSQL injection), and a non-string password made
    // bcrypt.compare throw a 500.
    if (!email || typeof password !== 'string' || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    const user = await User.findOne({ email }).select('+password');
    const isMatch = await bcrypt.compare(password, user ? user.password : DUMMY_HASH);

    if (!user || !isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);
    res.cookie('token', token, getCookieOptions());

    res.json({
      success: true,
      message: 'Login successful',
      user: publicUser(user),
    });
  } catch (error) {
    sendError(res, error, 'Login');
  }
};

// Logout
exports.logout = (req, res) => {
  try {
    res.cookie('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      expires: new Date(0),
      path: '/'
    });

    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    sendError(res, error, 'Logout');
  }
};

// Get current user
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ success: true, user: publicUser(user) });
  } catch (error) {
    sendError(res, error, 'GetMe');
  }
};
