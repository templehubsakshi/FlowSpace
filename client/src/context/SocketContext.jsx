// client/src/context/SocketContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  
  const { user, token } = useSelector((state) => state.auth);

  useEffect(() => {
    // Only connect if user is authenticated
    if (!user || !token) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // Create socket connection
    const newSocket = io("http://localhost:5000", {
      auth: {
        token: token
      },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });
window.socket = newSocket;
    // Connection events
    newSocket.on('connect', () => {
      console.log('✅ Socket connected');
      setIsConnected(true);
      toast.success('Connected - Live updates active', {
        duration: 2000,
        icon: '🟢'
      });
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
      setIsConnected(false);
      toast.error('Connection lost - Reconnecting...', {
        duration: 2000,
        icon: '🔴'
      });
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      toast.error('Connection error', { duration: 2000 });
    });

    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
      toast.error(error.message || 'Socket error occurred');
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
    };
  }, [user, token]);

  const value = {
    socket,
    isConnected,
    onlineUsers,
    setOnlineUsers
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};