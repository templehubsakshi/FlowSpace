const Task = require('../models/Task');

const onlineUsers = new Map();

const handleWorkspaceSocket = (io, socket) => {
  onlineUsers.set(socket.userId, socket.id);
  
  // JOIN WORKSPACE
  socket.on('workspace:join', async (workspaceId) => {
    try {
      const rooms = Array.from(socket.rooms);
      rooms.forEach(room => {
        if (room !== socket.id) socket.leave(room);
      });

      socket.join(`workspace:${workspaceId}`);
      console.log(`User ${socket.user.name} joined workspace:${workspaceId}`);

      socket.to(`workspace:${workspaceId}`).emit('user:joined', { 
        userId: socket.userId,
        userName: socket.user.name,
        userEmail: socket.user.email
      });

      const socketsInRoom = await io.in(`workspace:${workspaceId}`).fetchSockets();
      const onlineUsersList = socketsInRoom.map(s => ({
        userId: s.userId,
        userName: s.user.name,
        userEmail: s.user.email
      }));
      socket.emit('workspace:online-users', onlineUsersList);

    } catch (error) {
      console.error('Error in workspace:join', error);
      socket.emit('error', { message: 'An error occurred while joining the workspace.' });
    }
  });

  // LEAVE WORKSPACE
  socket.on('workspace:leave', (workspaceId) => {
    socket.leave(`workspace:${workspaceId}`);
    socket.to(`workspace:${workspaceId}`).emit('user:left', {
      userId: socket.userId,
      userName: socket.user.name
    });
  });

  // TASK CREATE
  socket.on('task:create', async (data) => {
    try {
      const { workspaceId, task } = data;
      socket.to(`workspace:${workspaceId}`).emit('task:created', { 
        task, 
        createdBy: socket.user.name 
      });
    } catch (error) {
      console.error('Error in task:create', error);
    }
  });

  // TASK UPDATE
  socket.on('task:update', async (data) => {
    try {
      const { workspaceId, taskId, updates } = data;
      const task = await Task.findById(taskId);
      if (!task) return;

      Object.assign(task, updates);
      await task.save();
      socket.to(`workspace:${workspaceId}`).emit('task:updated', { 
        taskId, 
        updates, 
        updatedBy: socket.user.name 
      });
    } catch (error) {
      console.error('Error in task:update', error);
    }
  });

  // TASK MOVE
  socket.on('task:move', async (data) => {
    try {
      const { workspaceId, taskId, newStatus, newOrder } = data;
      const task = await Task.findById(taskId);
      if (!task) return;

      const oldStatus = task.status;
      task.status = newStatus;
      task.order = newOrder;
      await task.save();

      socket.to(`workspace:${workspaceId}`).emit('task:moved', { 
        taskId, 
        newStatus, 
        oldStatus, 
        movedBy: socket.user.name 
      });
    } catch (error) {
      console.error('Error in task:move', error);
    }
  });

  // TASK DELETE
  socket.on('task:delete', async (data) => {
    try {
      const { workspaceId, taskId } = data;
      await Task.findByIdAndDelete(taskId);
      socket.to(`workspace:${workspaceId}`).emit('task:deleted', { 
        taskId, 
        deletedBy: socket.user.name 
      });
    } catch (error) {
      console.error('Error in task:delete', error);
    }
  });

  // COMMENTS
  socket.on('comment:typing', (data) => {
    const { workspaceId, taskId } = data;
    socket.to(`workspace:${workspaceId}`).emit('comment:typing', { 
      taskId, 
      userName: socket.user.name, 
      userId: socket.userId 
    });
  });

  // ✅ FIXED: Just broadcast, don't save again (HTTP endpoint already saved it)
  socket.on('comment:add', async (data) => {
    try {
      const { workspaceId, taskId, comment } = data;
      
      // ✅ Comment already saved by HTTP endpoint
      // Just broadcast to other users in workspace
      socket.to(`workspace:${workspaceId}`).emit('comment:added', { 
        taskId, 
        comment,  // Send the full comment object
        addedBy: socket.user.name 
      });
      
      console.log(`📢 Broadcast comment:added for task ${taskId} in workspace ${workspaceId}`);
    } catch (error) {
      console.error('Error in comment:add', error);
    }
  });

  // TASK EDITING LOCK
  socket.on('task:editing-start', (data) => {
    const { workspaceId, taskId } = data;
    socket.to(`workspace:${workspaceId}`).emit('task:locked', { 
      taskId, 
      lockedBy: socket.user.name, 
      userId: socket.userId 
    });
  });

  socket.on('task:editing-end', (data) => {
    const { workspaceId, taskId } = data;
    socket.to(`workspace:${workspaceId}`).emit('task:unlocked', { taskId });
  });

  // DISCONNECT
  socket.on('disconnect', () => {
    onlineUsers.delete(socket.userId);
    const rooms = Array.from(socket.rooms);
    rooms.forEach(room => {
      if (room !== socket.id && room.startsWith('workspace:')) {
        socket.to(room).emit('user:left', { 
          userId: socket.userId, 
          userName: socket.user.name 
        });
      }
    });
  });
};

// Export the handler and a getter for onlineUsers
module.exports = handleWorkspaceSocket;
module.exports.getOnlineUsers = () => onlineUsers;