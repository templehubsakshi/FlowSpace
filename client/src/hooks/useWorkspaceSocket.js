import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { useSocket } from './Usesocket';
import {
  fetchTasks,
  addTaskFromSocket,
  updateTaskFromSocket,
  moveTaskFromSocket,
  deleteTaskFromSocket,
  addCommentFromSocket,
  deleteCommentFromSocket,
} from '../redux/slices/taskSlice';
import { fetchWorkspaces } from '../redux/slices/workspaceSlice';

/**
 * Live workspace updates.
 *
 * IMPORTANT: call this hook ONCE (it is in Dashboard). It used to be called in
 * both Dashboard and KanbanBoard, so every event was handled twice, and leaving
 * the Board tab ran KanbanBoard's cleanup → `workspace:leave` → the user was
 * silently removed from the room and stopped receiving live updates.
 *
 * The client no longer emits task/comment events: writes go through REST and
 * the server broadcasts to the other tabs/users after saving.
 */
export const useWorkspaceSocket = (workspaceId) => {
  const dispatch = useDispatch();
  const { socket, isConnected, setOnlineUsers } = useSocket();

  useEffect(() => {
    if (!socket || !workspaceId) return;

    // FIX: after a network drop Socket.IO reconnects with a NEW socket id and
    // the server has forgotten every room, so the old code (which joined only
    // once, when the effect ran) never received events again. Join on every
    // (re)connect, and refetch tasks after a RE-connect to catch missed events.
    let firstJoin = true;
    const join = () => {
      socket.emit('workspace:join', workspaceId);
      if (!firstJoin) dispatch(fetchTasks(workspaceId));
      firstJoin = false;
    };

    if (socket.connected) join();
    socket.on('connect', join);

    // ── Tasks (events are sent by the server after REST writes) ──────────────
    const handleTaskCreated = (data) => { if (data?.task) dispatch(addTaskFromSocket(data.task)); };
    const handleTaskUpdated = (data) => { if (data?.task) dispatch(updateTaskFromSocket(data.task)); };
    const handleTaskMoved   = (data) => {
      if (data?.task) dispatch(moveTaskFromSocket({ task: data.task, newOrder: data.newOrder }));
    };
    const handleTaskDeleted = (data) => { if (data?.taskId) dispatch(deleteTaskFromSocket(data.taskId)); };

    // ── Comments ─────────────────────────────────────────────────────────────
    const handleCommentAdded = (data) => {
      if (data?.comment) dispatch(addCommentFromSocket({ taskId: data.taskId, comment: data.comment }));
    };
    const handleCommentDeleted = (data) => {
      if (data?.commentId) dispatch(deleteCommentFromSocket({ taskId: data.taskId, commentId: data.commentId }));
    };

    // ── Presence (kept in SocketContext; UI can read onlineUsers) ────────────
    const handleOnlineUsers = (users) => setOnlineUsers(Array.isArray(users) ? users : []);
    const handleUserJoined = (user) =>
      setOnlineUsers((prev) => (prev.some((u) => u.userId === user.userId) ? prev : [...prev, user]));
    const handleUserLeft = (user) =>
      setOnlineUsers((prev) => prev.filter((u) => u.userId !== user.userId));

    // ── Membership changes ───────────────────────────────────────────────────
    const handleRemoved = () => {
      toast.error('You no longer have access to this workspace');
      dispatch(fetchWorkspaces());
    };
    const handleWorkspaceDeleted = () => {
      toast('This workspace was deleted');
      dispatch(fetchWorkspaces());
    };

    socket.on('task:created',           handleTaskCreated);
    socket.on('task:updated',           handleTaskUpdated);
    socket.on('task:moved',             handleTaskMoved);
    socket.on('task:deleted',           handleTaskDeleted);
    socket.on('comment:added',          handleCommentAdded);
    socket.on('comment:deleted',        handleCommentDeleted);
    socket.on('user:joined',            handleUserJoined);
    socket.on('user:left',              handleUserLeft);
    socket.on('workspace:online-users', handleOnlineUsers);
    socket.on('workspace:removed',      handleRemoved);
    socket.on('workspace:deleted',      handleWorkspaceDeleted);

    return () => {
      socket.emit('workspace:leave', workspaceId);
      socket.off('connect', join);
      socket.off('task:created',           handleTaskCreated);
      socket.off('task:updated',           handleTaskUpdated);
      socket.off('task:moved',             handleTaskMoved);
      socket.off('task:deleted',           handleTaskDeleted);
      socket.off('comment:added',          handleCommentAdded);
      socket.off('comment:deleted',        handleCommentDeleted);
      socket.off('user:joined',            handleUserJoined);
      socket.off('user:left',              handleUserLeft);
      socket.off('workspace:online-users', handleOnlineUsers);
      socket.off('workspace:removed',      handleRemoved);
      socket.off('workspace:deleted',      handleWorkspaceDeleted);
      setOnlineUsers([]);
    };
  }, [socket, workspaceId, dispatch, setOnlineUsers]);

  return { socket, isConnected };
};
