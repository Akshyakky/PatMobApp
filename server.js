require('dotenv').config(); // Load environment variables
const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());

const otpStorage = {}; // Simple in-memory storage for OTPs
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS);

// Nodemailer configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: "akshay.putta3@gmail.com",
        pass: "ruik luhd hzlz pfud",
    },
});

const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

app.post('/send-otp', (req, res) => {
    const {
        email
    } = req.body;
    const otp = generateOtp();
    otpStorage[email] = otp;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your OTP Code',
        text: `Your OTP code is ${otp}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Error sending email:', error);
            return res.status(500).json({
                success: false,
                error: error.message
            });
        } else {
            console.log('Email sent: ' + info.response);
            return res.status(200).json({
                success: true
            });
        }
    });
});

app.post('/verify-otp', (req, res) => {
    const {
        email,
        otp
    } = req.body;
    if (otpStorage[email] === otp) {
        return res.status(200).json({
            success: true
        });
    } else {
        return res.status(400).json({
            success: false
        });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://192.168.29.32:${port}`);
});