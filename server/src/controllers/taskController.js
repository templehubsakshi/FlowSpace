const Task = require('../models/Task');
const Workspace = require('../models/Workspace');
const { createNotification } = require('./notificationController');

// ================= CREATE TASK =================
exports.createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      status = 'todo',
      priority = 'medium',
      workspaceId,
      assignee,
      dueDate,
      tags
    } = req.body;

    const userId = req.userId;

    if (!title || !workspaceId) {
      return res.status(400).json({ message: 'Title and workspace are required' });
    }

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    const isMember = workspace.members.some(m => m.user.toString() === userId);
    if (!isMember) {
      return res.status(403).json({ message: 'Not a member of this workspace' });
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
    const { workspaceId } = req.params;
    const userId = req.userId;

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) return res.status(404).json({ message: 'Workspace not found' });

    const isMember = workspace.members.some(m => m.user.toString() === userId);
    if (!isMember) return res.status(403).json({ message: 'Not authorized' });

    const tasks = await Task.find({ workspace: workspaceId })
      .populate('creator', 'name email')
      .populate('assignee', 'name email')
      .populate('comments.user', 'name email')
      .sort({ order: 1, createdAt: -1 });

    // FIX: was 'in_progress' (underscore) — never matched DB status 'in-progress' (hyphen)
    // This caused all in-progress tasks to silently disappear from the kanban board
    const groupedTasks = {
      todo:        tasks.filter(t => t.status === 'todo'),
      in_progress: tasks.filter(t => t.status === 'in-progress'),
      done:        tasks.filter(t => t.status === 'done')
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
    const { taskId } = req.params;
    const userId = req.userId;

    const task = await Task.findById(taskId)
      .populate('creator', 'name email')
      .populate('assignee', 'name email')
      .populate('comments.user', 'name email');

    if (!task) return res.status(404).json({ message: 'Task not found' });

    // FIX: added null check — workspace can be deleted after task was created
    const workspace = await Workspace.findById(task.workspace);
    if (!workspace) return res.status(404).json({ message: 'Workspace not found' });

    const isMember = workspace.members.some(m => m.user.toString() === userId);
    if (!isMember) return res.status(403).json({ message: 'Not authorized' });

    res.json({ success: true, task });

  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ================= UPDATE TASK =================
exports.updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const updates = req.body;
    const userId = req.userId;

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // FIX: added null check on workspace
    const workspace = await Workspace.findById(task.workspace);
    if (!workspace) return res.status(404).json({ message: 'Workspace not found' });

    const isMember = workspace.members.some(m => m.user.toString() === userId);
    if (!isMember) return res.status(403).json({ message: 'Not authorized' });

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
    const { taskId } = req.params;
    const userId = req.userId;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // FIX: added null check on workspace
    const workspace = await Workspace.findById(task.workspace);
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    const member = workspace.members.find(m => m.user.toString() === userId);
    if (!member) {
      return res.status(403).json({ message: 'Not a workspace member' });
    }

    // FIX: removed console.log statements that leaked userId, creator, and role to production logs
    const isCreator = task.creator?.toString() === userId;
    const isAdmin   = ['admin', 'owner'].includes(member.role);

    if (!isCreator && !isAdmin) {
      return res.status(403).json({
        message: 'Only workspace owner, admin, or task creator can delete this task'
      });
    }

    await Task.findByIdAndDelete(taskId);

    res.json({ success: true, message: 'Task deleted successfully' });

  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ================= MOVE TASK =================
exports.moveTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { newStatus, newOrder } = req.body;
    const userId = req.userId;

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // FIX: added null check on workspace
    const workspace = await Workspace.findById(task.workspace);
    if (!workspace) return res.status(404).json({ message: 'Workspace not found' });

    const isMember = workspace.members.some(m => m.user.toString() === userId);
    if (!isMember) return res.status(403).json({ message: 'Not authorized' });

    const oldStatus = task.status;

    task.status = newStatus;
    task.order  = newOrder;
    await task.save();

    if (oldStatus !== newStatus) {
      await Task.updateMany(
        { workspace: task.workspace, status: newStatus, _id: { $ne: taskId }, order: { $gte: newOrder } },
        { $inc: { order: 1 } }
      );
    }

    await task.populate([
      { path: 'creator', select: 'name email' },
      { path: 'assignee', select: 'name email' }
    ]);

    res.json({ success: true, message: 'Task moved successfully', task });

  } catch (error) {
    console.error('Move task error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ================= ADD COMMENT =================
exports.addComment = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { text, mentions = [] } = req.body;
    const userId = req.userId;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // FIX: added null check on workspace
    const workspace = await Workspace.findById(task.workspace);
    if (!workspace) return res.status(404).json({ message: 'Workspace not found' });

    const isMember = workspace.members.some(m => m.user.toString() === userId);
    if (!isMember) return res.status(403).json({ message: 'Not authorized' });

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
    const { taskId, commentId } = req.params;
    const userId = req.userId;

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const comment = task.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    // FIX: added null check on workspace
    const workspace = await Workspace.findById(task.workspace);
    if (!workspace) return res.status(404).json({ message: 'Workspace not found' });

    // FIX: added null check on member — user may have been removed from workspace
    // after posting the comment. Without this, member.role throws a crash (500)
    const member = workspace.members.find(m => m.user.toString() === userId);
    if (!member) return res.status(403).json({ message: 'Not a workspace member' });

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