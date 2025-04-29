const express = require("express");
const router = express.Router();
const Reply = require("../models/reply.model");
const multer = require('multer');
const jwt = require("jsonwebtoken");
const upload = multer();
const { sendEmail } = require('../services/email.service');

//Add Reply details
router.post("/add-reply", upload.none(), async (req, res) => {
  try {
    const {
      UserName,
      Email,
      Subject,
      Message
    } = req.body;
    
    if (!UserName || !Email || !Subject || !Message) {
      return res.status(400).json({
        status: "error",
        message: "All fields are required. Please complete the form."
      });
    }

    const newReply = new Reply({
      UserName,
      Email,
      Subject,
      Message
    });

    // Generate Verification Token
    const verificationToken = jwt.sign({ email: Email }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    await newReply.save();

    // Send Verification Email using our email service
    const verificationLink = `http://localhost:5000/api/users/verify-email/${verificationToken}`;
    await sendEmail(Email, 'welcome', UserName);

    res.status(201).json({
      status: "success",
      message: "The reply has been registered successfully"
    });
  } catch (err) {
    console.error("Error adding reply:", err.message);
    res.status(500).json({
      status: "error",
      message: err.message
    });
  }
});

// Email Verification Route
router.get("/verify-email/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ email: decoded.email });

    if (!user) {
      return res.redirect(
        "http://localhost:5173/login?status=error&message=Invalid or expired token."
      );
    }

    user.status = "Active";
    user.verificationToken = null;
    await user.save();

    return res.redirect(
      "http://localhost:5173/login?status=success&message=Email verified successfully! You can now log in."
    );
  } catch (error) {
    return res.redirect(
      console.log(error),
      "http://localhost:5173/login?status=error&message=Verification failed or token expired."
    );
  }
});

//Send Reply to User
router.post("/send-reply", upload.none(), async (req, res) => {
  try {
    const { to, subject, message, userName } = req.body;

    if (!to || !subject || !message) {
      return res.status(400).json({
        status: "error",
        message: "All fields are required"
      });
    }

    // Find the original reply and update it with admin's response
    const originalSubject = subject.replace('Re: ', '');
    const originalReply = await Reply.findOne({ Email: to, Subject: originalSubject });
    
    if (!originalReply) {
      return res.status(404).json({
        status: "error",
        message: "Original message not found"
      });
    }

    // Update the reply with admin's response
    originalReply.Replied = message;
    originalReply.RepliedSubject = subject;
    await originalReply.save();

    // Use our email service to send the reply with the adminReply template
    await sendEmail(to, 'adminReply', {
      subject,
      userName,
      message
    });

    res.status(200).json({
      status: "success",
      message: "Reply sent successfully",
      data: {
        replied: originalReply.Replied,
        repliedSubject: originalReply.RepliedSubject
      }
    });
  } catch (error) {
    console.error("Error sending reply:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to send reply",
      error: error.message
    });
  }
});

//Fetch all replies
router.get("/all-replies", async (req, res) => {
  try {
    const replies = await Reply.find().sort({ createdAt: -1 });
    res.status(200).json(replies);
  } catch (e) {
    res.status(500).json({
      status: "error",
      message: e.message
    });
  }
});

//Delete Reply by ID
router.delete("/delete-reply/:id", async (req, res) => {
  try {
    const deleteReply = await Reply.findByIdAndDelete(req.params.id);
    if (!deleteReply) {
      return res.status(404).json({
        status: "error",
        message: "Reply not found"
      });
    }
    res.status(200).json({
      status: "success",
      message: "Reply deleted successfully"
    });
  } catch (e) {
    res.status(500).json({
      status: "error",
      message: "Error deleting reply",
      error: e.message
    });
  }
});

//Update Reply by ID
router.put("/update-reply/:id", async (req, res) => {
  try {
    const updateData = {
      ...req.body
    };

    const updatedReply = await Reply.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updatedReply) {
      return res.status(404).json({
        status: "error",
        message: "Reply not found"
      });
    }

    res.status(200).json({
      status: "success",
      message: "Reply updated successfully",
      data: updatedReply
    });
  } catch (e) {
    res.status(500).json({
      status: "error",
      message: "Error updating reply",
      error: e.message
    });
  }
});

// Test email route
router.post("/test-email", upload.none(), async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        status: "error",
        message: "Email is required"
      });
    }

    const result = await sendEmail(email, 'welcome', 'Test User');
    
    if (result.success) {
      res.status(200).json({
        status: "success",
        message: "Test email sent successfully",
        details: result
      });
    } else {
      res.status(500).json({
        status: "error",
        message: "Failed to send test email",
        error: result.error
      });
    }
  } catch (err) {
    console.error("Error sending test email:", err);
    res.status(500).json({
      status: "error",
      message: err.message
    });
  }
});

module.exports = router;
