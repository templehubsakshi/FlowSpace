// NotificationListener.jsx
// 
// ✅ FIX: This global component (mounted in App.jsx) previously BOTH dispatched
//         addNotification AND showed a toast — exactly like useNotificationSocket
//         in Dashboard does. That caused:
//           - duplicate toast for every notification
//           - unreadCount incrementing twice
//           - duplicate entries in notifications.list
//
// Solution: This global listener ONLY syncs the unread count badge.
//           useNotificationSocket (Dashboard) handles the toast + list update.
//           The two responsibilities are now cleanly separated.

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useSocket } from '../hooks/Usesocket';
import { fetchUnreadCount } from '../redux/slices/notificationSlice';

export default function NotificationListener() {
  const dispatch = useDispatch();
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    // Only refresh the unread count — no toast, no list push
    // That is handled by useNotificationSocket inside Dashboard
    const handleNewNotification = () => {
      dispatch(fetchUnreadCount());
    };

    socket.on('notification:new', handleNewNotification);

    return () => {
      socket.off('notification:new', handleNewNotification);
    };
  }, [socket, dispatch]);

  return null;
}