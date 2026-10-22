const Task = require('../models/Task');
const Notification = require('../models/Notification');
const { createNotification } = require('./notificationController');
const { buildReorderOperations } = require('../utils/taskOrdering');
const { emitToWorkspace, socketIdFromReq } = require('../utils/realtime');
const { isObjectId, uniqueObjectIds } = require('../utils/validators');
const { sendError } = require('../utils/httpErrors');
const { runInOptionalTransaction, sessionOpts } = require('../utils/withTransaction');

const VALID_STATUSES = ['todo', 'in-progress', 'done'];
const VALID_PRIORITIES = ['low', 'medium', 'high', 'urgent'];

// NOTE: membership/authorization is handled upstream by the route middleware
// chain (loadTask -> loadWorkspace -> isMember), which attaches:
//   req.task            (routes keyed by :taskId)
//   req.workspace        (the workspace document)
//   req.workspaceMember  (the caller's member record, incl. role)

const POPULATE = [
  { path: 'creator', select: 'name email' },
  { path: 'assignee', select: 'name email' },
  // FIX: update/move responses used to leave comments.user as a bare ObjectId.
  // The client replaces the whole task with the response, so every comment
  // author name disappeared after editing or dragging a task.
  { path: 'comments.user', select: 'name email' },
];

const toPlain = (task) => (task.toObject ? task.toObject() : task);

const isWorkspaceMember = (workspace, userId) =>
  workspace.members.some((m) => m.user.toString() === userId.toString());

// ── Validate + normalise task fields (shared by create & update) ─────────────
// Returns { errors: [...], values: {...} } — values only has the fields present.
function parseTaskFields(body = {}, workspace) {
  const errors = [];
  const values = {};

  if (body.title !== undefined) {
    if (typeof body.title !== 'string' || !body.title.trim()) errors.push('Title is required');
    else if (body.title.trim().length > 200) errors.push('Title must be at most 200 characters');
    else values.title = body.title.trim();
  }

  if (body.description !== undefined && body.description !== null) {
    if (typeof body.description !== 'string') errors.push('Description must be text');
    else if (body.description.length > 2000) errors.push('Description must be at most 2000 characters');
    else values.description = body.description;
  }

  if (body.status !== undefined) {
    if (!VALID_STATUSES.includes(body.status)) errors.push(`Status must be one of: ${VALID_STATUSES.join(', ')}`);
    else values.status = body.status;
  }

  if (body.priority !== undefined) {
    if (!VALID_PRIORITIES.includes(body.priority)) errors.push(`Priority must be one of: ${VALID_PRIORITIES.join(', ')}`);
    else values.priority = body.priority;
  }

  if (body.assignee !== undefined) {
    if (body.assignee === null || body.assignee === '') {
      values.assignee = null; // unassign
    } else if (!isObjectId(body.assignee)) {
      errors.push('Invalid assignee');
    } else if (!isWorkspaceMember(workspace, body.assignee)) {
      // FIX: you could assign a task to a user who isn't in the workspace.
      errors.push('Assignee must be a member of this workspace');
    } else {
      values.assignee = body.assignee;
    }
  }

  if (body.dueDate !== undefined) {
    if (body.dueDate === null || body.dueDate === '') {
      values.dueDate = null;
    } else {
      // FIX: the date picker sends "YYYY-MM-DD", which JS parses as UTC MIDNIGHT.
      // Users west of UTC (e.g. the US) then saw the task due the DAY BEFORE
      // (calendar, overdue badge). Store plain dates at 12:00 UTC so the same
      // calendar day shows in every timezone from UTC-11 to UTC+11.
      const raw = typeof body.dueDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(body.dueDate)
        ? `${body.dueDate}T12:00:00.000Z`
        : body.dueDate;
      const d = new Date(raw);
      if (Number.isNaN(d.getTime())) errors.push('Invalid due date');
      else values.dueDate = d;
    }
  }

  if (body.tags !== undefined) {
    if (!Array.isArray(body.tags)) errors.push('Tags must be an array');
    else {
      const tags = [...new Set(body.tags.filter((t) => typeof t === 'string').map((t) => t.trim()).filter(Boolean))];
      if (tags.length > 20 || tags.some((t) => t.length > 30)) errors.push('Max 20 tags, 30 characters each');
      else values.tags = tags;
    }
  }

  return { errors, values };
}

