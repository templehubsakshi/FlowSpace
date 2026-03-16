// const Task=require('../models/Task');
// const Workspace=require('../models/Workspace');

// //Create A new V task 
// exports.createTask = async (req, res) => {
//   try {
//     const {
//       title,
//       description,
//       status = 'todo',
//       priority = 'medium',
//       workspaceId,
//       assignee,
//       dueDate,
//       tags
//     } = req.body;
//     const userId = req.userId;

//     // Validation
//     if (!title || !workspaceId) {
//       return res.status(400).json({ message: 'Title and workspace are required' });
//     }

//     // Verify workspace membership
//     const workspace = await Workspace.findById(workspaceId);
//     if (!workspace) {
//       return res.status(404).json({ message: 'Workspace not found' });
//     }

//     const isMember = workspace.members.some(m => m.user.toString() === userId);
//     if (!isMember) {
//       return res.status(403).json({ message: 'Not a member of this workspace' });
//     }

//     // Get highest order number - FIXED
//     const tasksInColumn = await Task.find({ workspace: workspaceId, status }).sort({ order: -1 }).limit(1);
//     const order = tasksInColumn.length > 0 && tasksInColumn[0].order != null 
//       ? tasksInColumn[0].order + 1 
//       : 0;

//     // Create task
//     const task = await Task.create({
//       title,
//       description,
//       status,
//       priority,
//       workspace: workspaceId,
//       assignee: assignee || undefined,
//       creator: userId,
//       dueDate: dueDate || undefined,
//       tags: tags || [],
//       order
//     });

//     await task.populate([
//       { path: 'creator', select: 'name email' },
//       { path: 'assignee', select: 'name email' }
//     ]);

//     res.status(201).json({
//       success: true,
//       message: 'Task created successfully',
//       task
//     });
//   } catch (error) {
//     console.error('Create task error:', error);
//     res.status(500).json({ message: error.message });
//   }
// };

// //Get all tasks for workspace
// exports.getWorkspaceTasks=async(req,res)=>{
//     try{
//         const {workspaceId}=req.params;
//         const userId=req.userId;//from auth middleware

//        const workspace = await Workspace.findById(workspaceId);
//     if (!workspace) {
//       return res.status(404).json({ message: 'Workspace not found' });
//     }
//     const isMember = workspace.members.some(member => member.user.toString() === userId);
//     if (!isMember) {
//       return res.status(403).json({ message: 'You are not a member of this workspace' });
//     }
//     const tasks=await Task.find({workspace:workspaceId})
//     .populate('creator', 'name email')
//     .populate('assignee', 'name email')
//     .populate('comments.user', 'name email')
//     .sort({ order: 1, createdAt: -1 });

//     //Group by tasks 
//     const groupedTasks={
//         todo:tasks.filter(t=>t.status==='todo'),
//         in_progress:tasks.filter(t=>t.status==='in-progress'),
//         done:tasks.filter(t=>t.status==='done')
//     };
//     res.json({
//         success:true,
//         tasks:groupedTasks
//     })
// }
// catch (error) {
//     console.error('Get tasks error:', error);
//     res.status(500).json({ message: error.message });
//   }
// };
// //get single task 
// exports.getTask=async(req,res)=>{
//     try{
//         const{ttaskId}=req.params;
//         const userId=req.userId;//from auth middleware

//         const task=await Task.findById(taskId)
//         .populate('creator', 'name email')
//       .populate('assignee', 'name email')
//       .populate('comments.user', 'name email');

//       if(!task){
//          return res.status(404).json({ message: 'Task not found' });
//     }
//     // Verify workspace membership
//     const workspace = await Workspace.findById(task.workspace);
//     const isMember = workspace.members.some(m => m.user.toString() === userId);
//     if (!isMember) {
//       return res.status(403).json({ message: 'Not authorized' });
//     }

//     res.json({
//       success: true,
//       task
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// //upadte rask 

// exports.updateTask=async(req,res)=>{
//     try{
//         const {taskId}=req.params;
//         const updateData=req.body;
//         const userId=req.userId;

