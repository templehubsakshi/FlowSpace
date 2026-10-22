// "I keep password hashing in the model using pre('save') to ensure it is always hashed when
// created or updated. comparePassword is an instance method so any User instance can verify
// passwords. select: false on password prevents leaking it in normal queries."
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  // FIX: was misspelled `cratedAt`, so `user.createdAt` was always undefined
  // (signup/getMe returned createdAt: undefined).
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
