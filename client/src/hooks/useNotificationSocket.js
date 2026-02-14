import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useSocket } from '../context/SocketContext';
import { addNotification } from '../redux/slices/notificationSlice';

const useNotificationSocket = () => {
  const dispatch = useDispatch();

  // 👇 get full context
  const socketContext = useSocket();

  // 👇 extract actual socket safely
  const socket = socketContext?.socket;

  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (notification) => {
      dispatch(addNotification(notification));
    };

    socket.on('notification:new', handleNewNotification);

    return () => {
      socket.off('notification:new', handleNewNotification);
    };
  }, [socket, dispatch]);
};

export default useNotificationSocket;
