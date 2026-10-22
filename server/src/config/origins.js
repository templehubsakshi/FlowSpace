// Single source of truth for allowed browser origins (used by Express CORS
// AND Socket.IO CORS — they used to be two copy-pasted lists).
//
// FIX: the old code also allowed ANY "*.vercel.app" origin. Anyone can deploy a
// site on vercel.app, so any attacker site there could call this API with the
// victim's cookie (credentials: true). Now only an exact allow-list is accepted.
// Add extra origins (e.g. preview deployments) via the CLIENT_URLS env var:
//   CLIENT_URLS=https://my-preview.vercel.app,https://app.example.com

const DEFAULT_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'https://flow-space-black.vercel.app',
];

const getAllowedOrigins = () => {
  const fromEnv = (process.env.CLIENT_URLS || '')
    .split(',')
    .map((s) => s.trim().replace(/\/+$/, ''))
    .filter(Boolean);
  return [...new Set([...DEFAULT_ORIGINS, ...fromEnv])];
};

// cors()/socket.io origin callback. Requests with no Origin header
// (Postman, server-to-server) are let through — they are not a browser CSRF
// vector and still need a valid auth cookie/JWT.
// Unknown origins get `false` (no CORS headers) instead of an Error, so they
// don't produce a 500 + stack trace in the error handler.
const originCheck = (origin, callback) => {
  if (!origin) return callback(null, true);
  if (getAllowedOrigins().includes(origin)) return callback(null, true);
  console.warn(`Blocked origin: ${origin}`);
  return callback(null, false);
};

module.exports = { getAllowedOrigins, originCheck };
