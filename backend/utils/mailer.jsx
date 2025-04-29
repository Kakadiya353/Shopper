// utils/mail.js
require('dotenv').config();  // Load environment variables

const nodemailer = require('nodemailer');

// Create a transporter using Gmail service (You can change this if you want to use a different service)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,  // Use the email from the environment variable
    pass: process.env.EMAIL_PASS,  // Use the password from the environment variable
  },
});

// Send a registration confirmation email
const sendConfirmationEmail = (email) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,  // Sender's email
    to: email,                     // Recipient's email
    subject: 'Registration Successful', // Subject of the email
    text: 'You have successfully registered with our website! Welcome aboard.', // Body of the email
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error sending email:', error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
};

module.exports = sendConfirmationEmail;
