const express = require("express");
const multer = require("multer");
const path = require("path");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const User = require("../models/user.model");
const router = express.Router();
const fs = require("fs");
const { sendEmail } = require('../services/email.service');
const { deleteImageFile } = require('../utils/fileUtils');

require("dotenv").config();

// Check if JWT secret is set
if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is not set in environment variables');
  process.exit(1);
}

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Get user profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-Password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

//Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/profilepic");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

//file upload middleware
const upload = multer({ storage: storage });

router.post("/add-user", upload.single("ImageURI"), async (req, res) => {
  try {
    const {
      UserName,
      Email,
      Password,
      Created,
      LastLogin,
      Role,
      Mobile,
      Address,
      ImageURI,
    } = req.body;
    console.log("Received Role:", Role); 
    //checking if any fields are empty
    if (!UserName || !Email || !Password || !Mobile || !Address) {
      return res
        .status(400)
        .json({
          status: "error",
          message: "All fields are required. Please complete the form.",
        });
    }

    try {
      // Checking if email is already registered
      const findUser = await User.findOne({ Email });
      if (findUser) {
        return res.status(400).json({
          status: "error",
          message: "Email is already in use, please try a different one!",
        });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(Password, 10);

      const creatUser = new User({
        UserName,
        Email,
        Password: hashedPassword,
        Created,
        LastLogin,
        Role: Role || "user",
        Mobile,
        Address,
        ImageURI: req.file ? `/profilepic/${req.file.filename}` : null,
        LastLogin: null,
      });

      await creatUser.save();

      // Send welcome email
      await sendEmail(Email, 'welcome', UserName);

      res
        .status(201)
        .json({
          status: "success",
          message: "The information has been registered"
        });
    } catch (error) {
      console.error("Error in user registration:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to register user"
      });
    }
  } catch (error) {
    console.error("Error in user registration:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to register user"
    });
  }
});

// Login route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt:', { email });

    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ 
        success: false,
        message: "Email and password are required" 
      });
    }

    // Find user by email
    const user = await User.findOne({ Email: email });
    console.log('User found:', user ? 'yes' : 'no');
    console.log('User details:', user ? { id: user._id, email: user.Email } : null);

    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: "Invalid email or password" 
      });
    }

    try {
      // Compare passwords
      const isPasswordValid = await bcrypt.compare(password, user.Password);
      console.log('Password valid:', isPasswordValid);

      if (!isPasswordValid) {
        return res.status(401).json({ 
          success: false,
          message: "Invalid email or password" 
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: user._id, email: user.Email, role: user.Role },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      console.log('Token generated successfully');

      // Update last login
      user.LastLogin = new Date();
      await user.save();
      console.log('Last login updated');

      // Return user data without sensitive information
      const userData = {
        id: user._id,
        email: user.Email,
        role: user.Role,
        userName: user.UserName,
        mobile: user.Mobile,
        address: user.Address,
        imageURI: user.ImageURI,
        lastLogin: user.LastLogin
      };

      res.json({
        success: true,
        token,
        user: userData
      });
    } catch (error) {
      console.error('Error during login:', error);
      res.status(500).json({ 
        success: false,
        message: "Internal server error during login" 
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      message: "Internal server error" 
    });
  }
});

//Fetch all Users
router.get("/all-user", async (req, res) => {
  try {
    const user = await User.find()
    res.status(202).json({ user })
    
  } catch (e) {
    res.status(404).json({
      status: "error",
      message: e.message,
    })
  }
})

//update user by ID (PUT)
router.put("/update-user/:id", verifyToken, upload.single("ImageURI"), async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found"
      });
    }

    // Delete old image if it exists and a new image is being uploaded
    if (user.ImageURI && req.file) {
      deleteImageFile(user.ImageURI, 'profilepic', 'user');
    }

    // Update user fields
    const { UserName, Email, Mobile, Address } = req.body;
    if (UserName) user.UserName = UserName;
    if (Email) user.Email = Email;
    if (Mobile) user.Mobile = Mobile;
    if (Address) user.Address = Address;
    if (req.file) user.ImageURI = `/profilepic/${req.file.filename}`;

    await user.save();

    // Return updated user data
    const updatedUser = {
      _id: user._id,
      UserName: user.UserName,
      Email: user.Email,
      Mobile: user.Mobile,
      Address: user.Address,
      Role: user.Role,
      ImageURI: user.ImageURI,
      Created: user.Created,
      LastLogin: user.LastLogin
    };

    res.json({
      status: "success",
      message: "Profile updated successfully",
      user: updatedUser
    });

  } catch (e) {
    console.error('Update user error:', e);
    res.status(500).json({
      status: "error",
      message: "Error updating profile",
      error: e.message
    });
  }
});

//delete user by ID (delete)
router.delete("/delete-user/:id", async (req, res) => {
  console.log("delete id..........",req.params.id)
  try{
    const deleteUser = await User.findByIdAndDelete(req.params.id)
    if (!deleteUser) {
      return res
        .status(404)
        .json({
          status: "error",
          message:"🕵️‍♂️ Can't find the User you're looking for.",
        })    
    }

    if (deleteUser.ImageURI) {
      deleteImageFile(deleteUser.ImageURI, 'profilepic', 'user');
    }

    res.json({
      status: "success",
      message:"🗑️ Poof! The user has been deleted."
    })

  } catch (e) {
    res.status(500).json({
      status: "error",
      message: "🛑 Error! The user refused to leave.", error: e.message
    });
  }
})

// Update last login
router.post('/update-last-login', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.LastLogin = new Date();
    await user.save();
    res.json({ success: true, message: 'Last login updated' });
  } catch (error) {
    console.error('Update last login error:', error);
    res.status(500).json({ message: 'Error updating last login' });
  }
});
const transporter = nodemailer.createTransport({
  service: 'gmail', // or another email service
  auth: {
    user: process.env.EMAIL_USER, // Your email address
    pass: process.env.EMAIL_PASS, // Your email password or App password
  },
});

router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ Email: email });
    if (!user) {
      return res.status(404).json({ message: 'User not found with this email' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
    const resetLink = `http://localhost:3000/reset-password/${token}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Request',
      html: `<p>You requested a password reset. Click the link below to reset your password:</p><a href="${resetLink}">${resetLink}</a>`,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error('Error sending email:', err); // Log the detailed error
        return res.status(500).json({ message: `Error sending email: ${err.message}` }); // Include the error message in the response
      }
      console.log('Email sent:', info.response);
      return res.status(200).json({ message: 'Reset link sent to email' });
    });
  } catch (error) {
    console.error('Forgot password error:', error); // Log the detailed error
    res.status(500).json({ message: 'Something went wrong on the server side' });
  }
});


router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  if (!newPassword) {
      return res.status(400).json({ status: "error", message: "New password is required" });
  }

  try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);

      if (!user) {
          return res.status(404).json({ status: "error", message: "User not found" });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.Password = hashedPassword;
      await user.save();

      res.status(200).json({ status: "success", message: "Password reset successfully" });
  } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ status: "error", message: "Invalid or expired token" });
  }
});


module.exports = router;
