
const Workspace = require('../models/Workspace');
const User = require('../models/User');
const Task = require('../models/Task');
const Notification = require('../models/Notification');

// ── Create workspace ────────────────────────────────────────────────────────
exports.createWorkspace = async (req, res) => {
  try {
    const { name, description } = req.body;
    const userId = req.userId;

    if (!name) return res.status(400).json({ message: 'Workspace name is required' });

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
    res.status(500).json({ message: error.message });
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
    res.status(500).json({ message: error.message });
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
    res.status(500).json({ message: error.message });
  }
};

// ── Update workspace (admin/owner only) ────────────────────────────────────
exports.updateWorkspace = async (req, res) => {
  try {
    const { name, description } = req.body;
    const workspace = req.workspace;

    if (name) workspace.name = name;
    if (description !== undefined) workspace.description = description;

    await workspace.save();
    await workspace.populate('owner', 'name email');
    await workspace.populate('members.user', 'name email');

    res.json({ success: true, message: 'Workspace updated successfully', workspace });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Delete workspace (owner only) ──────────────────────────────────────────
// ✅ FIX: Added cascade delete for tasks + notifications
exports.deleteWorkspace = async (req, res) => {
  try {
    const workspace = req.workspace;
    const workspaceId = workspace._id;

    // ✅ Cascade: delete all tasks in this workspace
    await Task.deleteMany({ workspace: workspaceId });

    // ✅ Cascade: delete all notifications related to this workspace
    await Notification.deleteMany({ workspace: workspaceId });

    // Delete the workspace itself
    await Workspace.findByIdAndDelete(workspaceId);

    res.json({ success: true, message: 'Workspace deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Invite member (admin/owner only) ───────────────────────────────────────
exports.inviteMember = async (req, res) => {
  try {
    const { email, role } = req.body;
    const workspace = req.workspace;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found with this email' });

    const alreadyMember = workspace.members.some(m => m.user.toString() === user._id.toString());
    if (alreadyMember) return res.status(400).json({ message: 'User is already a member' });

    // ✅ owner role cannot be assigned via invite
    const newRole = role && role.toLowerCase() === 'admin' ? 'admin' : 'member';

    workspace.members.push({ user: user._id, role: newRole });
    await workspace.save();
    await workspace.populate('members.user', 'name email');

    res.json({ success: true, message: `${user.name} added to workspace as ${newRole}`, workspace });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Remove member (admin/owner only) ───────────────────────────────────────
exports.removeMember = async (req, res) => {
  try {
    const { memberId } = req.params;
    const workspace = req.workspace;

    if (workspace.owner.toString() === memberId) {
      return res.status(400).json({ message: 'Cannot remove workspace owner' });
    }

    workspace.members = workspace.members.filter(m => m.user.toString() !== memberId);
    await workspace.save();

    res.json({ success: true, message: 'Member removed from workspace' });
  } catch (error) {
    res.status(500).json({ message: error.message });
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

    res.json({ success: true, message: 'You have left the workspace' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};