const express = require('express');
const request = require('supertest');
const { authLimiter } = require('../src/middelware/rateLimiter');

describe('authLimiter', () => {
  test('allows requests under the limit and blocks once exceeded', async () => {
    const app = express();
    app.post('/login', authLimiter, (req, res) => res.json({ ok: true }));

    let lastStatus;
    for (let i = 0; i < 11; i++) {
      const res = await request(app).post('/login');
      lastStatus = res.status;
      if (i < 10) expect(res.status).toBe(200);
    }
    // The 11th request within the window should be rate-limited.
    expect(lastStatus).toBe(429);
  });
});
