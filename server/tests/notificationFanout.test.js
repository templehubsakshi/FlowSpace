jest.mock('../src/models/Notification');
jest.mock('../src/config/socket');
jest.mock('../src/sockets/workspaceSocket');

const Notification = require('../src/models/Notification');
const { getIO } = require('../src/config/socket');
const { getOnlineUsers } = require('../src/sockets/workspaceSocket');
const { createNotification } = require('../src/controllers/notificationController');

describe('createNotification socket fan-out', () => {
  test('emits to every socket id the recipient has open (multi-tab/multi-device)', async () => {
    const fakeNotification = {
      _id: 'n1',
      type: 'TASK_ASSIGNED',
      createdAt: new Date(),
      task: null,
      sender: { _id: 'sender-1', name: 'Alice' },
      toObject() { return this; },
      populate: jest.fn().mockResolvedValue(undefined),
    };
    Notification.create.mockResolvedValue(fakeNotification);

    const emit = jest.fn();
    const to = jest.fn().mockReturnValue({ emit });
    getIO.mockReturnValue({ to });

    // Recipient has two open sockets: one from a laptop tab, one from a phone.
    const onlineUsers = new Map([
      ['recipient-1', new Set(['socket-laptop', 'socket-phone'])],
    ]);
    getOnlineUsers.mockReturnValue(onlineUsers);

    await createNotification({
      recipient: 'recipient-1',
      sender: 'sender-1',
      workspace: 'w1',
      task: null,
      type: 'TASK_ASSIGNED',
    });

    // Old behavior (Map<userId, single socketId>) could only ever reach one
    // of these — whichever connected most recently.
    expect(to).toHaveBeenCalledWith(['socket-laptop', 'socket-phone']);
    expect(emit).toHaveBeenCalledWith('notification:new', expect.objectContaining({ _id: 'n1' }));
  });

  test('does not emit when the recipient has no open sockets', async () => {
    const fakeNotification = {
      _id: 'n2',
      type: 'TASK_ASSIGNED',
      createdAt: new Date(),
      task: null,
      sender: { _id: 'sender-1', name: 'Alice' },
      toObject() { return this; },
      populate: jest.fn().mockResolvedValue(undefined),
    };
    Notification.create.mockResolvedValue(fakeNotification);

    const emit = jest.fn();
    const to = jest.fn().mockReturnValue({ emit });
    getIO.mockReturnValue({ to });
    getOnlineUsers.mockReturnValue(new Map());

    await createNotification({
      recipient: 'recipient-1',
      sender: 'sender-1',
      workspace: 'w1',
      task: null,
      type: 'TASK_ASSIGNED',
    });

    expect(to).not.toHaveBeenCalled();
  });
});
