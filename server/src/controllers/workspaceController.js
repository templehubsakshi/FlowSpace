const Workspace = require('../models/Workspace');
const User = require('../models/User');
const Task = require('../models/Task');
const Notification = require('../models/Notification');
const { isObjectId, EMAIL_RE, normalizeEmail } = require('../utils/validators');
const { sendError } = require('../utils/httpErrors');
const { evictUserFromWorkspace, closeWorkspaceRoom } = require('../utils/realtime');

const cleanName = (v) => (typeof v === 'string' ? v.trim() : '');

// When someone stops being a member: kick their sockets out of the live room
// (they used to keep receiving that workspace's events) and unassign their
// tasks (they used to stay assigned to a person who no longer has access).
async function cleanupAfterMemberGone(workspaceId, userId) {
  evictUserFromWorkspace(userId, workspaceId);
  await Task.updateMany({ workspace: workspaceId, assignee: userId }, { $unset: { assignee: 1 } });
}

// ── Create workspace ────────────────────────────────────────────────────────
exports.createWorkspace = async (req, res) => {
  try {
    const name = cleanName(req.body?.name);
    const description = req.body?.description;
    const userId = req.userId;

    if (!name) return res.status(400).json({ message: 'Workspace name is required' });
    if (name.length > 50) return res.status(400).json({ message: 'Workspace name must be at most 50 characters' });
    if (description !== undefined && description !== null && typeof description !== 'string') {
      return res.status(400).json({ message: 'Description must be text' });
    }

    const workspace = await Workspace.create({
      name,
      description,
      owner: userId,
      members: [{ user: userId, role: 'owner' }]
    });

    await workspace.populate('owner', 'name email');
    await workspace.populate('members.user', 'name email');

    res.status(201).json({ success: true, message: 'Workspace created successfully', workspace });
  } catch (error) {
    sendError(res, error, 'Create workspace');
  }
};

// ── Get all workspaces for user ─────────────────────────────────────────────
exports.getMyWorkspaces = async (req, res) => {
  try {
    const workspaces = await Workspace.find({ 'members.user': req.userId })
      .populate('owner', 'name email')
      .populate('members.user', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, workspaces });
  } catch (error) {
    sendError(res, error, 'Get workspaces');
  }
};

// ── Get single workspace ────────────────────────────────────────────────────
exports.getWorkspace = async (req, res) => {
  try {
    const workspace = req.workspace;
    await workspace.populate('owner', 'name email');
    await workspace.populate('members.user', 'name email');
    res.json({ success: true, workspace });
  } catch (error) {
    sendError(res, error, 'Get workspace');
  }
};

// ── Update workspace (admin/owner only) ────────────────────────────────────
exports.updateWorkspace = async (req, res) => {
  try {
    const workspace = req.workspace;
    const { description } = req.body || {};

    if (req.body?.name !== undefined) {
      const name = cleanName(req.body.name);
      if (!name) return res.status(400).json({ message: 'Workspace name cannot be empty' });
      if (name.length > 50) return res.status(400).json({ message: 'Workspace name must be at most 50 characters' });
      workspace.name = name;
    }
    if (description !== undefined) {
      if (description !== null && typeof description !== 'string') {
        return res.status(400).json({ message: 'Description must be text' });
      }
      workspace.description = description;
    }

    await workspace.save();
    await workspace.populate('owner', 'name email');
    await workspace.populate('members.user', 'name email');

    res.json({ success: true, message: 'Workspace updated successfully', workspace });
  } catch (error) {
    sendError(res, error, 'Update workspace');
  }
};

// ── Delete workspace (owner only) ──────────────────────────────────────────
exports.deleteWorkspace = async (req, res) => {
  try {
    const workspace = req.workspace;
    const workspaceId = workspace._id;

    await Task.deleteMany({ workspace: workspaceId });
    await Notification.deleteMany({ workspace: workspaceId });
    await Workspace.findByIdAndDelete(workspaceId);

    // Tell everyone still viewing it and empty the live room.
    closeWorkspaceRoom(workspaceId);

    res.json({ success: true, message: 'Workspace deleted successfully' });
  } catch (error) {
    sendError(res, error, 'Delete workspace');
  }
};

