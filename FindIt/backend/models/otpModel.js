import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';


const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    otp: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true,
        default: () => new Date(Date.now() + 5 * 60 * 1000),
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

otpSchema.pre('save', async function (next) {
    if (!this.isModified('otp')) {
        return next();
    }

    const salt = await bcrypt.genSalt(10);
    this.otp = await bcrypt.hash(this.otp, salt);
    next();
});

otpSchema.methods.matchOtp = async function (enteredOtp) {
    return await bcrypt.compare(enteredOtp, this.otp);
};

otpSchema.methods.isExpired = function () {
    return Date.now() > this.expiresAt.getTime();
};

otpSchema.statics.canSendOtp = async function (email) {
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    const recentOtp = await this.findOne({
        email,
        createdAt: { $gte: oneMinuteAgo }
    });

    return !recentOtp;
};

const OTP = mongoose.model('OTP', otpSchema);
export default OTP;
