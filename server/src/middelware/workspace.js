// const Workspace=require('../models/Workspace');
// //to ckech user is memeber of workspace 
// exports.isMember=async(req,res,next)=>{
//     try{
// const {workspaceId}=req.params;
// const userId =req.userId;//come from auth middleware

// const workspace=await Workspace.findById(workspaceId);
// if(!workspace){
//     return res.status(404).json({message:'Workspace not found'})
// }
// //check if user is memebr 
// const isMember=workspace.members.some(
// member=>member.user.toString()===userId
// );

// //if is not memebr then not able to access workspace 

// if(!isMember){
//     return res.status(403).json({
//         message:'Access denied .You are not member of this workspace '
//     })
// }
// //attach workspace to request for next middelware 
//  req.workspace=workspace;
//     next();

//     }
//     catch(error){
// res.status(500).json({message:error.message })
//     }
// }
// //check is owner is admin or owner 
// exports.isAdmin=async(req,res,next)=>{
//     try{
//         const workspace=req.workspace;//from ismemebr middleware
//         const userId=req.userId;//from auth middleware

//         const member=workspace.members.find(
//             member=>member.user.toString()===userId
//         );
//         if(!member||(member.role!=='admin'&&member.role!=='owner')){
//             return res.status(403).json({
//                 message:'Access denied. Admins privileges required'
//         })
//     }
//     next();
// }catch(error){
//     res.status(500).json({message:error.message })
// }
// };
// //check if user is owner of worksapce 

// exports.isOwner = async (req, res, next) => {
//   try {
//     const { workspaceId } = req.params;
//     const userId = req.userId;

//     const workspace = await Workspace.findById(workspaceId);
    
//     if (!workspace) {
//       return res.status(404).json({ message: 'Workspace not found' });
//     }

//     // Check if user is member
//     const isMember = workspace.members.some(
//       member => member.user.toString() === userId
//     );

//     if (!isMember) {
//       return res.status(403).json({ 
//         message: 'Access denied. You are not a member of this workspace' 
//       });
//     }

//     // Attach workspace to request for next middleware
//     req.workspace = workspace;
//     next();
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
const Workspace = require('../models/Workspace');

// ── Load workspace and attach to req ───────────────────────────────────────
exports.loadWorkspace = async (req, res, next) => {
  try {
    const workspaceId = req.params.workspaceId || req.body.workspaceId;
    if (!workspaceId) return res.status(400).json({ message: 'Workspace ID required' });

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) return res.status(404).json({ message: 'Workspace not found' });

    req.workspace = workspace;
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
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
    res.status(500).json({ message: error.message });
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
    res.status(500).json({ message: error.message });
  }
};

// ── Must be owner ───────────────────────────────────────────────────────────
// ✅ FIX: Previously this only checked membership, not actual ownership.
//    Now correctly checks workspace.owner against req.userId.
exports.isOwner = async (req, res, next) => {
  try {
    const workspace = req.workspace;
    const userId = req.userId;

    // Compare owner field (ObjectId) with authenticated user
    if (workspace.owner.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Only the workspace owner can perform this action' });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};