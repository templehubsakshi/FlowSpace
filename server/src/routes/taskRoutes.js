const express=require('express');
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

const router = express.Router();

// All routes require authentication
router.use(protect);

// Task CRUD
router.post('/', createTask);
router.get('/workspace/:workspaceId', getWorkspaceTasks);
router.get('/:taskId', getTask);
router.put('/:taskId', updateTask);
router.delete('/:taskId', deleteTask);

// Drag-and-drop
router.patch('/:taskId/move', moveTask);

// Comments
router.post('/:taskId/comments', addComment);
router.delete('/:taskId/comments/:commentId', deleteComment);

module.exports = router;