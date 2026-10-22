const Workspace = require('../models/Workspace');
const { isObjectId } = require('../utils/validators');
const { workspaceRoom, userRoom } = require('../utils/realtime');

// What this file does now (and does NOT do):
//
//   ✅ presence  : workspace:join / workspace:leave / disconnect
//   ✅ ephemeral : comment:typing, task:editing-start / -end
//   ❌ NO data writes. task create/update/move/delete and comment add are done
//      ONLY via REST; the REST controllers broadcast after the DB commit
//      (see utils/realtime.js). The old client-driven handlers allowed forged
//      broadcasts into any workspace and cross-workspace IDOR writes.
//
// Per-user notifications go to the `user:<id>` room that every socket joins —
// no in-memory Map, so it also works across multiple servers (Redis adapter).

async function verifyMembership(userId, workspaceId) {
  if (!isObjectId(workspaceId)) return false;
  const workspace = await Workspace.findById(workspaceId).select('members owner');
  if (!workspace) return false;
  return workspace.members.some((m) => m.user.toString() === userId.toString());
}

const presenceUser = (socket) => ({
  userId:    socket.userId,
  userName:  socket.user.name,
  userEmail: socket.user.email,
});

// Unique users (one entry per user even if they have several tabs open).
async function listOnlineUsers(io, room) {
  const sockets = await io.in(room).fetchSockets();
  const byUser = new Map();
  for (const s of sockets) {
    // s.data (not s.user): fetchSockets() may return RemoteSockets
    if (s.data?.userId && !byUser.has(s.data.userId)) {
      byUser.set(s.data.userId, { userId: s.data.userId, userName: s.data.name, userEmail: s.data.email });
    }
  }
  return [...byUser.values()];
}

const handleWorkspaceSocket = (io, socket) => {
  // All of this user's sockets (tabs/devices) share one room → notifications.
  socket.join(userRoom(socket.userId));

  // Announce "left" only if this was the user's LAST socket in that room.
  async function announceLeft(room) {
    const others = (await io.in(room).fetchSockets()).filter((s) => s.id !== socket.id);
    const stillThere = others.some((s) => s.data?.userId === socket.userId);
    if (!stillThere) {
      socket.to(room).emit('user:left', { userId: socket.userId, userName: socket.user.name });
    }
  }

  const joinedWorkspaceRooms = () =>
    Array.from(socket.rooms).filter((r) => r.startsWith('workspace:'));

  // ── JOIN WORKSPACE ──────────────────────────────────────────────────────────
  socket.on('workspace:join', async (workspaceId) => {
    try {
      if (!(await verifyMembership(socket.userId, workspaceId))) {
        socket.emit('error', { message: 'Not authorized to join this workspace' });
        return;
      }

      const room = workspaceRoom(workspaceId);

      // FIX: only leave *workspace* rooms. The old code left every room except
      // socket.id, which would also kick the socket out of its user:<id> room.
      const previous = joinedWorkspaceRooms().filter((r) => r !== room);
      for (const r of previous) {
        socket.leave(r);
        await announceLeft(r);
      }

      socket.join(room);
      socket.data.workspaceId = workspaceId;

      socket.to(room).emit('user:joined', presenceUser(socket));
      socket.emit('workspace:online-users', await listOnlineUsers(io, room));
    } catch (err) {
      console.error('workspace:join error', err);
      socket.emit('error', { message: 'Error joining workspace' });
    }
  });

  // ── LEAVE WORKSPACE ─────────────────────────────────────────────────────────
  socket.on('workspace:leave', async (workspaceId) => {
    if (!isObjectId(workspaceId)) return;
    const room = workspaceRoom(workspaceId);
    if (!socket.rooms.has(room)) return;
    socket.leave(room);
    if (socket.data.workspaceId === workspaceId) socket.data.workspaceId = null;
    await announceLeft(room);
  });

  // ── EPHEMERAL: typing / edit-lock ───────────────────────────────────────────
  // The room is taken from what the server knows (socket.data.workspaceId), never
  // from the client payload, and the socket must actually be inside it.
  const currentRoom = () => {
    const id = socket.data.workspaceId;
    if (!id) return null;
    const room = workspaceRoom(id);
    return socket.rooms.has(room) ? room : null;
  };

  socket.on('comment:typing', (data) => {
    const room = currentRoom();
    if (!room || !isObjectId(data?.taskId)) return;
    socket.to(room).emit('comment:typing', {
      taskId: data.taskId, userName: socket.user.name, userId: socket.userId,
    });
  });

  socket.on('task:editing-start', (data) => {
    const room = currentRoom();
    if (!room || !isObjectId(data?.taskId)) return;
    socket.to(room).emit('task:locked', {
      taskId: data.taskId, lockedBy: socket.user.name, userId: socket.userId,
    });
  });

  socket.on('task:editing-end', (data) => {
    const room = currentRoom();
    if (!room || !isObjectId(data?.taskId)) return;
    socket.to(room).emit('task:unlocked', { taskId: data.taskId });
  });

  // ── DISCONNECT ──────────────────────────────────────────────────────────────
  // FIX: use 'disconnecting', not 'disconnect'. By the time 'disconnect' fires
  // socket.rooms is already empty, so user:left was never broadcast when a tab
  // was closed (confirmed by test).
  socket.on('disconnecting', async () => {
    for (const room of joinedWorkspaceRooms()) {
      try {
        await announceLeft(room);
      } catch (err) {
        console.error('announceLeft error', err);
      }
    }
  });
};

module.exports = handleWorkspaceSocket;
