const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/user.model');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../public/profilepic');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

// Register endpoint
router.post('/register', upload.single('profileImage'), async (req, res) => {
  try {
    const { UserName, Email, Password, Mobile, Address, Role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ Email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(Password, salt);

    // Create image URI if file was uploaded
    let ImageURI = null;
    if (req.file) {
      ImageURI = `/public/profilepic/${req.file.filename}`;
    }

    // Create new user
    const newUser = new User({
      UserName,
      Email,
      Password: hashedPassword,
      Mobile,
      Address,
      Role: Role || 'user',
      ImageURI
    });

    // Save user to database
    await newUser.save();

    // Create JWT token
    const token = jwt.sign(
      { userId: newUser._id, role: newUser.Role },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1d' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: newUser._id,
        UserName: newUser.UserName,
        Email: newUser.Email,
        Role: newUser.Role,
        ImageURI: newUser.ImageURI
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { Email, Password } = req.body;

    // Check if user exists
    const user = await User.findOne({ Email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(Password, user.Password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Update last login time
    user.LastLogin = Date.now();
    await user.save();

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.Role },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1d' }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        UserName: user.UserName,
        Email: user.Email,
        Role: user.Role,
        ImageURI: user.ImageURI
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
});

// Admin login endpoint (specific for admin panel)
router.post('/admin/login', async (req, res) => {
  try {
    const { Email, Password } = req.body;

    // Check if user exists and is an admin
    const user = await User.findOne({ Email, Role: 'admin' });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials or insufficient privileges' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(Password, user.Password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Update last login time
    user.LastLogin = Date.now();
    await user.save();

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.Role },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1d' }
    );

    res.status(200).json({
      success: true,
      message: 'Admin login successful',
      token,
      user: {
        id: user._id,
        UserName: user.UserName,
        Email: user.Email,
        Role: user.Role,
        ImageURI: user.ImageURI
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Server error during admin login', error: error.message });
  }
});

// Admin register endpoint (specific for admin panel)
router.post('/admin/register', upload.single('profileImage'), async (req, res) => {
  try {
    const { UserName, Email, Password, Mobile, Address } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ Email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(Password, salt);

    // Create image URI if file was uploaded
    let ImageURI = null;
    if (req.file) {
      ImageURI = `/public/profilepic/${req.file.filename}`;
    }

    // Create new admin user
    const newUser = new User({
      UserName,
      Email,
      Password: hashedPassword,
      Mobile,
      Address,
      Role: 'admin', // Force role to be admin
      ImageURI
    });

    // Save user to database
    await newUser.save();

    // Create JWT token
    const token = jwt.sign(
      { userId: newUser._id, role: newUser.Role },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1d' }
    );

    res.status(201).json({
      success: true,
      message: 'Admin registered successfully',
      token,
      user: {
        id: newUser._id,
        UserName: newUser.UserName,
        Email: newUser.Email,
        Role: newUser.Role,
        ImageURI: newUser.ImageURI
      }
    });
  } catch (error) {
    console.error('Admin registration error:', error);
    res.status(500).json({ message: 'Server error during admin registration', error: error.message });
  }
});

module.exports = router;
