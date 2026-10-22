// Server-authoritative realtime helpers.
//
// DESIGN: clients never tell the server "broadcast this task/comment" any more.
// Writes go through REST (which does auth + validation), and the REST
// controller calls these helpers AFTER the DB commit. That removes a whole
// class of bugs the old client-driven socket events had:
//   - forged events (anyone could broadcast fake tasks into ANY workspace)
//   - cross-workspace IDOR on task:update / task:move / task:delete
//   - task:delete never broadcasting (REST had already deleted the task)
//   - REST-only edits (title/priority/assignee) never reaching other users
//
// All helpers are safe no-ops when Socket.IO isn't initialised (unit tests).
const { getIO } = require('../config/socket');

const workspaceRoom = (id) => `workspace:${id}`;
const userRoom = (id) => `user:${id}`;

const safeIO = () => {
  try {
    return getIO();
  } catch {
    return null;
  }
};

// Send to everyone in the workspace room. `exceptSocketId` (from the
// X-Socket-Id request header) skips the tab that made the change: it already
// updated itself from the REST response.
function emitToWorkspace(workspaceId, event, payload, exceptSocketId) {
  const io = safeIO();
  if (!io) return;
  let op = io.to(workspaceRoom(workspaceId.toString()));
  if (exceptSocketId && typeof exceptSocketId === 'string') op = op.except(exceptSocketId);
  op.emit(event, payload);
}

// Send to ALL open sockets of one user (every tab/device). Uses a per-user
// room instead of an in-memory Map, so it also works with the Redis adapter
// on multiple servers.
function emitToUser(userId, event, payload) {
  const io = safeIO();
  if (!io) return;
  io.to(userRoom(userId.toString())).emit(event, payload);
}

// Removed / left a workspace: kick every socket of that user out of the room so
// they stop receiving that workspace's live events (previously they kept
// receiving them until they disconnected).
function evictUserFromWorkspace(userId, workspaceId) {
  const io = safeIO();
  if (!io) return;
  io.in(userRoom(userId.toString())).socketsLeave(workspaceRoom(workspaceId.toString()));
  io.to(userRoom(userId.toString())).emit('workspace:removed', { workspaceId: workspaceId.toString() });
}

// Workspace deleted: tell everyone inside, then empty the room.
function closeWorkspaceRoom(workspaceId) {
  const io = safeIO();
  if (!io) return;
  const room = workspaceRoom(workspaceId.toString());
  io.to(room).emit('workspace:deleted', { workspaceId: workspaceId.toString() });
  io.in(room).socketsLeave(room);
}

const socketIdFromReq = (req) => {
  const id = req.get && req.get('x-socket-id');
  return typeof id === 'string' && id.length < 100 ? id : undefined;
};

module.exports = {
  workspaceRoom,
  userRoom,
  emitToWorkspace,
  emitToUser,
  evictUserFromWorkspace,
  closeWorkspaceRoom,
  socketIdFromReq,
};
