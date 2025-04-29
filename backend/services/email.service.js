const nodemailer = require('nodemailer');
require('dotenv').config();

// Configure email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Verify transporter configuration
transporter.verify(function(error, success) {
    if (error) {
        console.error('Email transporter verification failed:', error);
    } else {
        console.log('Email transporter is ready to send messages');
    }
});

// Email templates
const templates = {
    welcome: (userName) => ({
        subject: "Welcome to Our E-Commerce Platform",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
                <h2 style="color: #333; text-align: center;">Welcome to Our Platform, ${userName}!</h2>
                <p style="color: #555; font-size: 16px;">
                    Thank you for joining our community. We're excited to have you on board!
                </p>
                <p style="color: #555; font-size: 16px;">
                    You can now explore our wide range of products and start shopping.
                </p>
                <div style="text-align: center; margin: 20px 0;">
                    <a href="http://localhost:5173/shop" 
                       style="display: inline-block; padding: 12px 20px; background-color: #007bff; color: #fff; 
                              text-decoration: none; font-size: 16px; border-radius: 5px;">
                        Start Shopping
                    </a>
                </div>
                <p style="color: #777; font-size: 14px;">
                    If you have any questions, feel free to contact our support team.
                </p>
                <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                <p style="text-align: center; color: #666; font-size: 14px;">
                    Regards, <br> <strong>Your E-Commerce Team</strong>
                </p>
            </div>
        `
    }),

    orderConfirmation: (orderDetails) => ({
        subject: "Order Confirmation",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
                <h2 style="color: #333; text-align: center;">Order Confirmation</h2>
                <p style="color: #555; font-size: 16px;">
                    Thank you for your order! Your order has been received and is being processed.
                </p>
                <div style="background-color: #fff; padding: 20px; border-radius: 5px; margin: 20px 0;">
                    <h3 style="color: #333;">Order Details</h3>
                    <p><strong>Order ID:</strong> ${orderDetails.orderId}</p>
                    <p><strong>Total Amount:</strong> $${orderDetails.totalAmount}</p>
                    <p><strong>Shipping Address:</strong> ${orderDetails.shippingAddress}</p>
                </div>
                <p style="color: #777; font-size: 14px;">
                    We'll send you another email when your order ships.
                </p>
                <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                <p style="text-align: center; color: #666; font-size: 14px;">
                    Regards, <br> <strong>Your E-Commerce Team</strong>
                </p>
            </div>
        `
    }),

    passwordReset: (resetLink) => ({
        subject: "Password Reset Request",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
                <h2 style="color: #333; text-align: center;">Password Reset Request</h2>
                <p style="color: #555; font-size: 16px;">
                    We received a request to reset your password. Click the button below to create a new password.
                </p>
                <div style="text-align: center; margin: 20px 0;">
                    <a href="${resetLink}" 
                       style="display: inline-block; padding: 12px 20px; background-color: #007bff; color: #fff; 
                              text-decoration: none; font-size: 16px; border-radius: 5px;">
                        Reset Password
                    </a>
                </div>
                <p style="color: #777; font-size: 14px;">
                    If you didn't request this password reset, you can safely ignore this email.
                </p>
                <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                <p style="text-align: center; color: #666; font-size: 14px;">
                    Regards, <br> <strong>Your E-Commerce Team</strong>
                </p>
            </div>
        `
    }),

    newsletter: (content) => ({
        subject: "Latest Updates and Offers",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
                <h2 style="color: #333; text-align: center;">Newsletter</h2>
                <div style="color: #555; font-size: 16px;">
                    ${content}
                </div>
                <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                <p style="text-align: center; color: #666; font-size: 14px;">
                    Regards, <br> <strong>Your E-Commerce Team</strong>
                </p>
            </div>
        `
    }),

    adminReply: (data) => ({
        subject: data.subject || "Shopper Support",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
                <h2 style="color: #333; text-align: center;">Shopper Support</h2>
                <p style="color: #555; font-size: 16px;">Dear ${data.userName},</p>
                <div style="background-color: #fff; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #007bff;">
                    ${data.message}
                </div>
                <p style="color: #777; font-size: 14px;">
                    If you have any further questions, please don't hesitate to contact us.
                </p>
                <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                <p style="text-align: center; color: #666; font-size: 14px;">
                    Best regards, <br> <strong>Shopper Support Team</strong>
                </p>
            </div>
        `
    })
};

// Email sending function
const sendEmail = async (to, template, data) => {
    try {
        console.log('Attempting to send email to:', to);
        console.log('Using template:', template);
        console.log('With data:', data);

        const { subject, html } = templates[template](data);
        
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject,
            html
        };

        console.log('Mail options prepared:', {
            from: mailOptions.from,
            to: mailOptions.to,
            subject: mailOptions.subject
        });

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.response);
        return { success: true, message: 'Email sent successfully', info };
    } catch (error) {
        console.error('Error sending email:', error);
        console.error('Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        return { success: false, message: 'Failed to send email', error: error.message };
    }
};

module.exports = {
    sendEmail,
    templates
}; 