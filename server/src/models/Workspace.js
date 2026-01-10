const mongoose= require('mongoose');

const workspaceSchema=new mongoose.Schema({
    name:{
        type:String,
        require:true,
        trim:true,
        maxlength:50
    },
    description:{
        type:String,
        maxlength:200
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    members:[{
        user:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'User',
            required:true
        },
        role:{
            type:String,
            enum:['owner','admin','member'],
            default:'member'
        },
        joinedAt:{
            type:Date,
            default:Date.now
        }
    }],
    createdAt:{
        type:Date,
        default:Date.now
    }
})
workspaceSchema.index({owner:1});
workspaceSchema.index({'members.user':1});

module.exports=mongoose.model('Workspace',workspaceSchema);