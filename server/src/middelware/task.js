const Task = require('../models/Task');

// ── Load task by :taskId and bridge into the workspace middleware chain ─────
// Routes here are keyed by taskId, not workspaceId, so loadWorkspace/isMember/
// isAdmin (middelware/workspace.js) can't run directly off req.params. This
// loads the task, attaches it as req.task, and copies its workspace id onto
// req.params.workspaceId so the existing chain works unmodified:
//
//   router.put('/:taskId', loadTask, loadWorkspace, isMember, updateTask);
//
exports.loadTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    req.task = task;
    req.params.workspaceId = task.workspace.toString();
    next();
  } catch (error) {
    // FIX: a malformed id (e.g. /api/tasks/abc) is a client error, not a 500.
    if (error.name === 'CastError') return res.status(404).json({ message: 'Task not found' });
    console.error('loadTask error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
