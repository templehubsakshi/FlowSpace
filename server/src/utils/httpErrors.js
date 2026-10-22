// Maps thrown errors to HTTP responses.
//  - Mongoose ValidationError / CastError are the CLIENT's fault -> 400
//    (previously every one of these came back as a 500).
//  - Anything else is a real server error -> generic 500 message, so internal
//    details (stack/driver messages) never leak to the client.
function sendError(res, error, label = 'Request') {
  if (error && (error.name === 'ValidationError' || error.name === 'CastError')) {
    const message =
      error.name === 'ValidationError'
        ? Object.values(error.errors || {}).map((e) => e.message).join(', ') || 'Invalid data'
        : `Invalid ${error.path || 'value'}`;
    return res.status(400).json({ success: false, message });
  }
  console.error(`${label} error:`, error);
  return res.status(500).json({ success: false, message: 'Server error' });
}

module.exports = { sendError };
