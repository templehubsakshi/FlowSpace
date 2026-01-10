const Workspace=require('../models/Workspace');
//to ckech user is memeber of workspace 
exports.isMember=async(req,res,next)=>{
    try{
const {workspaceId}=req.params;
const userId =req.userId;//come from auth middleware

const workspace=await Workspace.findById(workspaceId);
if(!workspace){
    return res.status(404).json({message:'Workspace not found'})
}
//check if user is memebr 
const isMember=workspace.members.some(
member=>member.user.toString()===userId
);

//if is not memebr then not able to access workspace 

if(!isMember){
    return res.status(403).json({
        message:'Access denied .You are not member of this workspace '
    })
}
//attach workspace to request for next middelware 
 req.workspace=workspace;
    next();

    }
    catch(error){
res.status(500).json({message:error.message })
    }
}
//check is owner is admin or owner 
exports.isAdmin=async(req,res,next)=>{
    try{
        const workspace=req.workspace;//from ismemebr middleware
        const userId=req.userId;//from auth middleware

        const member=workspace.members.find(
            member=>member.user.toString()===userId
        );
        if(!member||(member.role!=='admin'&&member.role!=='owner')){
            return res.status(403).json({
                message:'Access denied. Admins privileges required'
        })
    }
    next();
}catch(error){
    res.status(500).json({message:error.message })
}
};
//check if user is owner of worksapce 

exports.isOwner = async (req, res, next) => {
  try {
    const { workspaceId } = req.params;
    const userId = req.userId;

    const workspace = await Workspace.findById(workspaceId);
    
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    // Check if user is member
    const isMember = workspace.members.some(
      member => member.user.toString() === userId
    );

    if (!isMember) {
      return res.status(403).json({ 
        message: 'Access denied. You are not a member of this workspace' 
      });
    }

    // Attach workspace to request for next middleware
    req.workspace = workspace;
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};