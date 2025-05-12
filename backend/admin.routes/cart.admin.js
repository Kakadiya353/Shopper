const express = require("express");
const multer = require("multer");
const CartModel = require("../models/cart.model");
const { route } = require("./product.admin.cjs");
const router = express.Router();

require("dotenv").config();

const upload = multer(); // this enables parsing of multipart/form-data

router.post("/add-cart", upload.none(), async (req, res) => {
  try {
    console.log("Received Data:", req.body);

    const { ProductName, Category, Price, Email, Quantity, Total } = req.body;

    if (!ProductName || !Category || !Price || !Email || !Quantity || !Total) {
      return res.status(400).json({
        status: "error",
        message: "All fields are required. Please complete the form.",
      });
    }

    const creatCart = new CartModel({
      ProductName,
      Category,
      Price,
      Email,
      Quantity,
      Total,
    });

    await creatCart.save();
    res
      .status(201)
      .json({
        status: "success",
        message: "The information has been registered"
      });
  } catch (e) {
    console.log("Product.route.js : file error : " + e.message);
    res.status(500).json({status: "success", message: err.message });
  }
});

//all cart details
router.get("/all-cart", async (req, res) => {
  try {
    const cart = await CartModel.find();
    res.status(200).json({ cart })
  } catch (e) {
    res.status(500).json({
      status: "error",
      message: e.message,
    })
  }
});

//Delete cart details by ID
router.delete("/delete-cart/:id", async (req, res) => {
  try {
    const deleteCart = await CartModel.findByIdAndDelete(req.params.id)
    if (!deleteCart) {
      return res.status(404).json({
        status: "error",
        message:"🕵️‍♂️ Can’t find the cart you’re looking for."
      })
    }

    res.status(200).json({
      status: "success",
      message:"🗑️ Poof! The cart has been deleted."
    })
  } catch (e) {
    res.status(500).json({
      status: "error",
      message:"🛑 Error! The cart refused to leave."
    })
  }
})

//Update Cart by ID
router.put("/update-cart/:id", async (req, res) => {
  try {
    const cart = await CartModel.findById(req.params.id)

    if (!cart) {
      return res.status(404).json({
        status: "error",
        message: "🚫 Cart not found. Please check the ID and try again."
      });
    }

    // Extract form data from the request body
    const { ProductName, Category, Price, Email, Quantity, Total } = req.body;

    // Prepare the data to update the cart
    const updateData = {
      ProductName,
      Category,
      Price,
      Email,
      Quantity,
      Total,
    };

    // Update the cart document
    const updatedCart = await CartModel.findByIdAndUpdate(req.params.id, updateData, { new: true });

    // Return the updated cart data
    res.json(updatedCart);
  } catch (e) {
    res.status(500).json({
      status: "error",
      message: "💾 Couldn’t save your edits. Try again.",
      error: e.message
    })
  }
})


module.exports = router;
