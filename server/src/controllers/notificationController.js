const Notification = require('../models/Notification');
const { getIO } = require('../config/socket');
const { getOnlineUsers } = require('../sockets/workspaceSocket');

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

    // Emit if recipient is online
    try {
      const io = getIO();
      const onlineUsers = getOnlineUsers();
      const recipientSocketId = onlineUsers.get(recipient.toString());
      
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('notification:new', payload);
        console.log(`✅ Notification sent to user ${recipient}`);
      }
    } catch (socketError) {
      console.error('Socket emission error:', socketError);
      // Don't fail the entire operation if socket fails
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
    const { page = 1, limit = 20, workspace } = req.query;

    const filter = { recipient: req.userId };
    if (workspace) filter.workspace = workspace;

    const notifications = await Notification.find(filter)
      .populate('sender', 'name')
      .populate('task', 'title')
      .sort({ createdAt: -1 })
      .skip((page - 1) * Number(limit))
      .limit(Number(limit));

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
    res.status(500).json({ success: false, message: 'Failed to fetch unread count' });
  }
};

// MARK single notification as read
exports.markAsRead = async (req, res) => {
  try {
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
    res.status(500).json({ success: false, message: 'Failed to mark notification as read' });
  }
};

// MARK all as read
exports.markAllAsRead = async (req, res) => {
  try {
    const filter = { recipient: req.userId, isRead: false };
    if (req.body.workspace) filter.workspace = req.body.workspace;

    await Notification.updateMany(filter, { isRead: true });

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read',
    });
  }
};

// DELETE single notification
exports.deleteNotification = async (req, res) => {
  try {
    const deleted = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.userId,
    });

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.json({ success: true, message: 'Notification deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete notification' });
  }
};

// CLEAR all notifications
exports.clearAllNotifications = async (req, res) => {
  try {
    const filter = { recipient: req.userId };
    if (req.body.workspace) filter.workspace = req.body.workspace;

    await Notification.deleteMany(filter);

    res.json({ success: true, message: 'All notifications cleared successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to clear notifications' });
  }
};