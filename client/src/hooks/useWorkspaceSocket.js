import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useSocket } from './Usesocket';
import {
  addTaskFromSocket,
  updateTaskFromSocket,
  deleteTaskFromSocket,
  addCommentFromSocket
} from '../redux/slices/taskSlice';

/**
 * useWorkspaceSocket Hook
 * 
 * Listens for real-time workspace events via Socket.IO
 * Updates Redux store for tasks, comments, and user presence
 */
export const useWorkspaceSocket = (workspaceId) => {
  const dispatch = useDispatch();
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (!socket || !workspaceId) return;

    console.log(`🔌 Joining workspace: ${workspaceId}`);
    socket.emit('workspace:join', workspaceId);

    // ===== TASK EVENTS =====
    
    // Task created by another user
    const handleTaskCreated = (data) => {
      console.log('✨ Task created:', data.task.title);
      dispatch(addTaskFromSocket(data.task));
    };

    // Task updated by another user
    const handleTaskUpdated = (data) => {
      console.log('🔄 Task updated:', data.taskId);
      dispatch(updateTaskFromSocket(data.updates));
    };

    // Task moved by another user
    const handleTaskMoved = (data) => {
      console.log('📦 Task moved:', data.taskId, 'to', data.newStatus);
      // Task move is handled by the drag-and-drop system
      // You might want to refresh or show a notification here
    };

    // Task deleted by another user
    const handleTaskDeleted = (data) => {
      console.log('🗑️ Task deleted:', data.taskId);
      dispatch(deleteTaskFromSocket(data.taskId));
    };

    // ===== COMMENT EVENTS =====
    
    // ✅ Comment added by another user (real-time update)
    const handleCommentAdded = (data) => {
      console.log('💬 Comment added to task:', data.taskId);
      dispatch(addCommentFromSocket({
        taskId: data.taskId,
        comment: data.comment
      }));
    };

    // Comment typing indicator
    const handleCommentTyping = (data) => {
      console.log('✍️ User typing:', data.userName);
      // You can show a typing indicator in the UI
    };

    // ===== USER PRESENCE =====
    
    const handleUserJoined = (data) => {
      console.log('👋 User joined:', data.userName);
    };

    const handleUserLeft = (data) => {
      console.log('👋 User left:', data.userName);
    };

    const handleOnlineUsers = (users) => {
      console.log('👥 Online users:', users.length);
    };

    // ===== REGISTER EVENT LISTENERS =====
    
    socket.on('task:created', handleTaskCreated);
    socket.on('task:updated', handleTaskUpdated);
    socket.on('task:moved', handleTaskMoved);
    socket.on('task:deleted', handleTaskDeleted);
    socket.on('comment:added', handleCommentAdded);  // ✅ Listen for comments
    socket.on('comment:typing', handleCommentTyping);
    socket.on('user:joined', handleUserJoined);
    socket.on('user:left', handleUserLeft);
    socket.on('workspace:online-users', handleOnlineUsers);

    // ===== CLEANUP =====
    
    return () => {
      console.log(`🔌 Leaving workspace: ${workspaceId}`);
      
      socket.emit('workspace:leave', workspaceId);
      
      socket.off('task:created', handleTaskCreated);
      socket.off('task:updated', handleTaskUpdated);
      socket.off('task:moved', handleTaskMoved);
      socket.off('task:deleted', handleTaskDeleted);
      socket.off('comment:added', handleCommentAdded);
      socket.off('comment:typing', handleCommentTyping);
      socket.off('user:joined', handleUserJoined);
      socket.off('user:left', handleUserLeft);
      socket.off('workspace:online-users', handleOnlineUsers);
    };
  }, [socket, workspaceId, dispatch]);

  return { socket, isConnected };
};