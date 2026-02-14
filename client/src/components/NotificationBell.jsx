import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Bell } from 'lucide-react';
import { fetchUnreadCount } from '../redux/slices/notificationSlice';

// ─────────────────────────────────────────────
// NotificationBell
// 
// Drop this into your Sidebar or Navbar.
// Shows a bell icon with a red badge showing unread count.
// Clicking it opens/closes the NotificationDrawer.
// ─────────────────────────────────────────────

const NotificationBell = ({ isOpen, onToggle }) => {
  const dispatch = useDispatch();
  const unreadCount = useSelector((state) => state.notifications.unreadCount);

  // Fetch unread count when the app loads
  useEffect(() => {
    dispatch(fetchUnreadCount());
  }, [dispatch]);

  return (
    <button
      onClick={onToggle}
      className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
    >
      <Bell
        size={22}
        className={`${isOpen ? 'text-blue-500' : 'text-gray-600 dark:text-gray-400'}`}
      />

      {/* Red badge — only shows when there are unread notifications */}
      {unreadCount > 0 && (
        <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-xs font-bold text-white bg-red-500 rounded-full">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );
};

export default NotificationBell;