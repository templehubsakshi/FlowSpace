/* eslint-disable react-refresh/only-export-components */
import { createContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';

export const SocketContext = createContext();

export function SocketProvider({ children }) {
  const [socket, setSocket]         = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const socketRef = useRef(null);

  const { user }  = useSelector((state) => state.auth);
  // ✅ FIX: read token inside effect to avoid stale closure
  // (keeping localStorage for now — migrate to cookie-only when backend is ready)

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!user || !token) return;

    const newSocket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // ✅ FIX: removed window.socket = ... (global exposure is a security bad practice)
    socketRef.current = newSocket;

    newSocket.on('connect', () => {
      setIsConnected(true);
      toast.success('Connected — live updates active', { duration: 2000, icon: '🟢' });
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      toast.error('Connection lost — reconnecting…', { duration: 2000, icon: '🔴' });
    });

    newSocket.on('connect_error', () => {
      toast.error('Connection error', { duration: 2000 });
    });

    newSocket.on('error', (error) => {
      toast.error(error.message || 'Socket error occurred');
    });

    // ✅ FIX: setSocket called inside effect is correct for external system (socket.io)
    // This is exactly the intended use-case: syncing React state with an external subscription
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
      socketRef.current = null;
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, isConnected, onlineUsers, setOnlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
}
