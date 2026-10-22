const express = require('express');
const request = require('supertest');

// Fresh limiter (fresh in-memory counters) for every test.
const freshLimiter = () => {
  let limiter;
  jest.isolateModules(() => { limiter = require('../src/middelware/rateLimiter').authLimiter; });
  return limiter;
};

describe('authLimiter', () => {
  test('blocks after 10 FAILED attempts', async () => {
    const app = express();
    app.post('/login', freshLimiter(), (req, res) => res.status(401).json({ ok: false }));

    let lastStatus;
    for (let i = 0; i < 11; i++) {
      const res = await request(app).post('/login');
      lastStatus = res.status;
      if (i < 10) expect(res.status).toBe(401);
    }
    expect(lastStatus).toBe(429);
  });

  test('successful logins do not count towards the limit', async () => {
    const app = express();
    app.post('/login', freshLimiter(), (req, res) => res.json({ ok: true }));

    for (let i = 0; i < 15; i++) {
      const res = await request(app).post('/login');
      expect(res.status).toBe(200);
    }
  });
});