//       const task = await Task.findById(taskId);
//     if (!task) {
//       return res.status(404).json({ message: 'Task not found' });
//     }

//     // Verify workspace membership
//     const workspace = await Workspace.findById(task.workspace);
//     const isMember = workspace.members.some(m => m.user.toString() === userId);
//     if (!isMember) {
//       return res.status(403).json({ message: 'Not authorized' });
//     }

//     // Update allowed fields
//     const allowedFields = ['title', 'description', 'status', 'priority', 'assignee', 'dueDate', 'tags'];
//     allowedFields.forEach(field => {
//       if (updates[field] !== undefined) {
//         task[field] = updates[field];
//       }
//     });

//     await task.save();
//     await task.populate([
//       { path: 'creator', select: 'name email' },
//       { path: 'assignee', select: 'name email' }
//     ]);

//     res.json({
//       success: true,
//       message: 'Task updated successfully',
//       task
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
// //delete task 
// exports.deleteTask = async (req, res) => {
//   try {
//     const { taskId } = req.params;
//     const userId = req.userId;

//     const task = await Task.findById(taskId);
//     if (!task) {
//       return res.status(404).json({ message: 'Task not found' });
//     }

//     // Verify workspace membership
//     const workspace = await Workspace.findById(task.workspace);
//     const isMember = workspace.members.some(m => m.user.toString() === userId);
//     if (!isMember) {
//       return res.status(403).json({ message: 'Not authorized' });
//     }

//     await Task.findByIdAndDelete(taskId);

//     res.json({
//       success: true,
//       message: 'Task deleted successfully'
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
// //move task(drag and drop)
// exports.moveTask=async(req,res)=>{
//   try{
//     const {taskId}=req.params;
//     const {newStatus,newOrder}=req.body;
//     const userId=req.userId;

//     const task = await Task.findById(taskId);
//     if (!task) {
//       return res.status(404).json({ message: 'Task not found' });
//     }

//     // Verify workspace membership
//     const workspace = await Workspace.findById(task.workspace);
//     const isMember = workspace.members.some(m => m.user.toString() === userId);
//     if (!isMember) {
//       return res.status(403).json({ message: 'Not authorized' });
//     }
//   const oldStatus = task.status;

//     // Update task
//     task.status = newStatus;
//     task.order = newOrder;
//     await task.save();

//     // Reorder other tasks in the same column
//     if (oldStatus !== newStatus) {
//       // Moved to different column
//       await Task.updateMany(
//         {
//           workspace: task.workspace,
//           status: newStatus,
//           _id: { $ne: taskId },
//           order: { $gte: newOrder }
//         },
//         { $inc: { order: 1 } }
//       );
//     }

//     await task.populate([
//       { path: 'creator', select: 'name email' },
//       { path: 'assignee', select: 'name email' }
//     ]);

//     res.json({
//       success: true,
//       message: 'Task moved successfully',
//       task
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
// //add comment to task 
// exports.addComment = async (req, res) => {
//   try {
//     const { taskId } = req.params;
//     const { text } = req.body;
//     const userId = req.userId;

//     if (!text || !text.trim()) {
//       return res.status(400).json({ message: 'Comment text is required' });
//     }

//     const task = await Task.findById(taskId);
//     if (!task) {
//       return res.status(404).json({ message: 'Task not found' });
//     }

//     // Verify workspace membership
//     const workspace = await Workspace.findById(task.workspace);
//     const isMember = workspace.members.some(m => m.user.toString() === userId);
//     if (!isMember) {
//       return res.status(403).json({ message: 'Not authorized' });
//     }

//     // Add comment
//     task.comments.push({
//       user: userId,
//       text
//     });

//     await task.save();
//     await task.populate('comments.user', 'name email');

//     res.json({
//       success: true,
//       message: 'Comment added',
//       comment: task.comments[task.comments.length - 1]
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
// //delete comment 
// exports.deleteComment = async (req, res) => {
//   try {
//     const { taskId, commentId } = req.params;
//     const userId = req.userId;

//     const task = await Task.findById(taskId);
//     if (!task) {
//       return res.status(404).json({ message: 'Task not found' });
//     }

