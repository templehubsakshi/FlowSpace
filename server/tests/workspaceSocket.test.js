// Integration tests: real Socket.IO server + real socket.io-client, models mocked.
jest.mock('../src/models/User');
jest.mock('../src/models/Workspace');

const http = require('http');
const jwt = require('jsonwebtoken');
const { io: ioc } = require('socket.io-client');

process.env.JWT_SECRET = 'test-secret';

const User = require('../src/models/User');
const Workspace = require('../src/models/Workspace');
const { initializeSocket } = require('../src/config/socket');
const socketAuth = require('../src/middelware/socketAuth');
const handleWorkspaceSocket = require('../src/sockets/workspaceSocket');
const realtime = require('../src/utils/realtime');

const ID = (n) => String(n).padStart(24, '0');
const W1 = ID(100), W2 = ID(200);
const TASK = ID(7);

let server, io, port;
const clients = [];

beforeAll((done) => {
  server = http.createServer();
  io = initializeSocket(server);
  io.use(socketAuth);
  io.on('connection', (s) => handleWorkspaceSocket(io, s));
  server.listen(0, () => { port = server.address().port; done(); });
});

afterAll((done) => { io.close(); server.close(done); });

afterEach(() => { clients.splice(0).forEach((c) => c.close()); });

// workspaces: { [workspaceId]: [memberUserIds] }
const setWorkspaces = (map) => {
  Workspace.findById.mockImplementation((id) => ({
    select: () => Promise.resolve(map[id] ? { members: map[id].map((u) => ({ user: u, role: 'member' })) } : null),
  }));
};

const connect = (uid, { token } = {}) => new Promise((resolve, reject) => {
  User.findById.mockImplementation((id) => ({
    select: () => Promise.resolve({ _id: id, name: `name-${id.slice(-2)}`, email: `${id.slice(-2)}@x.com` }),
  }));
  const t = token !== undefined ? token : jwt.sign({ userId: uid }, 'test-secret');
  const c = ioc(`http://localhost:${port}`, {
    extraHeaders: { cookie: `token=${t}` }, transports: ['websocket'], forceNew: true,
  });
  clients.push(c);
  c.on('connect', () => resolve(c));
  c.on('connect_error', reject);
});

const once = (c, ev, ms = 800) => new Promise((resolve) => {
  const t = setTimeout(() => resolve(null), ms);
  c.once(ev, (d) => { clearTimeout(t); resolve(d); });
});
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const join = async (c, ws) => { c.emit('workspace:join', ws); await wait(150); };

describe('auth', () => {
  test('rejects a connection without a token', async () => {
    await expect(connect('x', { token: '' })).rejects.toBeDefined();
  });
});

describe('server-authoritative events', () => {
  test('forged task:create / comment:add events from clients are ignored', async () => {
    setWorkspaces({ [W1]: [ID(1)] });
    const victim = await connect(ID(1));
    await join(victim, W1);
    const attacker = await connect(ID(2)); // not a member, never joined

    const seen = once(victim, 'task:created', 500);
    const seenComment = once(victim, 'comment:added', 500);
    attacker.emit('task:create', { workspaceId: W1, task: { _id: 'fake', title: 'HACKED' } });
    attacker.emit('comment:add', { workspaceId: W1, taskId: TASK, comment: { text: 'fake' } });
    expect(await seen).toBeNull();
    expect(await seenComment).toBeNull();
  });

  test('client task:update / move / delete no longer exist (no cross-workspace IDOR)', async () => {
    setWorkspaces({ [W1]: [ID(1)] });
    const a = await connect(ID(1));
    await join(a, W1);
    const spy = jest.fn();
    a.on('task:updated', spy); a.on('task:moved', spy); a.on('task:deleted', spy);
    a.emit('task:update', { workspaceId: W1, taskId: TASK, updates: { title: 'x' } });
    a.emit('task:move', { workspaceId: W1, taskId: TASK, newStatus: 'done' });
    a.emit('task:delete', { workspaceId: W1, taskId: TASK });
    await wait(300);
    expect(spy).not.toHaveBeenCalled();
  });

  test('typing indicator cannot be sent into a room the socket has not joined', async () => {
    setWorkspaces({ [W1]: [ID(1)], [W2]: [ID(2)] });
    const victim = await connect(ID(2));
    await join(victim, W2);
    const attacker = await connect(ID(1));
    await join(attacker, W1);

    const got = once(victim, 'comment:typing', 400);
    attacker.emit('comment:typing', { workspaceId: W2, taskId: TASK }); // payload workspace ignored
    expect(await got).toBeNull();
  });
});

