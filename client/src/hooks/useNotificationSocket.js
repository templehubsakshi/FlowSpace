import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useSocket } from './Usesocket';
import { addNotification, fetchUnreadCount } from '../redux/slices/notificationSlice';
import toast from 'react-hot-toast';

/**
 * useNotificationSocket
 * 
 * Handles toast display + Redux list update for new notifications.
 * Unread count badge refresh is handled separately by NotificationListener (App.jsx).
 * The two are split to avoid duplicate increments:
 *   - NotificationListener → only fetchUnreadCount (no toast, no list push)
 *   - useNotificationSocket → toast + addNotification (no fetchUnreadCount)
 */
export default function useNotificationSocket() {
  const dispatch = useDispatch();
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    dispatch(fetchUnreadCount());

    const handleNewNotification = (notification) => {
      dispatch(addNotification(notification));
      toast(notification.message, {
        icon: '🔔',
        duration: 4000,
        position: 'top-right',
        style: {
          background: 'var(--surface)',
          color: 'var(--text)',
          border: '1px solid var(--border2)',
          fontSize: '13px',
          fontFamily: "'Inter', sans-serif",
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        },
      });
    };

    socket.on('notification:new', handleNewNotification);
    return () => socket.off('notification:new', handleNewNotification);
  }, [socket, dispatch]);
}
