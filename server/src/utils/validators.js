// NOTE: mongoose.isValidObjectId('abcdefghijkl') is true for ANY 12-char
// string, so we use a strict 24-hex check instead.
const OBJECT_ID_RE = /^[a-f\d]{24}$/i;

const isObjectId = (v) => typeof v === 'string' && OBJECT_ID_RE.test(v);

// Unique, valid ids only; anything else is dropped. Capped to avoid abuse.
const uniqueObjectIds = (arr, max = 20) => {
  if (!Array.isArray(arr)) return [];
  return [...new Set(arr.filter(isObjectId).map((s) => s.toLowerCase()))].slice(0, max);
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const normalizeEmail = (v) => (typeof v === 'string' ? v.trim().toLowerCase() : '');

module.exports = { isObjectId, uniqueObjectIds, EMAIL_RE, normalizeEmail };
