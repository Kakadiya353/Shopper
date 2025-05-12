const express = require('express');
const router = express.Router();
const User = require('../models/user.model');
const Order = require('../models/order.model');
const Product = require('../models/product.model');

// Get admin profile details
router.get('/admin/profile', async (req, res) => {
    try {
        // Get admin user details
        const admin = await User.findOne({ Role: 'admin' });
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        // Get total orders
        const totalOrders = await Order.countDocuments();

        // Get total products
        const totalProducts = await Product.countDocuments();

        // Get total users (excluding admin)
        const totalUsers = await User.countDocuments({ Role: 'user' });

        // Prepare response data
        const adminData = {
            name: admin.UserName,
            email: admin.Email,
            role: admin.Role,
            avatar: admin.ImageURI || '/default-avatar.png',
            joinDate: admin.Created,
            lastLogin: admin.LastLogin || admin.Created,
            totalOrders,
            totalProducts,
            totalUsers
        };

        res.json(adminData);
    } catch (error) {
        console.error('Error fetching admin profile:', error);
        res.status(500).json({ message: 'Error fetching admin profile', error: error.message });
    }
});

module.exports = router;
