const express = require('express');
const {
  createTask,
  getWorkspaceTasks,
  getTask,
  updateTask,
  deleteTask,
  moveTask,
  addComment,
  deleteComment
} = require('../controllers/taskController');

const { protect } = require('../middelware/auth');
const { loadWorkspace, isMember } = require('../middelware/workspace');
const { loadTask } = require('../middelware/task');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Task CRUD
// createTask takes workspaceId from the body; loadWorkspace already reads
// req.body.workspaceId as a fallback, so the chain works unchanged.
router.post('/', loadWorkspace, isMember, createTask);
router.get('/workspace/:workspaceId', loadWorkspace, isMember, getWorkspaceTasks);

// The rest are keyed by :taskId — loadTask resolves the task's workspace
// first so loadWorkspace/isMember can run the same membership check as
// everywhere else in the app.
router.get('/:taskId', loadTask, loadWorkspace, isMember, getTask);
router.put('/:taskId', loadTask, loadWorkspace, isMember, updateTask);
router.delete('/:taskId', loadTask, loadWorkspace, isMember, deleteTask);

// Drag-and-drop
router.patch('/:taskId/move', loadTask, loadWorkspace, isMember, moveTask);

// Comments
router.post('/:taskId/comments', loadTask, loadWorkspace, isMember, addComment);
router.delete('/:taskId/comments/:commentId', loadTask, loadWorkspace, isMember, deleteComment);

module.exports = router;
