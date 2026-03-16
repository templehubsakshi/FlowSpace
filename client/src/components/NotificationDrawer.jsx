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

const getNotificationIcon = (type) => {
  const icons = {
    TASK_ASSIGNED:        { Icon: CheckCircle, color: 'var(--brand-primary)', bg: 'rgba(91,106,240,0.1)' },
    TASK_UNASSIGNED:      { Icon: CheckCircle, color: 'var(--status-medium)', bg: 'var(--status-medium-bg)' },
    TASK_STATUS_CHANGED:  { Icon: CheckCircle, color: '#a855f7',              bg: 'rgba(168,85,247,0.1)' },
    TASK_CREATED:         { Icon: CheckCircle, color: 'var(--status-done)',   bg: 'var(--status-done-bg)' },
    TASK_DELETED:         { Icon: Trash2,      color: 'var(--status-high)',   bg: 'var(--status-high-bg)' },
    TASK_COMMENTED:       { Icon: Bell,        color: '#f59e0b',              bg: 'rgba(245,158,11,0.1)' },
    TASK_MENTIONED:       { Icon: User,        color: '#ec4899',              bg: 'rgba(236,72,153,0.1)' },
    MEMBER_JOINED:        { Icon: User,        color: 'var(--brand-accent)',  bg: 'rgba(6,182,212,0.1)' },
    MEMBER_LEFT:          { Icon: User,        color: 'var(--text-tertiary)', bg: 'var(--surface-hover)' },
    MEMBER_ROLE_CHANGED:  { Icon: User,        color: 'var(--brand-primary)', bg: 'rgba(91,106,240,0.1)' },
  };
  return icons[type] || { Icon: Bell, color: 'var(--text-tertiary)', bg: 'var(--surface-hover)' };
};

const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
};

const NotificationItem = ({ notification, onRead, onDelete }) => {
  const { Icon, color, bg } = getNotificationIcon(notification.type);

  return (
    <div
      onClick={() => !notification.isRead && onRead(notification._id)}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 10,
        padding: '12px 16px',
        borderBottom: '1px solid var(--border-subtle)',
        cursor: 'pointer',
        background: notification.isRead ? 'transparent' : 'rgba(91,106,240,0.04)',
        transition: 'var(--transition-fast)',
        position: 'relative',
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-hover)'}
      onMouseLeave={e => e.currentTarget.style.background = notification.isRead ? 'transparent' : 'rgba(91,106,240,0.04)'}
      className="group"
    >
      {/* Unread left bar */}
      {!notification.isRead && (
        <span style={{
          position: 'absolute', left: 0, top: '20%', height: '60%',
          width: 2.5, background: 'var(--brand-primary)',
          borderRadius: '0 2px 2px 0',
        }} />
      )}

      {/* Icon */}
      <div style={{
        width: 32, height: 32, borderRadius: 'var(--radius-sm)', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: bg, color: color,
      }}>
        <Icon style={{ width: 15, height: 15 }} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontSize: 12.5, lineHeight: 1.5,
          color: notification.isRead ? 'var(--text-secondary)' : 'var(--text-primary)',
          fontWeight: notification.isRead ? 400 : 500,
        }}>
          {notification.message}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 4 }}>
          <Clock style={{ width: 10, height: 10, color: 'var(--text-tertiary)', flexShrink: 0 }} />
          <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
            {timeAgo(notification.createdAt)}
          </span>
          {!notification.isRead && (
            <span style={{
              marginLeft: 'auto', width: 7, height: 7, borderRadius: '50%',
              background: 'var(--brand-primary)', flexShrink: 0,
              boxShadow: '0 0 0 2px rgba(91,106,240,0.2)',
            }} />
          )}
        </div>
      </div>

      {/* Delete button */}
      <button
        onClick={e => { e.stopPropagation(); onDelete(notification._id); }}
        style={{
          opacity: 0, width: 26, height: 26, borderRadius: 'var(--radius-xs)',
          background: 'var(--surface-sunken)', border: '1px solid var(--border-subtle)',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--text-tertiary)', transition: 'var(--transition-fast)', flexShrink: 0,
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--status-high-bg)'; e.currentTarget.style.color = 'var(--status-high)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface-sunken)'; e.currentTarget.style.color = 'var(--text-tertiary)'; }}
        className="notification-delete-btn"
      >
        <Trash2 style={{ width: 12, height: 12 }} />
      </button>

      <style>{`.group:hover .notification-delete-btn { opacity: 1 !important; }`}</style>
    </div>
  );
};

const NotificationDrawer = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { list, isLoading, unreadCount } = useSelector(state => state.notifications);

  useEffect(() => {
    if (isOpen) dispatch(fetchNotifications());
  }, [isOpen, dispatch]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 40, backdropFilter: 'blur(2px)' }}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className="animate-slideInRight"
        style={{
          position: 'fixed', top: 0, right: 0, height: '100%',
          width: 380, zIndex: 50,
          display: 'flex', flexDirection: 'column',
          background: 'var(--surface-overlay)',
          borderLeft: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-xl)',
        }}
      >

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Bell style={{ width: 16, height: 16, color: 'var(--text-secondary)' }} />
            <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
              Notifications
            </h2>
            {unreadCount > 0 && (
              <span style={{
                fontSize: 10, fontWeight: 800, color: 'white',
                background: 'var(--status-high)', borderRadius: 'var(--radius-full)',
                padding: '1px 7px', minWidth: 20, textAlign: 'center',
              }}>
                {unreadCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-icon"
            style={{ color: 'var(--text-tertiary)' }}
          >
            <X style={{ width: 15, height: 15 }} />
          </button>
        </div>

        {/* Actions bar */}
        {list.length > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '8px 16px',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'var(--surface-sunken)',
            flexShrink: 0,
          }}>
            {unreadCount > 0 ? (
              <button
                onClick={() => dispatch(markAllAsRead())}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  fontSize: 11.5, fontWeight: 600, color: 'var(--brand-primary)',
                  background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0',
                }}
              >
                <CheckCheck style={{ width: 13, height: 13 }} />
                Mark all read
              </button>
            ) : <span />}
            <button
              onClick={() => dispatch(clearAllNotifications())}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                fontSize: 11.5, fontWeight: 600, color: 'var(--text-tertiary)',
                background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0',
                transition: 'var(--transition-fast)',
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--status-high)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-tertiary)'}
            >
              <Trash2 style={{ width: 12, height: 12 }} />
              Clear all
            </button>
          </div>
        )}

        {/* List */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {isLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 140 }}>
              <div className="loading-spinner" style={{ width: 28, height: 28, borderWidth: 2.5 }} />
            </div>
          ) : list.length === 0 ? (
            <div style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              height: 260, padding: '0 32px', textAlign: 'center',
            }}>
              <div style={{
                width: 52, height: 52, borderRadius: 'var(--radius-lg)',
                background: 'var(--surface-sunken)',
                border: '1px solid var(--border-subtle)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 12,
              }}>
                <Bell style={{ width: 22, height: 22, color: 'var(--text-disabled)' }} />
              </div>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                All caught up!
              </p>
              <p style={{ fontSize: 12.5, color: 'var(--text-tertiary)' }}>
                No notifications yet
              </p>
            </div>
          ) : (
            list.map(notification => (
              <NotificationItem
                key={notification._id}
                notification={notification}
                onRead={id => dispatch(markAsRead(id))}
                onDelete={id => dispatch(deleteNotification(id))}
              />
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationDrawer;