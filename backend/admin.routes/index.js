const express = require("express");
const router = express.Router();

//importing routes file
const userAdminRoutes = require("./user.admin"); // User-related routes
console.log("userAdminRoutes:", userAdminRoutes);

//importing routes file
const productAdminRoutes = require("./product.admin.cjs"); // Product-related routes
console.log("productAdminRoutes:", productAdminRoutes);

//importing routes file
const cartAdminRoutes = require("./cart.admin"); // Cart-related routes
console.log("cartAdminRoutes:", cartAdminRoutes);

//importing router of offers
const offerAdminRoutes = require('./offer.admin') // Offers-related routes
console.log("offerAdminRoutes", offerAdminRoutes)

//importing router of offers
const orderAdminRoutes = require('./order.admin') // Offers-related routes
console.log("OrderAdminRoutes",orderAdminRoutes)

//importing router of contact
const contactAdminRoutes = require('./contact.admin') // Contact-related routes
console.log("ContactAdminRoutes", contactAdminRoutes)

//importing router of about
const aboutAdminRoutes = require('./about.admin') // About-related routes
console.log("AboutAdminRoutes", aboutAdminRoutes)

//importing router of user-count
const dashBoardAdminRoutes = require('./dashBoard.admin') // user-count related routes
console.log("DashBoardAdminRoutes", dashBoardAdminRoutes)

//importing router of expense
const expenseAdminRoutes = require('./expense.admin') // expense related routes
console.log("expenseAdminRoutes", expenseAdminRoutes)

//importing router of inventory
const inventoryAdminRoutes = require('./inventory.admin') // inventory related routes
console.log("inventoryAdminRoutes", inventoryAdminRoutes)

//importing router of reply
const replyAdminRoutes = require('./reply.admin') // reply related routes
console.log("replyAdminRoutes", replyAdminRoutes)

//importing router of newsletter
const newsletterAdminRoutes = require('./newsletter.admin') // newsletter related routes
console.log("newsletterAdminRoutes", newsletterAdminRoutes)

//importing router of profile
const profileAdminRoutes = require('./profile.admin') // profile related routes
console.log("profileAdminRoutes", profileAdminRoutes)

//importing router of authentication
const authAdminRoutes = require('./login.register') // authentication related routes
console.log("AuthAdminRoutes", authAdminRoutes)

router.use("/users", userAdminRoutes);
router.use("/products", productAdminRoutes);
router.use("/cart", cartAdminRoutes);
router.use('/offer', offerAdminRoutes);
router.use('/order', orderAdminRoutes);
router.use('/contact', contactAdminRoutes);
router.use('/about', aboutAdminRoutes);
router.use('/dash-board', dashBoardAdminRoutes);
router.use('/expense', expenseAdminRoutes);
router.use('/inventory', inventoryAdminRoutes);
router.use('/reply', replyAdminRoutes);
router.use('/newsletter', newsletterAdminRoutes);
router.use('/profile', profileAdminRoutes);
router.use('/auth', authAdminRoutes); // Add authentication routes

// Handle 404 errors for unknown routes
router.use((req, res) => {
  res.status(404).send("Route not found in index.js");
});

module.exports = router;
