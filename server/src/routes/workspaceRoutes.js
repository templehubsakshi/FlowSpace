const express = require('express');

const {
  createWorkspace,
  getMyWorkspaces,
  getWorkspace,
  updateWorkspace,
  deleteWorkspace,
  inviteMember,
  removeMember,
  leaveWorkspace
} = require('../controllers/workspaceController');
const { protect } = require('../middelware/auth');
const { isMember, isAdmin, isOwner } = require('../middelware/workspace');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Workspace CRUD
router.post('/', createWorkspace);
router.get('/', getMyWorkspaces);
router.get('/:workspaceId', isMember, getWorkspace);
router.put('/:workspaceId', isMember, isAdmin, updateWorkspace);
router.delete('/:workspaceId', isMember, isOwner, deleteWorkspace);

// Member management
router.post('/:workspaceId/invite', isMember, isAdmin, inviteMember);
router.delete('/:workspaceId/members/:memberId', isMember, isAdmin, removeMember);
router.post('/:workspaceId/leave', isMember, leaveWorkspace);

module.exports = router;