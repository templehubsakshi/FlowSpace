const Notification = require('../models/Notification');
const { emitToUser } = require('../utils/realtime');
const { isObjectId } = require('../utils/validators');

const getMessage = (notification) => {
  const senderName = notification.sender?.name || 'Someone';
  const taskTitle = notification.task?.title || 'a task';

  const messages = {
    TASK_ASSIGNED: `${senderName} assigned "${taskTitle}" to you.`,
    TASK_UNASSIGNED: `${senderName} removed you from "${taskTitle}".`,
    TASK_STATUS_CHANGED: `${senderName} moved "${taskTitle}" to ${notification.meta?.newStatus || 'a new status'}`,
    TASK_CREATED: `${senderName} created "${taskTitle}"`,
    TASK_DELETED: `${senderName} deleted "${taskTitle}"`,
    TASK_COMMENTED: `${senderName} commented on "${taskTitle}"`,
    TASK_MENTIONED: `${senderName} mentioned you in "${taskTitle}"`,
    MEMBER_JOINED: `${senderName} joined the workspace`,
    MEMBER_LEFT: `${senderName} left the workspace`,
    MEMBER_ROLE_CHANGED: `${senderName} changed your role to ${notification.meta?.newRole || 'a new role'}`,
  };

  return messages[notification.type] || 'You have a new notification';
};

// CREATE notification + emit via socket
exports.createNotification = async ({
  recipient,
  sender,
  workspace,
  task,
  type,
  meta = {},
}) => {
  try {
    // Don't notify yourself
    if (recipient.toString() === sender?.toString()) {
      return null;
    }

    const notification = await Notification.create({
      recipient,
      sender,
      workspace,
      task,
      type,
      meta,
    });

    await notification.populate('sender', 'name');
    if (task) await notification.populate('task', 'title');

    const payload = {
      _id: notification._id,
      type: notification.type,
      message: getMessage(notification.toObject()),
      isRead: false,
      createdAt: notification.createdAt,
      task: notification.task
        ? { _id: notification.task._id, title: notification.task.title }
        : null,
      sender: notification.sender
        ? { _id: notification.sender._id, name: notification.sender.name }
        : null,
      workspace: notification.workspace,
    };

    // Every open socket of the recipient (all tabs/devices) is in their
    // `user:<id>` room, so no in-memory userId→socketIds map is needed (it did
    // not work across multiple server instances).
    try {
      emitToUser(recipient, 'notification:new', payload);
    } catch (socketError) {
      console.error('Socket emission error:', socketError);
      // Don't fail the whole operation if the socket layer fails
    }

    return notification;
  } catch (error) {
    console.error('Failed to create notification', error);
    return null;
  }
};

// GET notifications
exports.getNotifications = async (req, res) => {
  try {
    // FIX: page/limit were used unvalidated — ?limit=10000000 dumped the whole
    // collection, and a non-numeric value produced NaN queries.
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
    const { workspace } = req.query;

    const filter = { recipient: req.userId };
    if (workspace !== undefined) {
      if (!isObjectId(workspace)) {
        return res.status(400).json({ success: false, message: 'Invalid workspace id' });
      }
      filter.workspace = workspace;
    }

    const notifications = await Notification.find(filter)
      .populate('sender', 'name')
      .populate('task', 'title')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const result = notifications.map((n) => ({
      _id: n._id,
      type: n.type,
      message: getMessage(n.toObject()),
      isRead: n.isRead,
      createdAt: n.createdAt,
      task: n.task ? { _id: n.task._id, title: n.task.title } : null,
      sender: n.sender ? { _id: n.sender._id, name: n.sender.name } : null,
      workspace: n.workspace,
    }));

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('getNotifications error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
  }
};

// GET unread count
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.userId,
      isRead: false,
    });
    res.json({ success: true, count });
  } catch (error) {
    console.error('getUnreadCount error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch unread count' });
  }
};

// MARK single notification as read
exports.markAsRead = async (req, res) => {
  try {
    if (!isObjectId(req.params.id)) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.json({ success: true, data: { _id: notification._id, isRead: true } });
  } catch (error) {
    console.error('markAsRead error:', error);
    res.status(500).json({ success: false, message: 'Failed to mark notification as read' });
  }
};

// Optional workspace filter from the body. FIX: Express 5 leaves req.body
// undefined on body-less requests (e.g. DELETE /notifications), so the old
// `req.body.workspace` threw and "Clear all" always returned 500.
const workspaceFromBody = (req) => {
  const ws = req.body?.workspace;
  return ws === undefined || ws === null || ws === '' ? null : ws;
};

// MARK all as read
exports.markAllAsRead = async (req, res) => {
  try {
    const filter = { recipient: req.userId, isRead: false };
    const ws = workspaceFromBody(req);
    if (ws) {
      if (!isObjectId(ws)) return res.status(400).json({ success: false, message: 'Invalid workspace id' });
      filter.workspace = ws;
    }

    await Notification.updateMany(filter, { isRead: true });

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('markAllAsRead error:', error);
    res.status(500).json({ success: false, message: 'Failed to mark all notifications as read' });
  }
};

// DELETE single notification
exports.deleteNotification = async (req, res) => {
  try {
    if (!isObjectId(req.params.id)) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    const deleted = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.userId,
    });

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.json({ success: true, message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('deleteNotification error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete notification' });
  }
};

// CLEAR all notifications
exports.clearAllNotifications = async (req, res) => {
  try {
    const filter = { recipient: req.userId };
    const ws = workspaceFromBody(req);
    if (ws) {
      if (!isObjectId(ws)) return res.status(400).json({ success: false, message: 'Invalid workspace id' });
      filter.workspace = ws;
    }

    await Notification.deleteMany(filter);

    res.json({ success: true, message: 'All notifications cleared successfully' });
  } catch (error) {
    console.error('clearAllNotifications error:', error);
    res.status(500).json({ success: false, message: 'Failed to clear notifications' });
  }
};
