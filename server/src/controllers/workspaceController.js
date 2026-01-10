// const User = require('../models/User');
// const Workspace = require('../models/Workspace');

// //create workspace 
// exports.createWorkspace = async (req, res) => {   // FIX: crete → create
//   try {
//     const { name, description } = req.body;
//     const userId = req.userId;//from auth middleware

//     if (!name) {
//       return res.status(400).json({ message: 'Workspace name is required' });
//     }

//     // to create workspace 
//     const workspace = new Workspace({   // FIX: Workspace (capital W)
//       name,
//       description,
//       owner: userId,
//       members: [{
//         user: userId,
//         role: 'owner'
//       }]
//     });

//     await workspace.save(); // IMPORTANT
//     await workspace.populate('owner', 'name email');
//     await workspace.populate('members.user', 'name email');

//     res.status(201).json({
//       success: true,
//       message: 'Workspace created successfully',
//       workspace
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// exports.getMyWorkspaces = async (req, res) => {
//   try {
//     const userId = req.userId;

//     // Find workspaces where user is a member
//     const workspaces = await Workspace.find({
//       'members.user': userId
//     })
//       .populate('owner', 'name email')
//       .populate('members.user', 'name email')
//       .sort({ createdAt: -1 });// latest bala upar likho

//     res.json({
//       success: true,
//       workspaces
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// //get single workspace 
// exports.getWorkspace = async (req, res) => {
//   try {
//     const workspace = req.workspace;//from ismember middleware
//     await workspace.populate('owner', 'name email');
//     await workspace.populate('members.user', 'name email');

//     res.json({
//       success: true,
//       workspace
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// //u[adate workspace (admiin only )
// exports.updateWorkspace = async (req, res) => {
//   try {
//     const { name, description } = req.body;
//     const workspace = req.workspace; // FIX: worksapce → workspace

//     if (name) workspace.name = name;
//     if (description !== undefined) workspace.description = description;

//     await workspace.save();
//     await workspace.populate('owner', 'name email');
//     await workspace.populate('members.user', 'name email');

//     res.json({
//       success: true,
//       message: 'Workspace updated successfully',
//       workspace
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // for delete the workspace (owner ionly )
// exports.deleteWorkspace = async (req, res) => {
//   try {
//     const workspace = req.workspace;
//     await Workspace.findByIdAndDelete(workspace._id);//ye id aa rahi hai workspace middleware se

//     res.json({
//       success: true,
//       message: 'Workspace deleted successfully'
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // Invite member to workspace (admin only)
// exports.inviteMember = async (req, res) => {
//   try {
//     const { email, role = 'member' } = req.body;
//     const workspace = req.workspace;

//     // Find user by email
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(404).json({ message: 'User not found with this email' });
//     }

//     // Check if already a member
//     const alreadyMember = workspace.members.some(
//       m => m.user.toString() === user._id.toString()
//     );

//     if (alreadyMember) {
//       return res.status(400).json({ message: 'User is already a member' });
//     }

//     // Add member
//     workspace.members.push({
//       user: user._id,
//       role
//     });

//     await workspace.save();
//     await workspace.populate('members.user', 'name email');

//     res.json({
//       success: true,
//       message: `${user.name} added to workspace`,
//       workspace
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // Remove member from workspace (admin only)
// exports.removeMember = async (req, res) => {
//   try {
//     const { memberId } = req.params;
//     const workspace = req.workspace;

//     // Cannot remove owner
//     if (workspace.owner.toString() === memberId) {
//       return res.status(400).json({ message: 'Cannot remove workspace owner' });
//     }

//     // Remove member
//     workspace.members = workspace.members.filter(
//       m => m.user.toString() !== memberId
//     );

//     await workspace.save();

//     res.json({
//       success: true,
//       message: 'Member removed from workspace'
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // Leave workspace
// exports.leaveWorkspace = async (req, res) => {
//   try {
//     const workspace = req.workspace;
//     const userId = req.userId;