// ── Invite member (admin/owner only) ───────────────────────────────────────
exports.inviteMember = async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const role = req.body?.role;
    const workspace = req.workspace;

    if (!EMAIL_RE.test(email)) return res.status(400).json({ message: 'A valid email is required' });

    const wantsAdmin = typeof role === 'string' && role.toLowerCase() === 'admin';

    // FIX: an admin could mint more admins, even though changing roles is
    // owner-only (updateMemberRole). Granting admin must be owner-only too.
    if (wantsAdmin && req.workspaceMember.role !== 'owner') {
      return res.status(403).json({ message: 'Only the workspace owner can invite admins' });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found with this email' });

    const alreadyMember = workspace.members.some(m => m.user.toString() === user._id.toString());
    if (alreadyMember) return res.status(400).json({ message: 'User is already a member' });

    const newRole = wantsAdmin ? 'admin' : 'member';

    workspace.members.push({ user: user._id, role: newRole });
    await workspace.save();
    await workspace.populate('members.user', 'name email');

    res.json({ success: true, message: `${user.name} added to workspace as ${newRole}`, workspace });
  } catch (error) {
    sendError(res, error, 'Invite member');
  }
};

// ── Update member role (owner only) ────────────────────────────────────────
// Owner can make any member admin or back to member. Nobody can change the
// owner's role, and 'owner' can't be assigned.
exports.updateMemberRole = async (req, res) => {
  try {
    const { memberId } = req.params;
    const { role } = req.body || {};
    const workspace = req.workspace;

    if (!['admin', 'member'].includes(role)) {
      return res.status(400).json({ message: "Role must be 'admin' or 'member'" });
    }

    if (workspace.owner.toString() === memberId) {
      return res.status(400).json({ message: 'Cannot change the role of the workspace owner' });
    }

    const member = workspace.members.find(m => m.user.toString() === memberId);
    if (!member) {
      return res.status(404).json({ message: 'Member not found in this workspace' });
    }

    member.role = role;
    await workspace.save();
    await workspace.populate('members.user', 'name email');

    res.json({ success: true, message: `Role updated to ${role}`, workspace });
  } catch (error) {
    sendError(res, error, 'Update member role');
  }
};

// ── Remove member (admin/owner only) ───────────────────────────────────────
exports.removeMember = async (req, res) => {
  try {
    const { memberId } = req.params;
    const workspace = req.workspace;

    if (!isObjectId(memberId)) return res.status(400).json({ message: 'Invalid member id' });

    if (workspace.owner.toString() === memberId) {
      return res.status(400).json({ message: 'Cannot remove workspace owner' });
    }
    if (memberId === req.userId) {
      return res.status(400).json({ message: 'Use "Leave workspace" to remove yourself' });
    }

    const target = workspace.members.find(m => m.user.toString() === memberId);
    // FIX: removing a non-member used to return "success".
    if (!target) return res.status(404).json({ message: 'Member not found in this workspace' });

    // FIX: an admin could remove other admins (even though only the owner can
    // change roles). Admins may only remove regular members.
    if (target.role === 'admin' && req.workspaceMember.role !== 'owner') {
      return res.status(403).json({ message: 'Only the workspace owner can remove an admin' });
    }

    workspace.members = workspace.members.filter(m => m.user.toString() !== memberId);
    await workspace.save();
    await cleanupAfterMemberGone(workspace._id, memberId);

    res.json({ success: true, message: 'Member removed from workspace' });
  } catch (error) {
    sendError(res, error, 'Remove member');
  }
};

// ── Leave workspace ─────────────────────────────────────────────────────────
exports.leaveWorkspace = async (req, res) => {
  try {
    const workspace = req.workspace;
    const userId = req.userId;

    if (workspace.owner.toString() === userId) {
      return res.status(400).json({
        message: 'Owner cannot leave workspace. Please delete it or transfer ownership.'
      });
    }

    workspace.members = workspace.members.filter(m => m.user.toString() !== userId);
    await workspace.save();
    await cleanupAfterMemberGone(workspace._id, userId);

    res.json({ success: true, message: 'You have left the workspace' });
  } catch (error) {
    sendError(res, error, 'Leave workspace');
  }
};
