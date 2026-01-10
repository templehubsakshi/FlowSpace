// “I keep password hashing in the model using pre('save') to ensure it is always hashed when created or updated. The comparePassword method is an instance method so any User instance can verify passwords. I also use select: false to prevent leaking passwords in queries. This keeps authentication secure and scalable.
const mongoose = require('mongoose');
const bcrypt= require('bcryptjs')

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
    },
    password:{
        type:String,
        required:true,
        select:false
    },
    cratedAt:{
        type:Date,
        default:Date.now
    }
})

//hash password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword= async function(password){
    return await bcrypt.compare(password,this.password);
}
module.exports= mongoose.model('User', userSchema);

// User Input -> Controller -> User Model Instance -> pre('save') hook
//       -> Check isModified('password') -> Hash password -> Save to DB