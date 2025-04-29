const express = require('express')
const multer = require('multer')
const Offer = require('../models/offer.model')
const router = express.Router()
const path = require("path");
const fs = require("fs");
const { deleteImageFile } = require('../utils/fileUtils');

require("dotenv").config();

// Ensure the upload directory exists
const uploadDir = path.join(__dirname, "..", "public", "Offers_Images");
if (!fs.existsSync(uploadDir)) {
    console.log(`Creating upload directory: ${uploadDir}`);
    fs.mkdirSync(uploadDir, { recursive: true });
}

//multer storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    },
})

//file upload middleware
const upload = multer({ storage: storage })

router.post("/add-offer", upload.single("ImageURI"), async (req, res) => {
    try {
        const {
            Title,
            Discount,
            MinDiscount,
            MaxDiscount,
            Status,
            Offer_Discription,
            ImageURI,
        } = req.body;

        //checking if any fields are empty
        if(!Title||
            !Discount||
            !MinDiscount||
            !MaxDiscount||
            !Status||
            !Offer_Discription
            )
        {
            return res
        .status(400)
        .json({
          status: "error",
          message: "All fields are required. Please complete the form.",
        });
            
        }
        
        const creatOffer = new Offer({
            Title,
            Discount,
            MinDiscount,
            MaxDiscount,
            Status:Status?'active':'inactive',
            Offer_Discription,
            ImageURI: req.file?`/Offers_Images/${req.file.filename}`:"",
        })

        const savedOffer = await creatOffer.save();
        
        res
      .status(201)
      .json({
        status: "success",
        message: "The information has been registered",
        offer: savedOffer
      });
    } catch (e) {
        console.log(e)
        res.status(500).json({status:"error",message:"Action unsuccessful — please retry."})
    }
})

//fetch Offer details
router.get("/all-offer", async (req, res) => {
    try {
        const offer = await Offer.find()

        res
            .status(200)
            .json({
            offer
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

//Delete Offer by ID
router.delete("/delete-offer/:id", async (req, res) => {
    try {
        const deleteOffer = await Offer.findByIdAndDelete(req.params.id)
        if (!deleteOffer) {
            return res 
                .status(404)
                .json({
                    status: "error",
                    message:"🕵️‍♂️ Can't find the Offer you're looking for."
            })
        }

        if (deleteOffer.ImageURI) {
            deleteImageFile(deleteOffer.ImageURI, 'Offers_Images', 'offer');
        }

        res
            .status(200)
            .json({
                status: "success",
                message:"🗑️ Poof! The Offer has been deleted."
        })

    } catch (e) {
        console.error("🔥 DELETE ERROR:", e);
        res
            .status(500)
            .json({
                status: "error",
                message: "🛑 Error! The Offer refused to leave.",
                error: e.message
        })
    }
})

//update Offer by ID (PUT)
router.put("/update-offer/:id", upload.single("ImageURI"), async (req, res) => {
    try {
        console.log("Update offer request received for ID:", req.params.id);
        console.log("Request body:", req.body);
        console.log("File:", req.file ? `Filename: ${req.file.filename}, Path: ${req.file.path}` : "No file uploaded");
        
        const offer = await Offer.findById(req.params.id);
        if (!offer) {
            return res.status(404).json({
                status: "error",
                message: "🕵️‍♂️ Can't find the Offer you're looking for."
            });
        }
        
        console.log("Found offer:", offer);

        // Check if we should keep the existing image
        const keepExistingImage = req.body.keepExistingImage === "true";
        console.log("Keep existing image:", keepExistingImage);
        
        // Delete old image if it exists and a new image is being uploaded
        if (offer.ImageURI && req.file && !keepExistingImage) {
            console.log("Deleting old image:", offer.ImageURI);
            try {
                deleteImageFile(offer.ImageURI, 'Offers_Images', 'offer');
            } catch (deleteError) {
                console.error("Error deleting old image:", deleteError);
                // Continue with the update even if image deletion fails
            }
        }

        // Prepare update data
        const updateData = {
            Title: req.body.Title,
            Discount: req.body.Discount,
            MinDiscount: req.body.MinDiscount,
            MaxDiscount: req.body.MaxDiscount,
            Status: req.body.Status,
            Offer_Discription: req.body.Offer_Discription,
        };
        
        // Handle image URI
        if (req.file) {
            // Use the correct path format for the database
            updateData.ImageURI = `/Offers_Images/${req.file.filename}`;
            console.log("New image path:", updateData.ImageURI);
        } else if (keepExistingImage) {
            updateData.ImageURI = offer.ImageURI;
            console.log("Keeping existing image:", updateData.ImageURI);
        }
        
        console.log("Updating offer with data:", updateData);

        const updatedOffer = await Offer.findByIdAndUpdate(
            req.params.id, 
            updateData, 
            { new: true }
        );
        
        console.log("Offer updated successfully:", updatedOffer);
        
        res.json({
            status: "success",
            message: "Offer updated successfully",
            offer: updatedOffer
        });
    } catch (e) {
        console.error("Error updating offer:", e);
        res.status(500).json({
            status: "error",
            message: "💾 Couldn't save your edits. Try again.",
            error: e.message
        });
    }
})

//Toggle Offer status (PUT)
router.put("/update-status/:id", async (req, res) => {
    try {
        const { Status } = req.body;

        if (!["active", "inactive"].includes(Status))  {
            return res 
                .status(400)
                .json({
                    status: "error",
                    message:"😕  Hold up! That status doesn't exist."
            })
        }

        const updatedOffer = await Offer.findByIdAndUpdate(
            req.params.id,
            { Status },
            {new:true}
        )

        if (!updatedOffer) {
            return res
                .status(404)
                .json({
                status: "error",
                message: "🕵️ We couldn't track down that Offer."
              });
        }

        res
            .json({
            status: "success",
            message: `🔁 Offer is now marked as "${Status}".`,
            offer: updatedOffer
        });
        
    } catch (e) {
        res
        .status(500)
        .json({
          status: "error",
          message: "🪛 Oops! Status didn't update as expected.",
          error: error.message
        });
    }
})

module.exports = router;