// ================= CREATE TASK =================
exports.createTask = async (req, res) => {
  try {
    const { errors, values } = parseTaskFields(req.body || {}, req.workspace);
    if (!values.title && !errors.length) errors.push('Title is required');
    if (errors.length) return res.status(400).json({ success: false, message: errors[0] });

    const workspaceId = req.workspace._id;
    const userId = req.userId;
    const status = values.status || 'todo';

    const tasksInColumn = await Task.find({ workspace: workspaceId, status })
      .sort({ order: -1 })
      .limit(1);

    const order = tasksInColumn.length > 0 && tasksInColumn[0].order != null
      ? tasksInColumn[0].order + 1
      : 0;

    const task = await Task.create({
      title: values.title,
      description: values.description,
      status,
      priority: values.priority || 'medium',
      workspace: workspaceId,
      assignee: values.assignee || undefined,
      creator: userId,
      dueDate: values.dueDate || undefined,
      tags: values.tags || [],
      order,
    });

    await task.populate(POPULATE);

    // Tell the assignee (the model/enum for this existed but was never used).
    if (values.assignee) {
      await createNotification({
        recipient: values.assignee, sender: userId, workspace: workspaceId,
        task: task._id, type: 'TASK_ASSIGNED',
      });
    }

    // Live update for everyone else in the workspace (skip the creator's tab).
    emitToWorkspace(workspaceId, 'task:created', { task: toPlain(task) }, socketIdFromReq(req));

    res.status(201).json({ success: true, message: 'Task created successfully', task });
  } catch (error) {
    sendError(res, error, 'Create task');
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
      done:          tasks.filter(t => t.status === 'done'),
    };

    res.json({ success: true, tasks: groupedTasks });
  } catch (error) {
    sendError(res, error, 'Get tasks');
  }
};

// ================= GET SINGLE TASK =================
exports.getTask = async (req, res) => {
  try {
    await req.task.populate(POPULATE);
    res.json({ success: true, task: req.task });
  } catch (error) {
    sendError(res, error, 'Get task');
  }
};

// ================= UPDATE TASK =================
exports.updateTask = async (req, res) => {
  try {
    const task = req.task;
    const { errors, values } = parseTaskFields(req.body || {}, req.workspace);
    if (errors.length) return res.status(400).json({ success: false, message: errors[0] });

    const oldAssignee = task.assignee ? task.assignee.toString() : null;
    const oldStatus = task.status;
    const oldOrder = task.order;

    const statusChanged = values.status !== undefined && values.status !== oldStatus;

    const apply = async (session) => {
      for (const field of ['title', 'description', 'priority', 'assignee', 'dueDate', 'tags']) {
        if (values[field] !== undefined) task[field] = values[field] === null ? undefined : values[field];
      }

      if (statusChanged) {
        // FIX: changing status via PUT used to keep the OLD `order`, leaving a
        // gap in the source column and a duplicate order in the destination.
        // Treat it as a move to the end of the destination column.
        const destCount = await Task.countDocuments({
          workspace: task.workspace, status: values.status, _id: { $ne: task._id },
        });
        const ops = buildReorderOperations({
          workspaceId: task.workspace, taskId: task._id,
          oldStatus, oldOrder: oldOrder ?? 0, newStatus: values.status, newOrder: destCount,
        });
        if (ops.length) await Task.bulkWrite(ops, sessionOpts(session));
        task.status = values.status;
        task.order = destCount;
      }

      await task.save(sessionOpts(session));
    };

    if (statusChanged) await runInOptionalTransaction(apply);
    else await apply(null);

    await task.populate(POPULATE);

    // Assignment notifications
    const newAssignee = task.assignee ? (task.assignee._id || task.assignee).toString() : null;
    if (newAssignee !== oldAssignee) {
      if (newAssignee) {
        await createNotification({
          recipient: newAssignee, sender: req.userId, workspace: task.workspace,
          task: task._id, type: 'TASK_ASSIGNED',
        });
      }
      if (oldAssignee) {
        await createNotification({
          recipient: oldAssignee, sender: req.userId, workspace: task.workspace,
          task: task._id, type: 'TASK_UNASSIGNED',
        });
      }
    }

    // FIX: REST edits (title/priority/assignee/…) were never broadcast, so other
    // users saw stale data until they refreshed.
    emitToWorkspace(task.workspace, 'task:updated', { task: toPlain(task) }, socketIdFromReq(req));

    res.json({ success: true, message: 'Task updated successfully', task });
  } catch (error) {
    sendError(res, error, 'Update task');
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
        success: false,
        message: 'Only workspace owner, admin, or task creator can delete this task',
      });
    }

    await Task.findByIdAndDelete(task._id);

    // Close the gap this task left in its column, and drop notifications that
    // pointed at it (they would otherwise reference a deleted task forever).
    await Task.updateMany(
      { workspace: task.workspace, status: task.status, order: { $gt: task.order ?? 0 } },
      { $inc: { order: -1 } }
    );
    await Notification.deleteMany({ task: task._id });

    // FIX: delete was never visible live — the old flow was REST delete, THEN a
    // client socket event whose handler couldn't find the (already deleted)
    // task and returned silently. The server broadcasts it itself now.
    emitToWorkspace(task.workspace, 'task:deleted', { taskId: task._id.toString() }, socketIdFromReq(req));

    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    sendError(res, error, 'Delete task');
  }
};

