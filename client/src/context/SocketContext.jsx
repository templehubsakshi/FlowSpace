/* eslint-disable react-refresh/only-export-components */
import { createContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';

// Export context for the separate hook file
export const SocketContext = createContext();

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  
  const { user } = useSelector((state) => state.auth);
  
  // Get token from localStorage instead of Redux
  const token = localStorage.getItem('token');

  useEffect(() => {
    // Only connect if user is authenticated AND token exists
    if (!user || !token) {
      console.log('⏳ No user or token, skipping socket connection');
      return;
    }

    console.log('🔌 Creating socket connection with token...');

    // Create socket connection
    const newSocket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000", {
      auth: {
        token: token
      },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    // Expose socket globally for debugging
    window.socket = newSocket;

    let mounted = true;

    // Connection events
    newSocket.on('connect', () => {
      console.log('✅ Socket connected:', newSocket.id);
      if (mounted) {
        setIsConnected(true);
        toast.success('Connected - Live updates active', {
          duration: 2000,
          icon: '🟢'
        });
      }
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
      if (mounted) {
        setIsConnected(false);
        toast.error('Connection lost - Reconnecting...', {
          duration: 2000,
          icon: '🔴'
        });
      }
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error.message);
      if (mounted) {
        toast.error('Connection error', { duration: 2000 });
      }
    });

    newSocket.on('error', (error) => {
      console.error('❌ Socket error:', error);
      if (mounted) {
        toast.error(error.message || 'Socket error occurred');
      }
    });

    // Socket initialization in useEffect is necessary for real-time connections
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    if (mounted) {
      setSocket(newSocket);
    }

    // Cleanup on unmount
    return () => {
      mounted = false;
      console.log('🧹 Disconnecting socket...');
      newSocket.disconnect();
      window.socket = null;
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
}