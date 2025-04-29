const express = require('express');
const router = express.Router();
const { sendEmail } = require('../services/email.service');

// Newsletter subscription
router.post('/subscribe', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                status: 'error',
                message: 'Email is required'
            });
        }

        // Send confirmation email
        await sendEmail(email, 'newsletter', `
            <p>Thank you for subscribing to our newsletter!</p>
            <p>You'll now receive updates about:</p>
            <ul>
                <li>Latest products and collections</li>
                <li>Exclusive offers and discounts</li>
                <li>Seasonal sales and promotions</li>
                <li>Fashion tips and trends</li>
            </ul>
            <p>We're excited to keep you updated with our latest news and offers!</p>
        `);

        res.status(200).json({
            status: 'success',
            message: 'Successfully subscribed to newsletter'
        });
    } catch (error) {
        console.error('Newsletter subscription error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to subscribe to newsletter'
        });
    }
});

module.exports = router; 