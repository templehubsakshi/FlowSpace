// Regression tests for the notification router (route order + Express 5 req.body).
jest.mock('../src/middelware/auth', () => ({
  protect: (req, res, next) => { req.userId = 'u1'; next(); },
}));
jest.mock('../src/models/Notification');

const express = require('express');
const request = require('supertest');
const Notification = require('../src/models/Notification');
const routes = require('../src/routes/notificationRoutes');

const app = express();
app.use(express.json());
app.use('/api/notifications', routes);

describe('notification routes', () => {
  beforeEach(() => jest.clearAllMocks());

  test('PATCH /mark-all-read reaches markAllAsRead (was shadowed by /:id → 500)', async () => {
    Notification.updateMany.mockResolvedValue({});
    const res = await request(app).patch('/api/notifications/mark-all-read');
    expect(res.status).toBe(200);
    expect(Notification.updateMany).toHaveBeenCalledWith(
      { recipient: 'u1', isRead: false }, { isRead: true }
    );
  });

  test('DELETE / without a body works (Express 5 leaves req.body undefined)', async () => {
    Notification.deleteMany.mockResolvedValue({});
    const res = await request(app).delete('/api/notifications');
    expect(res.status).toBe(200);
    expect(Notification.deleteMany).toHaveBeenCalledWith({ recipient: 'u1' });
  });

  test('PATCH /:id with a malformed id is a 404, not a 500', async () => {
    const res = await request(app).patch('/api/notifications/not-an-id');
    expect(res.status).toBe(404);
  });

  test('invalid workspace filter is rejected with 400', async () => {
    const res = await request(app).get('/api/notifications?workspace=abc');
    expect(res.status).toBe(400);
  });

  test('limit is capped at 100', async () => {
    const chain = { populate: jest.fn().mockReturnThis(), sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(), limit: jest.fn().mockResolvedValue([]) };
    Notification.find.mockReturnValue(chain);
    await request(app).get('/api/notifications?limit=99999999');
    expect(chain.limit).toHaveBeenCalledWith(100);
  });
});
