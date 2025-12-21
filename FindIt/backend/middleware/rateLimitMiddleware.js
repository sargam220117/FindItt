import OTP from '../models/otpModel.js';

const rateLimitOtp = async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const canSend = await OTP.canSendOtp(email.toLowerCase().trim());

        if (!canSend) {
            return res.status(429).json({
                message: 'Please wait 1 minute before requesting another OTP',
                remainingTime: 60
            });
        }

        next();
    } catch (error) {
        console.error('Rate limit middleware error:', error);
        res.status(500).json({ message: 'Server error during rate limit check' });
    }
};

export default rateLimitOtp;