//     // Owner cannot leave (must delete workspace or transfer ownership)
//     if (workspace.owner.toString() === userId) {
//       return res.status(400).json({
//         message: 'Owner cannot leave workspace. Please delete the workspace or transfer ownership.'
//       });
//     }

//     // Remove user from members
//     workspace.members = workspace.members.filter(
//       m => m.user.toString() !== userId
//     );

//     await workspace.save();

//     res.json({
//       success: true,
//       message: 'You have left the workspace'
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
const Workspace = require('../models/Workspace');
const User = require('../models/User');

// Create workspace
exports.createWorkspace = async (req, res) => {
  try {
    const { name, description } = req.body;
    const userId = req.userId;

    // Validation
    if (!name) {
      return res.status(400).json({ message: 'Workspace name is required' });
    }

    // Create workspace
    const workspace = await Workspace.create({
      name,
      description,
      owner: userId,
      members: [{
        user: userId,
        role: 'owner'
      }]
    });

    // Populate owner info
    await workspace.populate('owner', 'name email');
    await workspace.populate('members.user', 'name email');

    res.status(201).json({
      success: true,
      message: 'Workspace created successfully',
      workspace
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all workspaces for logged-in user
exports.getMyWorkspaces = async (req, res) => {
  try {
    const userId = req.userId;

    // Find workspaces where user is a member
    const workspaces = await Workspace.find({
      'members.user': userId
    })
    .populate('owner', 'name email')
    .populate('members.user', 'name email')
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      workspaces
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single workspace
exports.getWorkspace = async (req, res) => {
  try {
    const workspace = req.workspace; // From middleware

    await workspace.populate('owner', 'name email');
    await workspace.populate('members.user', 'name email');

    res.json({
      success: true,
      workspace
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update workspace (admin only)
exports.updateWorkspace = async (req, res) => {
  try {
    const { name, description } = req.body;
    const workspace = req.workspace;

    if (name) workspace.name = name;
    if (description !== undefined) workspace.description = description;

    await workspace.save();
    await workspace.populate('owner', 'name email');
    await workspace.populate('members.user', 'name email');

    res.json({
      success: true,
      message: 'Workspace updated successfully',
      workspace
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete workspace (owner only)
exports.deleteWorkspace = async (req, res) => {
  try {
    const workspace = req.workspace;

    await Workspace.findByIdAndDelete(workspace._id);

    res.json({
      success: true,
      message: 'Workspace deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Invite member to workspace (admin only)
exports.inviteMember = async (req, res) => {
  try {
    const { email, role = 'member' } = req.body;
    const workspace = req.workspace;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found with this email' });
    }

    // Check if already a member
    const alreadyMember = workspace.members.some(
      m => m.user.toString() === user._id.toString()
    );

    if (alreadyMember) {
      return res.status(400).json({ message: 'User is already a member' });
    }

    // Add member
    workspace.members.push({
      user: user._id,
      role
    });

    await workspace.save();
    await workspace.populate('members.user', 'name email');

    res.json({
      success: true,
      message: `${user.name} added to workspace`,
      workspace
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove member from workspace (admin only)
exports.removeMember = async (req, res) => {
  try {
    const { memberId } = req.params;
    const workspace = req.workspace;

    // Cannot remove owner
    if (workspace.owner.toString() === memberId) {
      return res.status(400).json({ message: 'Cannot remove workspace owner' });
    }

    // Remove member
    workspace.members = workspace.members.filter(
      m => m.user.toString() !== memberId
    );

    await workspace.save();

    res.json({
      success: true,
      message: 'Member removed from workspace'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Leave workspace
exports.leaveWorkspace = async (req, res) => {
  try {
    const workspace = req.workspace;
    const userId = req.userId;

    // Owner cannot leave (must delete workspace or transfer ownership)
    if (workspace.owner.toString() === userId) {
      return res.status(400).json({ 
        message: 'Owner cannot leave workspace. Please delete the workspace or transfer ownership.' 
      });
    }

    // Remove user from members
    workspace.members = workspace.members.filter(
      m => m.user.toString() !== userId
    );

    await workspace.save();

    res.json({
      success: true,
      message: 'You have left the workspace'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
