import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useSocket } from '../context/SocketContext';
import toast from 'react-hot-toast';

// ✅ Import socket-specific actions (NOT async thunks)
import { 
  addTaskFromSocket,
  updateTaskFromSocket,
  deleteTaskFromSocket
} from '../redux/slices/taskSlice';

export const useWorkspaceSocket = (workspaceId) => {
  const { socket, isConnected, setOnlineUsers } = useSocket();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!socket || !isConnected || !workspaceId) return;

    // Join workspace room
    socket.emit('workspace:join', workspaceId);

    // Listen for online users
    socket.on('workspace:online-users', (users) => {
      setOnlineUsers(users);
    });

    // Listen for user joined
    socket.on('user:joined', (data) => {
      toast(`${data.userName} joined workspace`, {
        icon: '👋',
        duration: 2000
      });
      setOnlineUsers((prev) => [...prev, data]);
    });

    // Listen for user left
    socket.on('user:left', (data) => {
      toast(`${data.userName} left workspace`, {
        icon: '👋',
        duration: 2000
      });
      setOnlineUsers((prev) => 
        prev.filter(u => u.userId !== data.userId)
      );
    });

    // ✅ FIXED: Listen for task created (use socket action, not async thunk)
    socket.on('task:created', (data) => {
      dispatch(addTaskFromSocket(data.task)); // Just add to Redux, no API call
      toast.success(`${data.createdBy} created a task`, {
        duration: 2000
      });
    });

    // ✅ FIXED: Listen for task updated (use socket action)
    socket.on('task:updated', (data) => {
      // Reconstruct the full task update
      const updatedTask = {
        _id: data.taskId,
        ...data.updates
      };
      dispatch(updateTaskFromSocket(updatedTask));
      toast(`${data.updatedBy} updated a task`, {
        icon: '✏️',
        duration: 2000
      });
    });

    // ✅ FIXED: Listen for task moved (use socket action)
    socket.on('task:moved', (data) => {
      const updatedTask = {
        _id: data.taskId,
        status: data.newStatus
      };
      dispatch(updateTaskFromSocket(updatedTask));
      toast(`${data.movedBy} moved a task`, {
        icon: '🔄',
        duration: 2000
      });
    });

    // ✅ FIXED: Listen for task deleted (use socket action)
    socket.on('task:deleted', (data) => {
      dispatch(deleteTaskFromSocket(data.taskId)); // Just remove from Redux
      toast.error(`${data.deletedBy} deleted a task`, {
        duration: 2000
      });
    });

    // Cleanup
    return () => {
      socket.emit('workspace:leave', workspaceId);
      socket.off('workspace:online-users');
      socket.off('user:joined');
      socket.off('user:left');
      socket.off('task:created');
      socket.off('task:updated');
      socket.off('task:moved');
      socket.off('task:deleted');
    };
  }, [socket, isConnected, workspaceId, dispatch, setOnlineUsers]);

  return { socket, isConnected };
};