// ================= MOVE TASK =================
exports.moveTask = async (req, res) => {
  const { newStatus, newOrder } = req.body || {};

  if (!VALID_STATUSES.includes(newStatus)) {
    return res.status(400).json({ message: `newStatus must be one of: ${VALID_STATUSES.join(', ')}` });
  }
  if (!Number.isInteger(newOrder) || newOrder < 0) {
    return res.status(400).json({ message: 'newOrder must be a non-negative integer' });
  }

  const task = req.task;
  const oldStatus = task.status;
  const oldOrder = task.order ?? 0;

  try {
    // FIX: clamp to the column length. A huge newOrder used to be stored as-is
    // and left permanent gaps in the order sequence.
    const othersInDest = await Task.countDocuments({
      workspace: task.workspace, status: newStatus, _id: { $ne: task._id },
    });
    const finalOrder = Math.min(newOrder, othersInDest);

    await runInOptionalTransaction(async (session) => {
      const ops = buildReorderOperations({
        workspaceId: task.workspace, taskId: task._id,
        oldStatus, oldOrder, newStatus, newOrder: finalOrder,
      });
      if (ops.length > 0) await Task.bulkWrite(ops, sessionOpts(session));

      task.status = newStatus;
      task.order = finalOrder;
      await task.save(sessionOpts(session));
    });

    await task.populate(POPULATE);

    // Full task + the target index, so other clients can place it correctly
    // (the old payload had no order, so remote users saw it jump to the TOP).
    // oldStatus is read BEFORE the change — the old `oldStatus || task.status`
    // fallback evaluated after the change and always returned the new status.
    emitToWorkspace(
      task.workspace,
      'task:moved',
      { taskId: task._id.toString(), newStatus, oldStatus, newOrder: finalOrder, task: toPlain(task) },
      socketIdFromReq(req)
    );

    res.json({ success: true, message: 'Task moved successfully', task });
  } catch (error) {
    sendError(res, error, 'Move task');
  }
};

// ================= ADD COMMENT =================
exports.addComment = async (req, res) => {
  try {
    const { text } = req.body || {};
    const userId = req.userId;
    const task = req.task;

    if (typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Comment text is required' });
    }
    if (text.length > 1000) {
      return res.status(400).json({ success: false, message: 'Comment must be at most 1000 characters' });
    }

    // FIX: mentions came straight from the client. Anyone could "mention" any
    // user id — including people outside the workspace — and that person would
    // get a notification containing this task's title (cross-workspace leak).
    // Keep only valid, unique ids of actual workspace members.
    const mentions = uniqueObjectIds(req.body.mentions).filter((id) => isWorkspaceMember(req.workspace, id));

    task.comments.push({ user: userId, text: text.trim(), mentions });
    await task.save();
    await task.populate('comments.user', 'name email');

    const comment = task.comments.at(-1);

    await Promise.all(
      mentions.map((mentionUserId) =>
        createNotification({
          recipient: mentionUserId, sender: userId, workspace: task.workspace,
          task: task._id, type: 'TASK_MENTIONED',
        })
      )
    );

    // Server broadcasts the saved comment (clients can no longer inject one).
    emitToWorkspace(
      task.workspace,
      'comment:added',
      { taskId: task._id.toString(), comment: toPlain(comment), addedBy: comment.user?.name },
      socketIdFromReq(req)
    );

    res.json({ success: true, message: 'Comment added', comment });
  } catch (error) {
    sendError(res, error, 'Add comment');
  }
};

// ================= DELETE COMMENT =================
exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.userId;
    const task = req.task;
    const member = req.workspaceMember;

    const comment = isObjectId(commentId) ? task.comments.id(commentId) : null;
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });

    if (comment.user.toString() !== userId && !['admin', 'owner'].includes(member.role)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    task.comments.pull(commentId);
    await task.save();

    emitToWorkspace(
      task.workspace,
      'comment:deleted',
      { taskId: task._id.toString(), commentId },
      socketIdFromReq(req)
    );

    res.json({ success: true, message: 'Comment deleted' });
  } catch (error) {
    sendError(res, error, 'Delete comment');
  }
};
