const express = require("express");
const multer = require("multer");
const Product = require("../models/product.model");
const path = require("path");
const fs = require("fs");
const router = express.Router();
const { deleteImageFile } = require('../utils/fileUtils');

require("dotenv").config();

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/products");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

// File upload middleware
const upload = multer({ storage: storage });

router.post("/add-product", upload.single("ImageURI"), async (req, res) => {
  try {
    console.log("Received Data : ", req.body);

    const { Name, ImageURI, Category, Price, Old_Price, Status } = req.body;

    if (!Name || !Category || !Price || !Old_Price || !Status) {
      return res.status(400).json({
        status: "error",
        message: "All fields are required. Please complete the form.",
      });
    }

    const creatProduct = new Product({
      Name,
      Price,
      Old_Price,
      Category,
      ImageURI: req.file ? `/products/${req.file.filename}` : "",
      Status: Status || "active",
    });

    await creatProduct.save();
    res.status(201).json({
      status: "success",
      message: "The information has been registered",
    });
  } catch (e) {
    console.log("product.route.js : file error : " + e.message);
    res.status(500).json({ status: "success", message: e.message });
  }
});

// fetch product details
router.get("/all-products", async (req, res) => {
  try {
    const product = await Product.find();
    res.status(200).json({ product });
  } catch (e) {
    res.status(500).json({
      status: "error",
      message: e.message,
    });
  }
});

// Delete Product by ID (DELETE)
router.delete("/delete-product/:id", async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return res
        .status(404)
        .json({
        status: "error",
        message: "🕵️‍♂️ Can't find the product you're looking for."
      });
    }

    // Step 1: Delete old image if it exists
    if (deletedProduct.ImageURI) {
      deleteImageFile(deletedProduct.ImageURI, 'products', 'product');
    }

    res.status(200).json({
      status: "success",
      message: "🗑️ Poof! The product has been deleted."
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "🛑 Error! The product refused to leave.",
      error: error.message
    });
  }
});

// Update Product by ID (PUT)
router.put("/update-product/:id", upload.single("ImageURI"), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        status: "error",
        message: "🕵️‍♂️ Can't find the product you're looking for."
      });
    }

    // Step 1: Delete old image if it exists and a new image is being uploaded
    if (product.ImageURI && req.file) {
      deleteImageFile(product.ImageURI, 'products', 'product');
    }

    // Step 2: Prepare update data
    const updateData = {
      ...req.body,
      ImageURI: req.file ? `/products/${req.file.filename}` : product.ImageURI, // Keep existing ImageURI if not provided
    };

    // Step 3: Save new data in DB
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });

    res.json(updatedProduct);
  } catch (e) {
    console.error("Error updating product:", e);
    res.status(500).json({
      status: "error",
      message: "💾 Couldn't save your edits. Try again.",
      error: e.message
    });
  }
});

// Toggle Product Status (PUT)
router.put("/update-status/:id", async (req, res) => {
  try {
    const { Status } = req.body;

    if (!["active", "inactive"].includes(Status)) {
      return res.status(400).json({
        status: "error",
        message: "😕  Hold up! That status doesn't exist."
      });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { Status },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({
        status: "error",
        message: "🕵️ We couldn't track down that product."
      });
    }

    res.json({
      status: "success",
      message: `🔁 Product is now marked as "${Status}".`, product: updatedProduct
    });
  } catch (error) {
    res
      .status(500)
      .json({
        status: "error",
        message: "🪛 Oops! Status didn't update as expected.",
        error: error.message
      });
  }
});


module.exports = router;
