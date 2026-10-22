jest.mock('../src/models/Task');
jest.mock('../src/models/Notification');
jest.mock('../src/controllers/notificationController');
jest.mock('../src/utils/realtime', () => ({
  emitToWorkspace: jest.fn(),
  socketIdFromReq: (req) => req.get('x-socket-id'),
}));
jest.mock('../src/utils/withTransaction', () => ({
  runInOptionalTransaction: (fn) => fn(null),
  sessionOpts: () => ({}),
}));

const Task = require('../src/models/Task');
const Notification = require('../src/models/Notification');
const { createNotification } = require('../src/controllers/notificationController');
const { emitToWorkspace } = require('../src/utils/realtime');
const ctrl = require('../src/controllers/taskController');

const ID = (n) => String(n).padStart(24, '0');
const ME = ID(1), MEMBER = ID(2), OUTSIDER = ID(9), WS = ID(100);

const workspace = { _id: WS, members: [{ user: ME, role: 'member' }, { user: MEMBER, role: 'member' }] };
const mkRes = () => { const r = {}; r.status = jest.fn().mockReturnValue(r); r.json = jest.fn().mockReturnValue(r); return r; };
const mkReq = (extra = {}) => ({ userId: ME, workspace, body: {}, get: () => 'sock-1', ...extra });

beforeEach(() => jest.clearAllMocks());

describe('addComment', () => {
  const mkTask = () => {
    const comment = { _id: ID(50), user: { name: 'Me' }, text: 'hi' };
    const t = { _id: ID(7), workspace: WS, comments: { push: jest.fn(), at: () => comment } };
    t.save = jest.fn().mockResolvedValue();
    t.populate = jest.fn().mockResolvedValue();
    return t;
  };

  test('only real workspace members can be mentioned (no cross-workspace notification leak)', async () => {
    const task = mkTask();
    const res = mkRes();
    await ctrl.addComment(mkReq({ task, body: { text: 'hey', mentions: [MEMBER, OUTSIDER, 'junk', MEMBER] } }), res);

    expect(task.comments.push).toHaveBeenCalledWith(expect.objectContaining({ mentions: [MEMBER] }));
    expect(createNotification).toHaveBeenCalledTimes(1);
    expect(createNotification).toHaveBeenCalledWith(expect.objectContaining({ recipient: MEMBER, type: 'TASK_MENTIONED' }));
  });

  test('server broadcasts comment:added, skipping the sender tab', async () => {
    const task = mkTask();
    await ctrl.addComment(mkReq({ task, body: { text: 'hello' } }), mkRes());
    expect(emitToWorkspace).toHaveBeenCalledWith(WS, 'comment:added', expect.objectContaining({ taskId: ID(7) }), 'sock-1');
  });

  test('rejects empty / non-string / too long text with 400', async () => {
    for (const text of ['', '   ', 123, 'x'.repeat(1001)]) {
      const res = mkRes();
      await ctrl.addComment(mkReq({ task: mkTask(), body: { text } }), res);
      expect(res.status).toHaveBeenCalledWith(400);
    }
  });
});

