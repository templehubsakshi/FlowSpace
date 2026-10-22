const Workspace = require('../models/Workspace');

// ── Load workspace and attach to req ───────────────────────────────────────
exports.loadWorkspace = async (req, res, next) => {
  try {
    // FIX: Express 5 leaves req.body undefined when nothing was parsed, so the
    // old `req.body.workspaceId` threw a TypeError on body-less requests.
    const workspaceId = req.params?.workspaceId || req.body?.workspaceId;
    if (!workspaceId) return res.status(400).json({ message: 'Workspace ID required' });

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) return res.status(404).json({ message: 'Workspace not found' });

    req.workspace = workspace;
    next();
  } catch (error) {
    // FIX: malformed ids (CastError) are the client's fault, not a 500.
    if (error.name === 'CastError') return res.status(404).json({ message: 'Workspace not found' });
    console.error('loadWorkspace error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ── Must be a member ────────────────────────────────────────────────────────
exports.isMember = async (req, res, next) => {
  try {
    const workspace = req.workspace;
    const userId = req.userId;

    const member = workspace.members.find(m => m.user.toString() === userId);
    if (!member) return res.status(403).json({ message: 'Not a member of this workspace' });

    req.workspaceMember = member;
    next();
  } catch (error) {
    console.error('isMember error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ── Must be admin or owner ──────────────────────────────────────────────────
exports.isAdmin = async (req, res, next) => {
  try {
    const member = req.workspaceMember;
    if (!member) return res.status(403).json({ message: 'Not a member of this workspace' });

    if (!['admin', 'owner'].includes(member.role)) {
      return res.status(403).json({ message: 'Admin or owner access required' });
    }
    next();
  } catch (error) {
    console.error('isAdmin error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ── Must be owner ───────────────────────────────────────────────────────────
exports.isOwner = async (req, res, next) => {
  try {
    const workspace = req.workspace;
    const userId = req.userId;

    if (workspace.owner.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Only the workspace owner can perform this action' });
    }
    next();
  } catch (error) {
    console.error('isOwner error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
