const express = require('express');
const {
  createWorkspace, getMyWorkspaces, getWorkspace,
  updateWorkspace, deleteWorkspace,
  inviteMember, removeMember, leaveWorkspace,
  updateMemberRole
} = require('../controllers/workspaceController');
const { protect } = require('../middelware/auth');
const { loadWorkspace, isMember, isAdmin, isOwner } = require('../middelware/workspace');

const router = express.Router();

router.use(protect);

// ── No workspace context needed ──────────────────────────────────────────────
router.post('/', createWorkspace);
router.get('/',  getMyWorkspaces);

// ── Workspace-scoped routes ──────────────────────────────────────────────────
router.get   ('/:workspaceId',                         loadWorkspace, isMember,           getWorkspace);
router.put   ('/:workspaceId',                         loadWorkspace, isMember, isAdmin,   updateWorkspace);
router.delete('/:workspaceId',                         loadWorkspace, isMember, isOwner,   deleteWorkspace);

router.post  ('/:workspaceId/invite',                  loadWorkspace, isMember, isAdmin,   inviteMember);
router.delete('/:workspaceId/members/:memberId',       loadWorkspace, isMember, isAdmin,   removeMember);
router.post  ('/:workspaceId/leave',                   loadWorkspace, isMember,            leaveWorkspace);

// Role change — sirf owner kar sakta hai (isOwner middleware)
router.patch ('/:workspaceId/members/:memberId/role',  loadWorkspace, isMember, isOwner,   updateMemberRole);

module.exports = router;