const mongoose = require('mongoose');
const Task = require('../models/Task');
const { createNotification } = require('./notificationController');
const { buildReorderOperations } = require('../utils/taskOrdering');

const VALID_STATUSES = ['todo', 'in-progress', 'done'];

// NOTE: membership/authorization is handled upstream by the route middleware
// chain (loadTask -> loadWorkspace -> isMember), which attaches:
//   req.task            (routes keyed by :taskId)
//   req.workspace        (the workspace document)
//   req.workspaceMember  (the caller's member record, incl. role)
// so controllers below don't re-fetch the workspace or re-check membership.

// ================= CREATE TASK =================
exports.createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      status = 'todo',
      priority = 'medium',
      assignee,
      dueDate,
      tags
    } = req.body;

    const workspaceId = req.workspace._id;
    const userId = req.userId;

    if (!title) {
      return res.status(400).json({ message: 'Title and workspace are required' });
    }

    const tasksInColumn = await Task.find({ workspace: workspaceId, status })
      .sort({ order: -1 })
      .limit(1);

    const order = tasksInColumn.length > 0 && tasksInColumn[0].order != null
      ? tasksInColumn[0].order + 1
      : 0;

    const task = await Task.create({
      title,
      description,
      status,
      priority,
      workspace: workspaceId,
      assignee: assignee || undefined,
      creator: userId,
      dueDate: dueDate || undefined,
      tags: tags || [],
      order
    });

    await task.populate([
      { path: 'creator', select: 'name email' },
      { path: 'assignee', select: 'name email' }
    ]);

    res.status(201).json({ success: true, message: 'Task created successfully', task });

  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ================= GET WORKSPACE TASKS =================
exports.getWorkspaceTasks = async (req, res) => {
  try {
    const workspaceId = req.workspace._id;

    const tasks = await Task.find({ workspace: workspaceId })
      .populate('creator', 'name email')
      .populate('assignee', 'name email')
      .populate('comments.user', 'name email')
      .sort({ order: 1, createdAt: -1 });

    const groupedTasks = {
      todo:          tasks.filter(t => t.status === 'todo'),
      'in-progress': tasks.filter(t => t.status === 'in-progress'),
      done:          tasks.filter(t => t.status === 'done')
    };

    res.json({ success: true, tasks: groupedTasks });

  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ================= GET SINGLE TASK =================
exports.getTask = async (req, res) => {
  try {
    await req.task.populate([
      { path: 'creator', select: 'name email' },
      { path: 'assignee', select: 'name email' },
      { path: 'comments.user', select: 'name email' }
    ]);

    res.json({ success: true, task: req.task });

  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ================= UPDATE TASK =================
exports.updateTask = async (req, res) => {
  try {
    const task = req.task;
    const updates = req.body;

    const allowedFields = ['title', 'description', 'status', 'priority', 'assignee', 'dueDate', 'tags'];
    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        task[field] = updates[field];
      }
    });

    await task.save();
    await task.populate([
      { path: 'creator', select: 'name email' },
      { path: 'assignee', select: 'name email' }
    ]);

    res.json({ success: true, message: 'Task updated successfully', task });

  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ================= DELETE TASK =================
exports.deleteTask = async (req, res) => {
  try {
    const task = req.task;
    const member = req.workspaceMember;
    const userId = req.userId;

    const isCreator = task.creator?.toString() === userId;
    const isAdmin = ['admin', 'owner'].includes(member.role);

    if (!isCreator && !isAdmin) {
      return res.status(403).json({
        message: 'Only workspace owner, admin, or task creator can delete this task'
      });
    }

    await Task.findByIdAndDelete(task._id);

    res.json({ success: true, message: 'Task deleted successfully' });

  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ================= MOVE TASK =================
// FIX: previously this only ever incremented order in the *destination*
// column and never renumbered the *source* column, so dragging a task out
// of a column left a permanent gap in that column's order sequence (and
// cross-column moves plus concurrent drags could desync order entirely
// since nothing here was transactional). This now:
//   1. Validates newStatus/newOrder.
//   2. Computes the full set of shifts needed (source column close-gap +
//      destination column make-room, or same-column shift) via the pure,
//      unit-tested buildReorderOperations().
//   3. Applies the shifts + the task's own update inside a single
//      transaction, so a crash mid-move can't leave orders inconsistent.
exports.moveTask = async (req, res) => {
  const { newStatus, newOrder } = req.body;

  if (!VALID_STATUSES.includes(newStatus)) {
    return res.status(400).json({ message: `newStatus must be one of: ${VALID_STATUSES.join(', ')}` });
  }
  if (typeof newOrder !== 'number' || !Number.isFinite(newOrder) || newOrder < 0) {
    return res.status(400).json({ message: 'newOrder must be a non-negative number' });
  }

  const task = req.task;
  const oldStatus = task.status;
  const oldOrder = task.order;

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const ops = buildReorderOperations({
      workspaceId: task.workspace,
      taskId: task._id,
      oldStatus,
      oldOrder,
      newStatus,
      newOrder
    });

    if (ops.length > 0) {
      await Task.bulkWrite(ops, { session });
    }

    task.status = newStatus;
    task.order = newOrder;
    await task.save({ session });

    await session.commitTransaction();

    await task.populate([
      { path: 'creator', select: 'name email' },
      { path: 'assignee', select: 'name email' }
    ]);

    res.json({ success: true, message: 'Task moved successfully', task });

  } catch (error) {
    await session.abortTransaction().catch(() => {});
    console.error('Move task error:', error);

    // Transactions require MongoDB to be running as a replica set (Atlas
    // clusters are by default; a bare local `mongod` is not). Surface that
    // clearly instead of a generic 500 during dev.
    if (error.message && error.message.includes('Transaction numbers')) {
      return res.status(500).json({
        message: 'Move failed: this MongoDB instance is not configured as a replica set, so transactions are unavailable. Use MongoDB Atlas or run mongod with --replSet locally.'
      });
    }

    res.status(500).json({ message: error.message });
  } finally {
    session.endSession();
  }
};

// ================= ADD COMMENT =================
exports.addComment = async (req, res) => {
  try {
    const { text, mentions = [] } = req.body;
    const userId = req.userId;
    const task = req.task;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    task.comments.push({ user: userId, text, mentions });
    await task.save();
    await task.populate('comments.user', 'name email');

    if (mentions && mentions.length > 0) {
      await Promise.all(
        mentions.map(mentionUserId =>
          createNotification({
            recipient: mentionUserId,
            sender: userId,
            workspace: task.workspace,
            task: task._id,
            type: 'TASK_MENTIONED',
          })
        )
      );
    }

    res.json({
      success: true,
      message: 'Comment added',
      comment: task.comments.at(-1)
    });

  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ================= DELETE COMMENT =================
exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.userId;
    const task = req.task;
    const member = req.workspaceMember;

    const comment = task.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    if (comment.user.toString() !== userId && !['admin', 'owner'].includes(member.role)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    task.comments.pull(commentId);
    await task.save();

    res.json({ success: true, message: 'Comment deleted' });

  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ message: error.message });
  }
};
