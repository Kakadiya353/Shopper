const express = require('express')
const Contact = require('../models/contact.model')
const router = express.Router()

// Add or Update contact information
router.post("/manage-contact", async (req, res) => {
    try {
        const {
            Email,
            Phone,
            Address,
            SocialMedia,
            CopyRight
        } = req.body;

        //checking if any fields are empty
        if(!Email || !Phone || !Address || !SocialMedia || !CopyRight) {
            return res
                .status(400)
                .json({
                    status: "error",
                    message: "All fields are required. Please complete the form.",
                });
        }

        // Check if contact information already exists
        const existingContact = await Contact.findOne();
        
        if (existingContact) {
            // Update existing contact
            const updatedContact = await Contact.findByIdAndUpdate(
                existingContact._id,
                {
                    Email,
                    Phone,
                    Address,
                    SocialMedia,
                    CopyRight
                },
                { new: true }
            );

            res
                .status(200)
                .json({
                    status: "success",
                    message: "Contact information updated successfully",
                    contact: updatedContact
                });
        } else {
            // Create new contact
            const createContact = new Contact({
                Email,
                Phone,
                Address,
                SocialMedia,
                CopyRight
            });

            await createContact.save();
            res
                .status(201)
                .json({
                    status: "success",
                    message: "Contact information has been registered",
                    contact: createContact
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

// Fetch all contact information
router.get("/all-contact", async (req, res) => {
    try {
        const contact = await Contact.find()
        res
            .status(200)
            .json({
                contact
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