//     const comment = task.comments.id(commentId);
//     if (!comment) {
//       return res.status(404).json({ message: 'Comment not found' });
//     }

//     // Only comment author or workspace admin can delete
//     const workspace = await Workspace.findById(task.workspace);
//     const member = workspace.members.find(m => m.user.toString() === userId);
    
//     if (comment.user.toString() !== userId && member.role !== 'admin' && member.role !== 'owner') {
//       return res.status(403).json({ message: 'Not authorized' });
//     }

//     task.comments.pull(commentId);
//     await task.save();

//     res.json({
//       success: true,
//       message: 'Comment deleted'
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
const Task = require('../models/Task');
const Workspace = require('../models/Workspace');
const { createNotification } = require('./notificationController');

// ================= CREATE TASK =================
exports.createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      status = 'todo',
      priority = 'medium',
      workspaceId,
      assignee,
      dueDate,
      tags
    } = req.body;

    const userId = req.userId;

    if (!title || !workspaceId) {
      return res.status(400).json({ message: 'Title and workspace are required' });
    }

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    const isMember = workspace.members.some(m => m.user.toString() === userId);
    if (!isMember) {
      return res.status(403).json({ message: 'Not a member of this workspace' });
    }

    const tasksInColumn = await Task.find({ workspace: workspaceId, status })
      .sort({ order: -1 })
      .limit(1);

    const order = tasksInColumn.length > 0 && tasksInColumn[0].order != null
      ? tasksInColumn[0].order + 1
      : 0;

    const task = await Task.create({
      title,
      description,
      status,
      priority,
      workspace: workspaceId,
      assignee: assignee || undefined,
      creator: userId,
      dueDate: dueDate || undefined,
      tags: tags || [],
      order
    });

    await task.populate([
      { path: 'creator', select: 'name email' },
      { path: 'assignee', select: 'name email' }
    ]);

    res.status(201).json({ success: true, message: 'Task created successfully', task });

  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ================= GET WORKSPACE TASKS =================
exports.getWorkspaceTasks = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const userId = req.userId;

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) return res.status(404).json({ message: 'Workspace not found' });

    const isMember = workspace.members.some(m => m.user.toString() === userId);
    if (!isMember) return res.status(403).json({ message: 'Not authorized' });

    const tasks = await Task.find({ workspace: workspaceId })
      .populate('creator', 'name email')
      .populate('assignee', 'name email')
      .populate('comments.user', 'name email')
      .sort({ order: 1, createdAt: -1 });

    const groupedTasks = {
      todo: tasks.filter(t => t.status === 'todo'),
      in_progress: tasks.filter(t => t.status === 'in_progress'),
      done: tasks.filter(t => t.status === 'done')
    };

    res.json({ success: true, tasks: groupedTasks });

  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ================= GET SINGLE TASK =================
exports.getTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.userId;

    const task = await Task.findById(taskId)
      .populate('creator', 'name email')
      .populate('assignee', 'name email')
      .populate('comments.user', 'name email');

    if (!task) return res.status(404).json({ message: 'Task not found' });

    const workspace = await Workspace.findById(task.workspace);
    const isMember = workspace.members.some(m => m.user.toString() === userId);
    if (!isMember) return res.status(403).json({ message: 'Not authorized' });

    res.json({ success: true, task });

  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ================= UPDATE TASK =================
exports.updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const updates = req.body;
    const userId = req.userId;

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const workspace = await Workspace.findById(task.workspace);
    const isMember = workspace.members.some(m => m.user.toString() === userId);
    if (!isMember) return res.status(403).json({ message: 'Not authorized' });

    const allowedFields = ['title', 'description', 'status', 'priority', 'assignee', 'dueDate', 'tags'];

    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        task[field] = updates[field];
      }
    });

    await task.save();
    await task.populate([
      { path: 'creator', select: 'name email' },
      { path: 'assignee', select: 'name email' }
    ]);

    res.json({ success: true, message: 'Task updated successfully', task });

  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ================= DELETE TASK =================
