const mongoose =require('mongoose');

const taskSchema=new mongoose.Schema({
    title:{
        type:String,
        required:true,
        trim:true,
        maxlength:200
    },
    description:{
        type:String,
        maxlength:2000
    },
    status:{
        type:String,
        enum:['todo', 'in_progress', 'done'],
        default:'todo'
    },
    priority:{
        type:String,
        enum:['low', 'medium', 'high','urgent'],
        default:'medium'
    },
    workspace:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Workspace',
        required:true
    },
    assignee:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'User',
    },
    creator:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    dueDate:{
        type:Date,
    },
    tags:[{
        type:String,
        trim:true,
    }],
    order:{
        type:Number,
        default:0
    },
    comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    text: {
      type: String,
      required: true,
      maxlength: 1000
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
attachments: [{
    name: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for performance
taskSchema.index({ workspace: 1, status: 1 });
taskSchema.index({ workspace: 1, assignee: 1 });
taskSchema.index({ workspace: 1, createdAt: -1 });

// Update timestamp on save
taskSchema.pre('save', function() {
  this.updatedAt = Date.now();

});

module.exports = mongoose.model('Task', taskSchema);