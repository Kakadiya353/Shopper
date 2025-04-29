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

      // Proceed with user registration if email is not found
    } catch (error) {
      console.error("Error checking user email:", error);
      return res.status(500).json({ status: "error", message: "Internal Server Error" });
    }

    const creatUser = new User({
      UserName,
      Email,
      Password,
      Created,
      LastLogin,
      Role: Role || "user",
      Mobile,
      Address,
      //   ImageURI: req.file ? req.file.filename : null,
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
router.put("/update-user/:id", upload.single("ImageURI"), async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "🕵️‍♂️ Can't find the User you're looking for."
      });
    }

    // Delete old image if it exists and a new image is being uploaded
    if (user.ImageURI && req.file) {
      deleteImageFile(user.ImageURI, 'profilepic', 'user');
    }

    const updateData = {
      ...req.body,
      ImageURI: req.file ? `/profilepic/${req.file.filename}` : user.ImageURI,
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, updateData, { new: true })

    res.json(updatedUser);

  } catch (e) {
    res.status(500).json({
      status: "error",
      message: "💾 Couldn't save your edits. Try again.",
      error: e.message,
    })
  }
})

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

module.exports = router;