// exports.deleteTask = async (req, res) => {
//   try {
//     const { taskId } = req.params;
//     const userId = req.userId;

//     const task = await Task.findById(taskId);
//     if (!task) return res.status(404).json({ message: 'Task not found' });

//     const workspace = await Workspace.findById(task.workspace);
//     const isMember = workspace.members.some(m => m.user.toString() === userId);
//     if (!isMember) return res.status(403).json({ message: 'Not authorized' });

//     await Task.findByIdAndDelete(taskId);

//     res.json({ success: true, message: 'Task deleted successfully' });

//   } catch (error) {
//     console.error('Delete task error:', error);
//     res.status(500).json({ message: error.message });
//   }
// };
exports.deleteTask = async (req, res) => {
  // console.log("🔥 NEW DELETE FUNCTION HIT");

  try {
    const { taskId } = req.params;
    const userId = req.userId;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const workspace = await Workspace.findById(task.workspace);
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    // Find user in workspace
    const member = workspace.members.find(
      m => m.user.toString() === userId
    );

    if (!member) {
      return res.status(403).json({ message: 'Not a workspace member' });
    }
console.log("👤 USER ID:", userId);
console.log("🧑 TASK CREATOR:", task.creator?.toString());
console.log("🛡️ MEMBER ROLE:", member.role);

    // ✅ Permission rules
    const isCreator = task.creator?.toString() === userId;
    const isAdmin = ['admin', 'owner'].includes(member.role);

    if (!isCreator && !isAdmin) {
      return res.status(403).json({
        message: 'Only workspace owner, admin, or task creator can delete this task'
      });
    }

    await Task.findByIdAndDelete(taskId);

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });

  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: error.message });
  }
};




// ================= MOVE TASK =================
exports.moveTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { newStatus, newOrder } = req.body;
    const userId = req.userId;

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const workspace = await Workspace.findById(task.workspace);
    const isMember = workspace.members.some(m => m.user.toString() === userId);
    if (!isMember) return res.status(403).json({ message: 'Not authorized' });

    const oldStatus = task.status;

    task.status = newStatus;
    task.order = newOrder;
    await task.save();

    if (oldStatus !== newStatus) {
      await Task.updateMany(
        { workspace: task.workspace, status: newStatus, _id: { $ne: taskId }, order: { $gte: newOrder } },
        { $inc: { order: 1 } }
      );
    }

    await task.populate([
      { path: 'creator', select: 'name email' },
      { path: 'assignee', select: 'name email' }
    ]);

    res.json({ success: true, message: 'Task moved successfully', task });

  } catch (error) {
    console.error('Move task error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ================= ADD COMMENT =================
// ================= ADD COMMENT =================
exports.addComment = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { text, mentions = [] } = req.body;
    const userId = req.userId;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const workspace = await Workspace.findById(task.workspace);
    const isMember = workspace.members.some(m => m.user.toString() === userId);
    if (!isMember) return res.status(403).json({ message: 'Not authorized' });

    task.comments.push({ user: userId, text, mentions });
    await task.save();
    await task.populate('comments.user', 'name email');

    // Create notifications for mentions (use Promise.all for async operations)
    if (mentions && mentions.length > 0) {
      await Promise.all(
        mentions.map(mentionUserId =>
          createNotification({
            recipient: mentionUserId,
            sender: userId,
            workspace: task.workspace,
            task: task._id,
            type: 'TASK_MENTIONED',
          })
        )
      );
    }

    res.json({ 
      success: true, 
      message: 'Comment added', 
      comment: task.comments.at(-1) 
    });

  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ================= DELETE COMMENT =================
exports.deleteComment = async (req, res) => {
  try {
    const { taskId, commentId } = req.params;
    const userId = req.userId;

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const comment = task.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    const workspace = await Workspace.findById(task.workspace);
    const member = workspace.members.find(m => m.user.toString() === userId);

    if (comment.user.toString() !== userId && !['admin', 'owner'].includes(member.role)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    task.comments.pull(commentId);
    await task.save();

    res.json({ success: true, message: 'Comment deleted' });

  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ message: error.message });
  }
};


