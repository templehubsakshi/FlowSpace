/* eslint-disable react-refresh/only-export-components */
import { createContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';

export const SocketContext = createContext();

export function SocketProvider({ children }) {
  const [socket,      setSocket]      = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const socketRef = useRef(null);

  // ✅ Only depends on isAuthenticated — connect when logged in, disconnect when logged out
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    // Don't connect if not authenticated
    if (!isAuthenticated) {
      // If a socket already exists (e.g. after logout), disconnect it
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // ✅ withCredentials: true → browser sends httpOnly cookie automatically
    // No token in auth: {} needed — cookie handles authentication on backend
    const newSocket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      withCredentials: true,   // ✅ Sends cookie with the handshake request
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = newSocket;

    newSocket.on('connect', () => {
      setIsConnected(true);
      toast.success('Connected — live updates active', { duration: 2000, icon: '🟢' });
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      toast.error('Connection lost — reconnecting…', { duration: 2000, icon: '🔴' });
    });

    newSocket.on('connect_error', (err) => {
      console.error('Socket connect error:', err.message);
      toast.error('Connection error', { duration: 2000 });
    });

    newSocket.on('error', (error) => {
      toast.error(error.message || 'Socket error occurred');
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated]); // ✅ Re-runs on login/logout — no token dependency

  return (
    <SocketContext.Provider value={{ socket, isConnected, onlineUsers, setOnlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
}