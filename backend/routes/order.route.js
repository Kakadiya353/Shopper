const express = require("express");
const router = express.Router();
const Order = require("../models/order.model");
const multer = require('multer')
const upload = multer();
router.get("/", async (req, res) => {
  try {
    const { email } = req.query;
    let query = {};
    if (email) {
      query.UserName = email; // or `UserEmail` if you have that field
    }

    const orders = await Order.find(query).sort({ OrderDateTime: -1 });
    res.status(200).json(orders);
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post('/orders', async (req, res) => {
  const { email } = req.body;

  try {
      const cartItems = await Cart.find({ UserEmail: email });
      if (!cartItems.length) return res.status(400).json({ message: "Cart is empty" });

      const newOrder = new Order({
          UserEmail: email,
          Items: cartItems,
          OrderDate: new Date(),
      });

      await newOrder.save();
      await Cart.deleteMany({ UserEmail: email }); // Clear cart

      res.status(200).json({ message: "Order placed successfully" });
  } catch (error) {
      res.status(500).json({ message: "Checkout failed", error });
  }
});

//Add Oder details
router.post("/add-order",upload.none(), async (req, res) => {

  try {
    const {
      ProductID,
      Quantity,
      UserName,
      DeliveryAddress,
      OrderDateTime,
      TotalAmount,
      OfferName,
      DiscountAmount,
      ActualAmount,
    } = req.body;
    
    if (
      !ProductID ||
      !Quantity ||
      !UserName ||
      !DeliveryAddress ||
      !TotalAmount ||
      !ActualAmount ||
      !OrderDateTime ||
      !OfferName ||
      !DiscountAmount
    ) {
      return res
        .status(400)
        .json({
          status: "error",
          message: "All fields are required. Please complete the form.",
        });
    }
    

    const newOrder = new Order({
      ProductID,
      Quantity,
      UserName,
      DeliveryAddress,
      TotalAmount,
      OfferName,
      DiscountAmount,
      ActualAmount,
    });

    await newOrder.save();
    res
      .status(201)
      .json({
        status: "success",
        message: "The information has been registered"
      });
  } catch (err) {
    console.error("Error placing order:", err.message);
    res.status(500).json({status: "success", message: err.message });
  }
});

//fetch Oder details
router.get("/all-order", async (req, res) => {
  try {
    const order = await Order.find()

    res
      .status(200)
      .json({ order })
    
  } catch (e) {
    res
      .status(500)
      .json({
      status: "error",
      message: e.message,
    });
  }
})

//Delete Oder by ID (delete)
router.delete("/delete-order/:id", async (req, res) => {
  try {
    const deleteOrder = await Order.findByIdAndDelete(req.params.id)
    if (!deleteOrder) {
      return res
        .status(404)
        .json({
        status: "error",
        message: "🕵️‍♂️ Can't find the Order you're looking for."
      })
    }
    res
      .status(200)
      .json({
        status: "success",
        message:"🗑️ Poof! The Order has been deleted."
    })
  } catch (e) {
    res
      .status(500)
      .json({
        status: "error",
        message: "🛑 Error! The order refused to leave.",
        error: error.message
    })
  }
})

//Update Order by ID (PUT)
router.put("/update-order/:id", async (req, res) => {
  try {
    const updateData = {
      ...req.body,
    }

    const updatedOrder = await Order.findByIdAndUpdate(req.params.id, updateData, { new: true })
    
    res.json(updatedOrder);
  } catch (e) {
    res 
      .status(500)
      .json({
        status: "error",
        message: "💾 Couldn't save your edits. Try again.",
        error: e.message
    })
  }
})

//Get total orders and amount
router.get("/total-orders", async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalAmount = await Order.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: "$TotalAmount" }
        }
      }
    ]);

    res.status(200).json({
      status: "success",
      total: totalAmount[0]?.total || 0,
      count: totalOrders
    });
  } catch (e) {
    console.error("Error fetching total orders:", e);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch total orders",
      error: e.message
    });
  }
});

module.exports = router;
