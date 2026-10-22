const mongoose = require('mongoose');

// Runs `work(session)` in a transaction. On a standalone mongod (no replica
// set) transactions are impossible; instead of failing every drag-and-drop in
// local dev we run the same work once WITHOUT a session (session === null).
const NO_TXN_RE = /Transaction numbers|replica set|not supported by this deployment/i;

async function runInOptionalTransaction(work) {
  const session = await mongoose.startSession();
  try {
    let result;
    try {
      await session.withTransaction(async () => {
        result = await work(session);
      });
      return result;
    } catch (error) {
      if (error && NO_TXN_RE.test(error.message || '')) {
        console.warn('Transactions unavailable (standalone MongoDB) — running without one.');
        return await work(null);
      }
      throw error;
    }
  } finally {
    session.endSession();
  }
}

const sessionOpts = (session) => (session ? { session } : {});

module.exports = { runInOptionalTransaction, sessionOpts };
