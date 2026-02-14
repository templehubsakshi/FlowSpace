import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useSocket } from '../context/SocketContext';
import { addNotification } from '../redux/slices/notificationSlice';
import toast from 'react-hot-toast';

export default function NotificationListener() {
  const dispatch = useDispatch();
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) {
      console.log('❌ No socket available for notifications');
      return;
    }

    console.log('✅ Setting up notification listener');

    const handleNewNotification = (notification) => {
      console.log('🔔 New notification received:', notification);
      
      // Add to Redux store
      dispatch(addNotification(notification));
      
      // Show toast notification
      toast(notification.message, {
        icon: '🔔',
        duration: 4000,
        position: 'top-right',
      });
    };

    socket.on('notification:new', handleNewNotification);

    // Cleanup
    return () => {
      console.log('🧹 Cleaning up notification listener');
      socket.off('notification:new', handleNewNotification);
    };
  }, [socket, dispatch]);

  return null; // This component doesn't render anything
}