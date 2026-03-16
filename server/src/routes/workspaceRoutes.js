const express = require('express');
const {
  createWorkspace, getMyWorkspaces, getWorkspace,
  updateWorkspace, deleteWorkspace,
  inviteMember, removeMember, leaveWorkspace
} = require('../controllers/workspaceController');
const { protect }                        = require('../middelware/auth');
const { loadWorkspace, isMember, isAdmin, isOwner } = require('../middelware/workspace');

const router = express.Router();

// All routes require authentication
router.use(protect);

// ── No workspace context needed ──────────────────────────────────────────────
router.post('/', createWorkspace);
router.get('/',  getMyWorkspaces);

// ── All workspace-scoped routes: loadWorkspace FIRST, then role checks ───────
// ✅ FIX: loadWorkspace was missing — isMember was crashing with 500 because
//         req.workspace was undefined. Now loadWorkspace runs first on every
//         route that has a :workspaceId param.

router.get   ('/:workspaceId',                    loadWorkspace, isMember,          getWorkspace);
router.put   ('/:workspaceId',                    loadWorkspace, isMember, isAdmin,  updateWorkspace);
router.delete('/:workspaceId',                    loadWorkspace, isMember, isOwner,  deleteWorkspace);

router.post  ('/:workspaceId/invite',             loadWorkspace, isMember, isAdmin,  inviteMember);
router.delete('/:workspaceId/members/:memberId',  loadWorkspace, isMember, isAdmin,  removeMember);
router.post  ('/:workspaceId/leave',              loadWorkspace, isMember,           leaveWorkspace);

module.exports = router;