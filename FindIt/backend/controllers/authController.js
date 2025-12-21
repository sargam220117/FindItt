import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import OTP from '../models/otpModel.js';
import generateToken from '../utils/generateToken.js';
import generateOTP from '../utils/generateOTP.js';
import { sendOtpEmail } from '../config/nodemailer.js';

const sendOtp = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        res.status(400);
        throw new Error('Email is required');
    }

    const normalizedEmail = email.toLowerCase().trim();

    await OTP.deleteMany({ email: normalizedEmail });

    const otp = generateOTP();

    const otpRecord = await OTP.create({
        email: normalizedEmail,
        otp: otp
    });

    try {
        await sendOtpEmail(normalizedEmail, otp);

        res.status(200).json({
            message: 'OTP sent successfully to your email',
            email: normalizedEmail,
            expiresIn: 300
        });
    } catch (error) {
        await OTP.findByIdAndDelete(otpRecord._id);

        res.status(500);
        throw new Error('Failed to send OTP email. Please try again.');
    }
});

const verifyOtp = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        res.status(400);
        throw new Error('Email and OTP are required');
    }

    const normalizedEmail = email.toLowerCase().trim();

    const otpRecord = await OTP.findOne({ email: normalizedEmail })
        .sort({ createdAt: -1 });

    if (!otpRecord) {
        res.status(400);
        throw new Error('OTP not found. Please request a new one.');
    }

    if (otpRecord.isExpired()) {
        await OTP.deleteOne({ _id: otpRecord._id });
        res.status(400);
        throw new Error('OTP has expired. Please request a new one.');
    }

    const isMatch = await otpRecord.matchOtp(otp);

    if (!isMatch) {
        res.status(400);
        throw new Error('Invalid OTP. Please try again.');
    }

    res.status(200).json({
        message: 'OTP verified successfully',
        email: normalizedEmail
    });
});

const signup = asyncHandler(async (req, res) => {
    const { email, otp, name } = req.body;

    if (!email || !otp || !name) {
        res.status(400);
        throw new Error('Email, OTP, and name are required');
    }

    const normalizedEmail = email.toLowerCase().trim();

    const otpRecord = await OTP.findOne({ email: normalizedEmail })
        .sort({ createdAt: -1 });

    if (!otpRecord) {
        res.status(400);
        throw new Error('OTP not found. Please request a new one.');
    }

    if (otpRecord.isExpired()) {
        await OTP.deleteOne({ _id: otpRecord._id });
        res.status(400);
        throw new Error('OTP has expired. Please request a new one.');
    }

    const isMatch = await otpRecord.matchOtp(otp);

    if (!isMatch) {
        res.status(400);
        throw new Error('Invalid OTP. Please try again.');
    }

    const userExists = await User.findOne({ email: normalizedEmail });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists. Please login instead.');
    }

    const user = await User.create({
        name,
        email: normalizedEmail,
        password: generateOTP() + generateOTP()
    });

    await OTP.deleteOne({ _id: otpRecord._id });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id),
            message: 'Account created successfully'
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

const login = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        res.status(400);
        throw new Error('Email and OTP are required');
    }

    const normalizedEmail = email.toLowerCase().trim();

    const otpRecord = await OTP.findOne({ email: normalizedEmail })
        .sort({ createdAt: -1 });

    if (!otpRecord) {
        res.status(400);
        throw new Error('OTP not found. Please request a new one.');
    }

    if (otpRecord.isExpired()) {
        await OTP.deleteOne({ _id: otpRecord._id });
        res.status(400);
        throw new Error('OTP has expired. Please request a new one.');
    }

    const isMatch = await otpRecord.matchOtp(otp);

    if (!isMatch) {
        res.status(400);
        throw new Error('Invalid OTP. Please try again.');
    }

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
        res.status(404);
        throw new Error('User not found. Please signup first.');
    }

    await OTP.deleteOne({ _id: otpRecord._id });

    res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
        message: 'Login successful'
    });
});

export { sendOtp, verifyOtp, signup, login };
