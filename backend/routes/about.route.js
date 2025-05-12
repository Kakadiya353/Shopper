const express = require('express')
const About = require('../models/about.model')
const router = express.Router()

// Add or Update about information
router.post("/manage-about", async (req, res) => {
    try {
        const {
            companyName,
            mission,
            vision,
            values,
            copyright
        } = req.body;

        //checking if any fields are empty
        if(!companyName || !mission || !vision || !values || !copyright) {
            return res
                .status(400)
                .json({
                    status: "error",
                    message: "All fields are required. Please complete the form.",
                });
        }

        // Check if about information already exists
        const existingAbout = await About.findOne();
        
        if (existingAbout) {
            // Update existing about
            const updatedAbout = await About.findByIdAndUpdate(
                existingAbout._id,
                {
                    companyName,
                    mission,
                    vision,
                    values,
                    copyright
                },
                { new: true }
            );

            res
                .status(200)
                .json({
                    status: "success",
                    message: "About information updated successfully",
                    about: updatedAbout
                });
        } else {
            // Create new about
            const createAbout = new About({
                companyName,
                mission,
                vision,
                values,
                copyright
            });

            await createAbout.save();
            res
                .status(201)
                .json({
                    status: "success",
                    message: "About information has been registered",
                    about: createAbout
                });
        }
    } catch (e) {
        console.log(e)
        res.status(500).json({
            status: "error",
            message: "Action unsuccessful — please retry.",
            error: e.message
        })
    }
})

// Fetch all about information
router.get("/all-about", async (req, res) => {
    try {
        const about = await About.find()
        res
            .status(200)
            .json({
                about
            })
    } catch (e) {
        res
            .status(500)
            .json({
                status: "error",
                message: e.message,
            });
    }
})

module.exports = router; 