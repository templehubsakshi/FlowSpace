/* eslint-disable react-refresh/only-export-components */
import { createContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { setSocketId } from '../utils/socketId';

export const SocketContext = createContext();

export function SocketProvider({ children }) {
  const [socket,      setSocket]      = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const socketRef = useRef(null);

  // Connect when logged in, disconnect when logged out
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!isAuthenticated) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSocket(null);
        setIsConnected(false);
        setOnlineUsers([]);
        setSocketId(null);
      }
      return;
    }

    // withCredentials: true → browser sends the httpOnly cookie with the handshake
    const newSocket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      withCredentials: true,
      reconnection: true,
      // FIX: was 5 attempts — after ~5 failures (e.g. laptop asleep / short
      // outage) the client gave up for good and live updates died silently
      // until a manual page refresh. Keep retrying (with capped back-off).
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
    });

    socketRef.current = newSocket;

    let hasConnectedBefore = false;
    newSocket.on('connect', () => {
      setIsConnected(true);
      setSocketId(newSocket.id);
      // Only toast on a RE-connect; the very first connect on every page load
      // doesn't need a toast.
      if (hasConnectedBefore) {
        toast.success('Reconnected — live updates active', { id: 'socket-status', duration: 2000, icon: '🟢' });
      }
      hasConnectedBefore = true;
    });

    newSocket.on('disconnect', (reason) => {
      setIsConnected(false);
      setSocketId(null);
      // "io client disconnect" = we closed it ourselves (logout/unmount)
      if (reason !== 'io client disconnect') {
        toast.error('Connection lost — reconnecting…', { id: 'socket-status', duration: 2000, icon: '🔴' });
      }
    });

    newSocket.on('connect_error', (err) => {
      console.error('Socket connect error:', err.message);
    });

    newSocket.on('error', (error) => {
      toast.error(error?.message || 'Socket error occurred');
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
      socketRef.current = null;
      setSocketId(null);
    };
  }, [isAuthenticated]);

  return (
    <SocketContext.Provider value={{ socket, isConnected, onlineUsers, setOnlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
}
