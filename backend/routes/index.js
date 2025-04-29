const express = require("express");
const router = express.Router();

// Importing routes
const userRoutes = require("./user.route"); // User-related routes
const productRoutes = require("./product.route"); // Product-related routes
const cartRoutes = require("./cart.route"); // Cart-related routes
const offerRoutes = require('./offer.route'); // Offers-related routes
const orderRoutes = require('./order.route'); // Order-related routes
const contactRoutes = require('./contact.route'); // Contact-related routes
const aboutRoutes = require('./about.route'); // About-related routes
const dashBoardRoutes = require('./dashBoard.route'); // user-count related routes
const expenseRoutes = require('./expense.route'); // Expense related routes
const inventoryRoutes = require('./inventory.route'); // Inventory related routes
const replyRoutes = require('./reply.route'); // Reply related routes
const newsletterRoutes = require('./newsletter.route'); // Newsletter related routes

// Importing auth and upload routes
const authRoutes = require('./user.Native'); // Authentication routes
const uploadRoutes = require('./upload.route'); // Upload-related routes

// Mount routes (NO `/api` here — it's added in server.js)
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/cart', cartRoutes);
router.use('/offers', offerRoutes);
router.use('/orders', orderRoutes);
router.use('/contact', contactRoutes);
router.use('/about', aboutRoutes);
router.use('/dashboard', dashBoardRoutes);
router.use('/expenses', expenseRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/replies', replyRoutes);
router.use('/newsletter', newsletterRoutes);
router.use('/auth', authRoutes); // Optional: prefix auth routes like `/api/auth/...`
router.use('/upload', uploadRoutes); // Upload endpoints now at `/api/upload/...`

// 404 handler for unmatched routes
router.use((req, res) => {
  res.status(404).send("Route not found in index.js");
});

module.exports = router;