describe('createTask', () => {
  test('rejects an assignee who is not in the workspace', async () => {
    const res = mkRes();
    await ctrl.createTask(mkReq({ body: { title: 'T', assignee: OUTSIDER } }), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(Task.create).not.toHaveBeenCalled();
  });

  test('rejects an invalid status with 400 instead of a mongoose 500', async () => {
    const res = mkRes();
    await ctrl.createTask(mkReq({ body: { title: 'T', status: 'nope' } }), res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('notifies the assignee and broadcasts task:created', async () => {
    Task.find.mockReturnValue({ sort: () => ({ limit: () => Promise.resolve([]) }) });
    const created = { _id: ID(8), workspace: WS, populate: jest.fn().mockResolvedValue(), toObject() { return { _id: ID(8) }; } };
    Task.create.mockResolvedValue(created);

    const res = mkRes();
    await ctrl.createTask(mkReq({ body: { title: 'T', assignee: MEMBER } }), res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(createNotification).toHaveBeenCalledWith(expect.objectContaining({ recipient: MEMBER, type: 'TASK_ASSIGNED' }));
    expect(emitToWorkspace).toHaveBeenCalledWith(WS, 'task:created', expect.any(Object), 'sock-1');
  });
});

describe('deleteTask', () => {
  test('server broadcasts task:deleted itself (old flow relied on a client emit that never worked)', async () => {
    Task.findByIdAndDelete.mockResolvedValue();
    Task.updateMany.mockResolvedValue();
    Notification.deleteMany.mockResolvedValue();
    const task = { _id: ID(7), workspace: WS, status: 'todo', order: 2, creator: ME };

    const res = mkRes();
    await ctrl.deleteTask(mkReq({ task, workspaceMember: { role: 'member' } }), res);

    expect(emitToWorkspace).toHaveBeenCalledWith(WS, 'task:deleted', { taskId: ID(7) }, 'sock-1');
    // closes the order gap and removes dangling notifications
    expect(Task.updateMany).toHaveBeenCalledWith(
      { workspace: WS, status: 'todo', order: { $gt: 2 } }, { $inc: { order: -1 } });
    expect(Notification.deleteMany).toHaveBeenCalledWith({ task: ID(7) });
  });

  test('non-creator, non-admin gets 403 and nothing is deleted', async () => {
    const task = { _id: ID(7), workspace: WS, status: 'todo', order: 0, creator: MEMBER };
    const res = mkRes();
    await ctrl.deleteTask(mkReq({ task, workspaceMember: { role: 'member' } }), res);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(Task.findByIdAndDelete).not.toHaveBeenCalled();
  });
});

describe('moveTask', () => {
  test('clamps newOrder to the column length and broadcasts full payload with oldStatus', async () => {
    Task.countDocuments.mockResolvedValue(2);
    Task.bulkWrite.mockResolvedValue();
    const task = {
      _id: ID(7), workspace: WS, status: 'todo', order: 0,
      save: jest.fn().mockResolvedValue(), populate: jest.fn().mockResolvedValue(),
      toObject() { return { _id: ID(7) }; },
    };
    const res = mkRes();
    await ctrl.moveTask(mkReq({ task, body: { newStatus: 'done', newOrder: 9999 } }), res);

    expect(task.order).toBe(2);
    expect(emitToWorkspace).toHaveBeenCalledWith(
      WS, 'task:moved',
      expect.objectContaining({ newStatus: 'done', oldStatus: 'todo', newOrder: 2 }),
      'sock-1');
  });

  test('rejects non-integer order', async () => {
    const res = mkRes();
    await ctrl.moveTask(mkReq({ task: { status: 'todo' }, body: { newStatus: 'done', newOrder: 1.5 } }), res);
    expect(res.status).toHaveBeenCalledWith(400);
  });
});

describe('updateTask', () => {
  test('changing status via PUT reorders columns (no gap / duplicate order) and broadcasts', async () => {
    Task.countDocuments.mockResolvedValue(3);
    Task.bulkWrite.mockResolvedValue();
    const task = {
      _id: ID(7), workspace: WS, status: 'todo', order: 1, assignee: null,
      save: jest.fn().mockResolvedValue(), populate: jest.fn().mockResolvedValue(),
      toObject() { return { _id: ID(7) }; },
    };
    const res = mkRes();
    await ctrl.updateTask(mkReq({ task, body: { status: 'done' } }), res);

    expect(Task.bulkWrite).toHaveBeenCalled();   // source-column gap closed
    expect(task.status).toBe('done');
    expect(task.order).toBe(3);                   // appended to end of destination
    expect(emitToWorkspace).toHaveBeenCalledWith(WS, 'task:updated', expect.any(Object), 'sock-1');
  });

  test('assignee changes notify new + old assignee', async () => {
    const task = {
      _id: ID(7), workspace: WS, status: 'todo', order: 0, assignee: MEMBER,
      save: jest.fn().mockResolvedValue(),
      populate: jest.fn().mockImplementation(async function () { return this; }),
      toObject() { return { _id: ID(7) }; },
    };
    const res = mkRes();
    await ctrl.updateTask(mkReq({ task, body: { assignee: ME } }), res);
    const types = createNotification.mock.calls.map(([a]) => `${a.type}:${a.recipient}`);
    expect(types).toEqual(expect.arrayContaining([`TASK_ASSIGNED:${ME}`, `TASK_UNASSIGNED:${MEMBER}`]));
  });
});

describe('due dates', () => {
  test('plain YYYY-MM-DD is stored at 12:00 UTC so the same day shows in every timezone', async () => {
    Task.find.mockReturnValue({ sort: () => ({ limit: () => Promise.resolve([]) }) });
    const created = { _id: ID(8), workspace: WS, populate: jest.fn().mockResolvedValue(), toObject() { return {}; } };
    Task.create.mockResolvedValue(created);
    await ctrl.createTask(mkReq({ body: { title: 'T', dueDate: '2026-10-22' } }), mkRes());
    expect(Task.create.mock.calls[0][0].dueDate.toISOString()).toBe('2026-10-22T12:00:00.000Z');
  });

  test('garbage due date → 400', async () => {
    const res = mkRes();
    await ctrl.createTask(mkReq({ body: { title: 'T', dueDate: 'not-a-date' } }), res);
    expect(res.status).toHaveBeenCalledWith(400);
  });
});
