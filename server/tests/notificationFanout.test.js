jest.mock('../src/models/Notification');
jest.mock('../src/utils/realtime');

const Notification = require('../src/models/Notification');
const { emitToUser } = require('../src/utils/realtime');
const { createNotification } = require('../src/controllers/notificationController');

const fakeNotification = (id) => ({
  _id: id,
  type: 'TASK_ASSIGNED',
  createdAt: new Date(),
  task: null,
  sender: { _id: 'sender-1', name: 'Alice' },
  toObject() { return this; },
  populate: jest.fn().mockResolvedValue(undefined),
});

describe('createNotification fan-out', () => {
  beforeEach(() => jest.clearAllMocks());

  test('emits to the recipient\'s user room (reaches every tab/device)', async () => {
    Notification.create.mockResolvedValue(fakeNotification('n1'));

    await createNotification({
      recipient: 'recipient-1', sender: 'sender-1', workspace: 'w1', task: null, type: 'TASK_ASSIGNED',
    });

    expect(emitToUser).toHaveBeenCalledWith(
      'recipient-1', 'notification:new', expect.objectContaining({ _id: 'n1' })
    );
  });

  test('does not notify yourself', async () => {
    const result = await createNotification({
      recipient: 'same', sender: 'same', workspace: 'w1', task: null, type: 'TASK_ASSIGNED',
    });
    expect(result).toBeNull();
    expect(Notification.create).not.toHaveBeenCalled();
    expect(emitToUser).not.toHaveBeenCalled();
  });

  test('a socket failure does not fail notification creation', async () => {
    Notification.create.mockResolvedValue(fakeNotification('n3'));
    emitToUser.mockImplementation(() => { throw new Error('socket down'); });
    const result = await createNotification({
      recipient: 'r', sender: 's', workspace: 'w1', task: null, type: 'TASK_ASSIGNED',
    });
    expect(result).toEqual(expect.objectContaining({ _id: 'n3' }));
  });
});
