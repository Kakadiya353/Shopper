const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const router = express.Router();

require("dotenv").config();

// Ensure the upload directory exists
const uploadDir = path.join(__dirname, "..", "public", "profile_pics");
if (!fs.existsSync(uploadDir)) {
    console.log(`Creating upload directory: ${uploadDir}`);
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    },
});

// File upload middleware
const upload = multer({ storage: storage });

// Upload profile picture
router.post("/upload", upload.single("image"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                status: "error",
                message: "No file uploaded",
            });
        }

        const imageUrl = `/profile_pics/${req.file.filename}`;
        
        res.status(200).json({
            status: "success",
            message: "Image uploaded successfully",
            url: imageUrl
        });
    } catch (error) {
        console.error("Error uploading image:", error);
        res.status(500).json({
            status: "error",
            message: "Error uploading image"
        });
    }
});

module.exports = router; 