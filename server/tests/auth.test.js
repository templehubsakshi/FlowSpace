jest.mock('../src/models/User');
const jwt = require('jsonwebtoken');
process.env.JWT_SECRET = 'test-secret';
const User = require('../src/models/User');
const { protect } = require('../src/middelware/auth');
const { login, signup } = require('../src/controllers/authController');

const mkRes = () => { const r = {}; r.status = jest.fn().mockReturnValue(r); r.json = jest.fn().mockReturnValue(r); r.clearCookie = jest.fn(); r.cookie = jest.fn(); return r; };
const ID = '0'.repeat(23) + '1';
beforeEach(() => jest.clearAllMocks());

describe('protect', () => {
  const tokenFor = (id) => jwt.sign({ userId: id }, 'test-secret');

  test('valid token + existing user → next()', async () => {
    User.exists.mockResolvedValue({ _id: ID });
    const req = { cookies: { token: tokenFor(ID) } }; const next = jest.fn();
    await protect(req, mkRes(), next);
    expect(next).toHaveBeenCalled(); expect(req.userId).toBe(ID);
  });

  test('valid token for a DELETED user → 401 and cookie cleared', async () => {
    User.exists.mockResolvedValue(null);
    const res = mkRes(); const next = jest.fn();
    await protect({ cookies: { token: tokenFor(ID) } }, res, next);
    expect(res.status).toHaveBeenCalledWith(401); expect(res.clearCookie).toHaveBeenCalledWith('token', expect.any(Object));
    expect(next).not.toHaveBeenCalled();
  });

  test('no cookie / bad token → 401', async () => {
    let res = mkRes(); await protect({ cookies: {} }, res, jest.fn()); expect(res.status).toHaveBeenCalledWith(401);
    res = mkRes(); await protect({ cookies: { token: 'junk' } }, res, jest.fn()); expect(res.status).toHaveBeenCalledWith(401);
    res = mkRes(); await protect({}, res, jest.fn()); expect(res.status).toHaveBeenCalledWith(401); // req.cookies undefined
  });
});

describe('auth validation', () => {
  test('login rejects NoSQL operator objects and non-string passwords without touching the DB', async () => {
    for (const body of [{ email: { $ne: null }, password: 'x' }, { email: 'a@b.com', password: { $gt: '' } }, {}]) {
      const res = mkRes(); await login({ body }, res);
      expect(res.status).toHaveBeenCalledWith(400);
    }
    expect(User.findOne).not.toHaveBeenCalled();
  });

  test('signup rejects short password, bad email, non-string name', async () => {
    for (const body of [
      { name: 'A', email: 'a@b.com', password: '123' },
      { name: 'A', email: 'nope', password: '123456' },
      { name: { x: 1 }, email: 'a@b.com', password: '123456' },
    ]) {
      const res = mkRes(); await signup({ body }, res);
      expect(res.status).toHaveBeenCalledWith(400);
    }
    expect(User.findOne).not.toHaveBeenCalled();
  });

  test('signup duplicate-key race returns 409, not 500', async () => {
    User.findOne.mockResolvedValue(null);
    User.create.mockRejectedValue(Object.assign(new Error('dup'), { code: 11000 }));
    const res = mkRes(); await signup({ body: { name: 'A', email: 'a@b.com', password: '123456' } }, res);
    expect(res.status).toHaveBeenCalledWith(409);
  });
});
