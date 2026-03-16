import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Bell } from 'lucide-react';
import { fetchUnreadCount } from '../redux/slices/notificationSlice';

const NotificationBell = ({ isOpen, onToggle }) => {
  const dispatch = useDispatch();
  const unreadCount = useSelector((state) => state.notifications.unreadCount);

  useEffect(() => {
    dispatch(fetchUnreadCount());
  }, [dispatch]);

  return (
    <button
      onClick={onToggle}
      aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      style={{
        position: 'relative',
        width: 28, height: 28,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'transparent', border: 'none', cursor: 'pointer',
        borderRadius: 'var(--radius-sm)',
        color: isOpen ? 'var(--brand-primary)' : 'var(--text-tertiary)',
        transition: 'var(--transition-fast)',
      }}
    >
      <Bell style={{ width: 16, height: 16 }} />

      {/* Unread badge */}
      {unreadCount > 0 && (
        <span style={{
          position: 'absolute', top: 1, right: 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          minWidth: 14, height: 14, padding: '0 3px',
          fontSize: 9, fontWeight: 800, color: 'white',
          background: 'var(--status-high)',
          borderRadius: 'var(--radius-full)',
          border: '1.5px solid var(--surface-base)',
          lineHeight: 1,
        }}>
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}

      {/* Active glow when open */}
      {isOpen && (
        <span style={{
          position: 'absolute', inset: 0,
          borderRadius: 'var(--radius-sm)',
          background: 'rgba(91,106,240,0.1)',
        }} />
      )}
    </button>
  );
};

export default NotificationBell;