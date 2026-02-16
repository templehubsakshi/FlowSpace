import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useSocket } from './Usesocket';
import { addNotification, fetchUnreadCount } from '../redux/slices/notificationSlice';
import toast from 'react-hot-toast';

/**
 * useNotificationSocket Hook
 * 
 * Listens for real-time notifications via Socket.IO
 * Automatically updates Redux store and shows toast notifications
 */
export default function useNotificationSocket() {
  const dispatch = useDispatch();
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) {
      console.log('❌ No socket available for notifications');
      return;
    }

    console.log('✅ Setting up notification listener');

    // Fetch initial unread count
    dispatch(fetchUnreadCount());

    // Listen for new notifications
    const handleNewNotification = (notification) => {
      console.log('🔔 New notification received:', notification);
      
      // Add to Redux store
      dispatch(addNotification(notification));
      
      // Show toast notification
      toast(notification.message, {
        icon: '🔔',
        duration: 4000,
        position: 'top-right',
        style: {
          background: '#1f2937',
          color: '#fff',
        },
      });
    };

    socket.on('notification:new', handleNewNotification);

    // Cleanup
    return () => {
      console.log('🧹 Cleaning up notification listener');
      socket.off('notification:new', handleNewNotification);
    };
  }, [socket, dispatch]);

  return null; // This hook doesn't return anything
}