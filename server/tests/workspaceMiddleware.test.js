jest.mock('../src/models/Workspace');
jest.mock('../src/models/Task');

const Workspace = require('../src/models/Workspace');
const Task = require('../src/models/Task');
const { loadWorkspace, isMember, isAdmin, isOwner } = require('../src/middelware/workspace');
const { loadTask } = require('../src/middelware/task');

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('loadWorkspace', () => {
  test('404s when workspace does not exist', async () => {
    Workspace.findById.mockResolvedValue(null);
    const req = { params: { workspaceId: 'w1' }, body: {} };
    const res = mockRes();
    const next = jest.fn();

    await loadWorkspace(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(next).not.toHaveBeenCalled();
  });

  test('attaches workspace and calls next when found', async () => {
    const fakeWorkspace = { _id: 'w1', members: [] };
    Workspace.findById.mockResolvedValue(fakeWorkspace);
    const req = { params: { workspaceId: 'w1' }, body: {} };
    const res = mockRes();
    const next = jest.fn();

    await loadWorkspace(req, res, next);

    expect(req.workspace).toBe(fakeWorkspace);
    expect(next).toHaveBeenCalled();
  });

  test('falls back to body.workspaceId when params has none (e.g. createTask)', async () => {
    const fakeWorkspace = { _id: 'w1', members: [] };
    Workspace.findById.mockResolvedValue(fakeWorkspace);
    const req = { params: {}, body: { workspaceId: 'w1' } };
    const res = mockRes();
    const next = jest.fn();

    await loadWorkspace(req, res, next);

    expect(Workspace.findById).toHaveBeenCalledWith('w1');
    expect(next).toHaveBeenCalled();
  });
});

describe('isMember', () => {
  test('403s when caller is not a member', async () => {
    const req = { workspace: { members: [{ user: { toString: () => 'other' } }] }, userId: 'u1' };
    const res = mockRes();
    const next = jest.fn();

    await isMember(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  test('attaches workspaceMember and calls next for a member', async () => {
    const member = { user: { toString: () => 'u1' }, role: 'member' };
    const req = { workspace: { members: [member] }, userId: 'u1' };
    const res = mockRes();
    const next = jest.fn();

    await isMember(req, res, next);

    expect(req.workspaceMember).toBe(member);
    expect(next).toHaveBeenCalled();
  });
});

describe('isAdmin', () => {
  test('403s for a plain member', async () => {
    const req = { workspaceMember: { role: 'member' } };
    const res = mockRes();
    const next = jest.fn();

    await isAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  test('allows admin and owner roles through', async () => {
    for (const role of ['admin', 'owner']) {
      const req = { workspaceMember: { role } };
      const res = mockRes();
      const next = jest.fn();

      await isAdmin(req, res, next);

      expect(next).toHaveBeenCalled();
    }
  });
});

describe('isOwner', () => {
  test('403s when caller is a member/admin but not the actual owner', async () => {
    // Regression test: isOwner used to only check membership, so any admin
    // could perform owner-only actions (e.g. deleting the workspace).
    const req = {
      workspace: { owner: { toString: () => 'owner-id' } },
      userId: 'admin-id',
    };
    const res = mockRes();
    const next = jest.fn();

    await isOwner(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  test('allows the real owner through', async () => {
    const req = {
      workspace: { owner: { toString: () => 'owner-id' } },
      userId: 'owner-id',
    };
    const res = mockRes();
    const next = jest.fn();

    await isOwner(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});

describe('loadTask', () => {
  test('404s when task does not exist', async () => {
    Task.findById.mockResolvedValue(null);
    const req = { params: { taskId: 't1' } };
    const res = mockRes();
    const next = jest.fn();

    await loadTask(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(next).not.toHaveBeenCalled();
  });

  test('attaches task and copies workspace id onto req.params for loadWorkspace to use', async () => {
    const fakeTask = { _id: 't1', workspace: { toString: () => 'w1' } };
    Task.findById.mockResolvedValue(fakeTask);
    const req = { params: { taskId: 't1' } };
    const res = mockRes();
    const next = jest.fn();

    await loadTask(req, res, next);

    expect(req.task).toBe(fakeTask);
    expect(req.params.workspaceId).toBe('w1');
    expect(next).toHaveBeenCalled();
  });
});
