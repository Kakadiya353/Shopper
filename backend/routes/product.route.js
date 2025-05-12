// routes/product.route.js

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

// Get all products (active only)
router.get("/", async (req, res) => {
  try {
    const products = await Product.find({ Status: "active" });
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Error fetching products" });
  }
});

// Get popular products
router.get("/popular", async (req, res) => {
  try {
    const products = await Product.find({ Status: "active" })
      .sort({ Price: -1 })
      .limit(8);
    res.json(products);
  } catch (error) {
    console.error("Error fetching popular products:", error);
    res.status(500).json({ message: "Error fetching popular products" });
  }
});


// Get new collections
router.get("/new", async (req, res) => {
  try {
    const products = await Product.find({ Status: "active" })
      .sort({ createdAt: -1 })
      .limit(8);
    res.json(products);
  } catch (error) {
    console.error("Error fetching new collections:", error);
    res.status(500).json({ message: "Error fetching new collections" });
  }
});

// Get products by category
router.get("/category/:category", async (req, res) => {
  try {
    const products = await Product.find({ 
      Category: req.params.category,
      Status: "active" 
    });
    res.json(products);
  } catch (error) {
    console.error("Error fetching category products:", error);
    res.status(500).json({ message: "Error fetching category products" });
  }
});

// Add new product
router.post("/add-product", upload.single("ImageURI"), async (req, res) => {
  try {
    const { Name, Category, Price, Old_Price, Status } = req.body;

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
      Status,
    });

    await creatProduct.save();
    res.status(201).json({
      status: "success",
      message: "The information has been registered",
    });
  } catch (e) {
    console.log("product.route.js : file error : " + e.message);
    res.status(500).json({ status: "error", message: e.message });
  }
});

// Get all products (including inactive)
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

// Delete product
router.delete("/delete-product/:id", async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return res.status(404).json({
        status: "error",
        message: "🕵️‍♂️ Can't find the product you're looking for.",
      });
    }

    if (deletedProduct.ImageURI) {
      deleteImageFile(deletedProduct.ImageURI, 'products', 'product');
    }

    res.status(200).json({
      status: "success",
      message: "🗑️ Poof! The product has been deleted.",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "🛑 Error! The product refused to leave.",
      error: error.message,
    });
  }
});

// Update product
router.put("/update-product/:id", upload.single("ImageURI"), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        status: "error",
        message: "🕵️‍♂️ Can't find the product you're looking for.",
      });
    }

    if (product.ImageURI && req.file) {
      deleteImageFile(product.ImageURI, 'products', 'product');
    }

    const updateData = {
      ...req.body,
      ImageURI: req.file ? `/products/${req.file.filename}` : product.ImageURI,
    };

    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });

    res.json(updatedProduct);
  } catch (e) {
    console.error("Error updating product:", e);
    res.status(500).json({
      status: "error",
      message: "💾 Couldn't save your edits. Try again.",
      error: e.message,
    });
  }
});

// Toggle product status
router.put("/update-status/:id", async (req, res) => {
  try {
    const { Status } = req.body;

    if (!["active", "inactive"].includes(Status)) {
      return res.status(400).json({
        status: "error",
        message: "😕  Hold up! That status doesn't exist.",
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
        message: "🕵️ We couldn't track down that product.",
      });
    }

    res.json({
      status: "success",
      message: `🔁 Product is now marked as "${Status}".`,
      product: updatedProduct,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "🪛 Oops! Status didn't update as expected.",
      error: error.message,
    });
  }
});

module.exports = router;