describe('REST → live broadcast helpers', () => {
  test('emitToWorkspace reaches the room but skips the sender socket', async () => {
    setWorkspaces({ [W1]: [ID(1), ID(2)] });
    const a = await connect(ID(1)); const b = await connect(ID(2));
    await join(a, W1); await join(b, W1);

    const aGot = once(a, 'task:deleted', 400);
    const bGot = once(b, 'task:deleted', 400);
    realtime.emitToWorkspace(W1, 'task:deleted', { taskId: TASK }, a.id);
    expect(await bGot).toEqual({ taskId: TASK });
    expect(await aGot).toBeNull();
  });

  test('emitToUser reaches every tab of the user (user room survives workspace:join)', async () => {
    setWorkspaces({ [W1]: [ID(1)], [W2]: [ID(1)] });
    const tab1 = await connect(ID(1)); const tab2 = await connect(ID(1));
    await join(tab1, W1);
    await join(tab1, W2); // switching workspace must NOT drop the user:<id> room

    const g1 = once(tab1, 'notification:new'); const g2 = once(tab2, 'notification:new');
    realtime.emitToUser(ID(1), 'notification:new', { _id: 'n' });
    expect(await g1).toEqual({ _id: 'n' });
    expect(await g2).toEqual({ _id: 'n' });
  });

  test('evictUserFromWorkspace stops live events for a removed member', async () => {
    setWorkspaces({ [W1]: [ID(1), ID(2)] });
    const removed = await connect(ID(2)); const other = await connect(ID(1));
    await join(removed, W1); await join(other, W1);

    const evt = once(removed, 'workspace:removed');
    realtime.evictUserFromWorkspace(ID(2), W1);
    expect(await evt).toEqual({ workspaceId: W1 });
    await wait(100);

    const leaked = once(removed, 'task:created', 400);
    realtime.emitToWorkspace(W1, 'task:created', { task: { _id: 't' } });
    expect(await leaked).toBeNull();
  });
});

describe('presence', () => {
  test('non-member cannot join the room', async () => {
    setWorkspaces({ [W1]: [ID(1)] });
    const outsider = await connect(ID(2));
    const err = once(outsider, 'error');
    outsider.emit('workspace:join', W1);
    expect(await err).toEqual({ message: 'Not authorized to join this workspace' });
  });

  test('malformed workspace id is rejected without a DB query', async () => {
    setWorkspaces({});
    Workspace.findById.mockClear();
    const a = await connect(ID(1));
    const err = once(a, 'error');
    a.emit('workspace:join', { $ne: null });
    expect(await err).toBeTruthy();
    expect(Workspace.findById).not.toHaveBeenCalled();
  });

  test('online-users list is de-duplicated (two tabs of one user = one entry)', async () => {
    setWorkspaces({ [W1]: [ID(1), ID(2)] });
    const t1 = await connect(ID(1)); const t2 = await connect(ID(1)); const other = await connect(ID(2));
    await join(t1, W1); await join(t2, W1);
    const list = once(other, 'workspace:online-users');
    other.emit('workspace:join', W1);
    const users = await list;
    expect(users.map((u) => u.userId).sort()).toEqual([ID(1), ID(2)]);
  });

  test('closing a tab broadcasts user:left (was never sent: rooms are empty on "disconnect")', async () => {
    setWorkspaces({ [W1]: [ID(1), ID(2)] });
    const a = await connect(ID(1)); const b = await connect(ID(2));
    await join(a, W1); await join(b, W1);
    const left = once(a, 'user:left', 1500);
    b.close();
    expect(await left).toEqual(expect.objectContaining({ userId: ID(2) }));
  });

  test('closing ONE of two tabs does not announce user:left', async () => {
    setWorkspaces({ [W1]: [ID(1), ID(2)] });
    const a = await connect(ID(1)); const b1 = await connect(ID(2)); const b2 = await connect(ID(2));
    await join(a, W1); await join(b1, W1); await join(b2, W1);
    const left = once(a, 'user:left', 700);
    b1.close();
    expect(await left).toBeNull();
  });
});
