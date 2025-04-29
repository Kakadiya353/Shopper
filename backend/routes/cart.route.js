const express = require("express");
const CartModel = require("../models/cart.model");
const OfferModel = require("../models/offer.model");
const Order = require("../models/order.model");
const jwt = require("jsonwebtoken");
const router = express.Router();
require("dotenv").config();
const multer = require('multer')
const upload = multer();
const axios = require('axios')


router.post("/add-order", async (req, res) => {
  try {
    console.log("Received body:", req.body); // Log incoming body

    const {
      Products,
      Email,
      DeliveryAddress,
      OrderDateTime,
      TotalAmount,
      OfferName,
      DiscountAmount,
      ActualAmount,
    } = req.body;

    // Validate required fields
    if (
      !Products || !Products.length ||
      Email == null ||
      DeliveryAddress == null ||
      OrderDateTime == null ||
      TotalAmount == null ||
      DiscountAmount == null ||
      ActualAmount == null
    )
     {
      console.log("Validation failed: Missing fields.");
      return res.status(400).json({
        status: "error",
        message: "All fields are required."
      });
    }

    // Prepare new order
    const newOrder = new Order({
      Email,
      DeliveryAddress,
      OrderDateTime,
      TotalAmount,
      OfferName:OfferName || "No Offer",
      DiscountAmount,
      ActualAmount,
      Products: Products.map(item => ({
        ProductID: item.ProductID,
        Quantity: item.Quantity,
        Total: item.Total
      }))
    });

    // Save to DB
    await newOrder.save();
    console.log("Order saved successfully.");
    console.log('--------------------',req.body.Email)

    const cartResponse = await axios.delete(`http://localhost:5000/api/cart/clear?email=${Email}`);
    
    // Check cart API Response
    if (cartResponse.data.status === 'success') {
      // If cart remove is successful, return the order confirmation
      return res.status(200).json({
        status: "success",
      message: "Order placed successfully, and cart cleared."});
    } else {
      // If cart fails, send error response
      return res.status(400).json({
        status: "error",
        message: 'Cart clearing failed, please try again.'
      });
    }

  } catch (err) {
    console.error("Error placing order:", err);
    res.status(500).json({
      status: "error",
      message: "An error occurred while placing the order. Please try again later."
    });
  }
});

router.delete('/clear', async (req, res) => {
  const email = req.query.email; // Retrieve email from query parameters

  if (!email) {
    return res.status(400).json({ message: 'Email is required.' });
  }

  try {
    console.log(`Clearing cart for email: ${email}`); // Add a log to verify the email being passed
    
    // Delete cart items for the given email
    const result = await CartModel.deleteMany({ Email: email });
    
    console.log(`Deleted ${result.deletedCount} cart items.`); // Log the number of items deleted

    if (result.deletedCount > 0) {
      return res.status(200).json({ status: 'success', message: 'Cart cleared' });
    } else {
      return res.status(404).json({ status: 'error', message: 'No items found in the cart.' });
    }
  } catch (error) {
    console.error('Clear Cart Error:', error);
    res.status(500).json({ status: 'error', message: 'Error clearing cart' });
  }
});






// Verify JWT middleware
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // decoded contains email if you added it during login token generation
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};



// ✅ Get cart items (protected route)
router.get('/', verifyToken, async (req, res) => {
  try {
    const email = req.user.email;

    const cartItems = await CartModel.find({ Email: email });

    res.status(200).json(cartItems);
  } catch (error) {
    console.error('Fetch Cart Error:', error);
    res.status(500).json({ message: 'Error fetching cart' });
  }
});

// ✅ Get cart items (protected route)
router.get('/offer', verifyToken, async (req, res) => {
  try {
    
    const offerItem = await OfferModel.find({ Status: 'active' });

    res.status(200).json(offerItem);
  } catch (error) {
    console.error('Fetch Cart Error:', error);
    res.status(500).json({ message: 'Error fetching cart' });
  }
});

// ✅ Update quantity
router.post('/update-quantity', async (req, res) => {
  try {
    const { productName, quantity, email } = req.body;

    const cartItem = await CartModel.findOne({ ProductName: productName, Email: email });
    if (!cartItem) return res.status(404).json({ message: 'Cart item not found' });

    cartItem.Quantity = quantity;
    cartItem.Total = quantity * cartItem.Price;
    await cartItem.save();

    res.status(200).json({
      productName: cartItem.ProductName,
      quantity: cartItem.Quantity,
      price: cartItem.Price,
      totalPrice: cartItem.Total,
    });
  } catch (error) {
    console.error('Update Quantity Error:', error);
    res.status(500).json({ message: 'Error updating quantity' });
  }
});

// ✅ Remove item
router.delete('/:productName', verifyToken, async (req, res) => {
  try {
    const { productName } = req.params;
    const email = req.user.email;

    const deletedItem = await CartModel.findOneAndDelete({ ProductName: productName, Email: email });

    if (!deletedItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    res.json({ message: 'Item removed successfully' });
  } catch (error) {
    console.error('Remove Cart Item Error:', error);
    res.status(500).json({ message: 'Failed to remove cart item' });
  }
});

// ✅ Add item to cart
router.post('/add', async (req, res) => {
  try {
    const { ProductName, Category, Price, Email, Quantity, Total } = req.body;

    if (!ProductName || !Category || !Price || !Email || !Quantity || !Total) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const existingItem = await CartModel.findOne({ ProductName, Email });

    if (existingItem) {
      existingItem.Quantity += Quantity;
      existingItem.Total += Total;
      await existingItem.save();
      return res.status(200).json({ message: 'Cart item updated', item: existingItem });
    }

    const newItem = new CartModel({ ProductName, Category, Price, Email, Quantity, Total });
    await newItem.save();

    res.status(201).json({ message: 'Item added to cart', item: newItem });

  } catch (error) {
    console.error('Add Cart Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Cart count route
router.get('/cart-count', verifyToken, async (req, res) => {
  try {
    const email = req.user.email;
    const itemCount = await CartModel.countDocuments({ Email: email });
    res.status(200).json({ itemCount });
  } catch (error) {
    console.error('Cart count error:', error);
    res.status(500).json({ message: 'Error getting cart count' });
  }
});


module.exports = router;
