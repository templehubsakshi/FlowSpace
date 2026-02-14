import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { X, Bell, Trash2, CheckCheck, Clock, User, CheckCircle } from 'lucide-react';
import {
  fetchNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
} from '../redux/slices/notificationSlice';

// ─────────────────────────────────────────────
// Icon mapping — each notification type gets its own icon + color
// ─────────────────────────────────────────────
const getNotificationIcon = (type) => {
  const icons = {
    TASK_ASSIGNED:        { Icon: CheckCircle, color: 'text-blue-500 bg-blue-50' },
    TASK_UNASSIGNED:      { Icon: CheckCircle, color: 'text-orange-500 bg-orange-50' },
    TASK_STATUS_CHANGED:  { Icon: CheckCircle, color: 'text-purple-500 bg-purple-50' },
    TASK_CREATED:         { Icon: CheckCircle, color: 'text-green-500 bg-green-50' },
    TASK_DELETED:         { Icon: Trash2,      color: 'text-red-500 bg-red-50' },
    TASK_COMMENTED:       { Icon: Bell,        color: 'text-yellow-500 bg-yellow-50' },
    TASK_MENTIONED:       { Icon: User,        color: 'text-pink-500 bg-pink-50' },
    MEMBER_JOINED:        { Icon: User,        color: 'text-teal-500 bg-teal-50' },
    MEMBER_LEFT:          { Icon: User,        color: 'text-gray-500 bg-gray-50' },
    MEMBER_ROLE_CHANGED:  { Icon: User,        color: 'text-indigo-500 bg-indigo-50' },
  };

  return icons[type] || { Icon: Bell, color: 'text-gray-500 bg-gray-50' };
};

// ─────────────────────────────────────────────
// Time ago helper — "2 minutes ago", "1 hour ago", etc.
// ─────────────────────────────────────────────
const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
};

// ─────────────────────────────────────────────
// Single notification item
// ─────────────────────────────────────────────
const NotificationItem = ({ notification, onRead, onDelete }) => {
  const { Icon, color } = getNotificationIcon(notification.type);

  return (
    <div
      className={`group flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors
        ${notification.isRead ? 'hover:bg-gray-50 dark:hover:bg-gray-800' : 'bg-blue-50/40 dark:bg-blue-900/20 hover:bg-blue-50 dark:hover:bg-blue-900/30'}`}
      onClick={() => !notification.isRead && onRead(notification._id)}
    >
      {/* Icon */}
      <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${color}`}>
        <Icon size={18} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm leading-snug ${notification.isRead ? 'text-gray-600 dark:text-gray-400' : 'text-gray-800 dark:text-gray-200 font-medium'}`}>
          {notification.message}
        </p>

        <div className="flex items-center gap-2 mt-1">
          <Clock size={11} className="text-gray-400" />
          <span className="text-xs text-gray-400">{timeAgo(notification.createdAt)}</span>

          {/* Unread dot */}
          {!notification.isRead && (
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 ml-auto" />
          )}
        </div>
      </div>

      {/* Delete button — shows on hover */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(notification._id);
        }}
        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-all text-gray-400 hover:text-red-500"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
};

// ─────────────────────────────────────────────
// NotificationDrawer — the main panel
// ─────────────────────────────────────────────
const NotificationDrawer = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { list, isLoading, unreadCount } = useSelector((state) => state.notifications);

  // Fetch notifications whenever the drawer opens
  useEffect(() => {
    if (isOpen) {
      dispatch(fetchNotifications());
    }
  }, [isOpen, dispatch]);

  const handleMarkAsRead = (id) => dispatch(markAsRead(id));
  const handleDelete = (id) => dispatch(deleteNotification(id));
  const handleMarkAllRead = () => dispatch(markAllAsRead());
  const handleClearAll = () => dispatch(clearAllNotifications());

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-96 bg-white dark:bg-gray-900 shadow-2xl z-50 flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Bell size={20} className="text-gray-700 dark:text-gray-300" />
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
              Notifications
            </h2>
            {unreadCount > 0 && (
              <span className="text-xs font-bold text-white bg-red-500 rounded-full px-2 py-0.5">
                {unreadCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Action buttons */}
        {list.length > 0 && (
          <div className="flex items-center justify-between px-4 py-2 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600 font-medium"
              >
                <CheckCheck size={14} />
                Mark all read
              </button>
            )}
            <button
              onClick={handleClearAll}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 font-medium ml-auto"
            >
              <Trash2 size={14} />
              Clear all
            </button>
          </div>
        )}

        {/* Notification list */}
        <div className="flex-1 overflow-y-auto p-2">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : list.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center px-6">
              <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
                <Bell size={24} className="text-gray-400" />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                You're all caught up!
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                No notifications yet
              </p>
            </div>
          ) : (
            list.map((notification) => (
              <NotificationItem
                key={notification._id}
                notification={notification}
                onRead={handleMarkAsRead}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationDrawer;