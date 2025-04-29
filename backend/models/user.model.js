const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  UserName: {
    type: String,
    required: [true, 'Username is required'],
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long']
  },
  Email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  Password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  Created: {
    type: Date,
    default: Date.now
  },
  LastLogin: {
    type: Date,
    default: null
  },
  Role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  Mobile: {
    type: String,
    required: true,
    match: [/^\d{10}$/, 'Please enter a valid 10-digit mobile number'], // <== This is the source of the error
  },
  Address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true
  },
  ImageURI: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Add index for faster queries
UserSchema.index({ Email: 1 });
UserSchema.index({ UserName: 1 });

module.exports = mongoose.model("User", UserSchema);
