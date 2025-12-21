import express from 'express';
import transporter from '../config/nodemailer.js';

const router = express.Router();

router.get('/email-config', async (req, res) => {
    try {
        await transporter.verify();

        res.status(200).json({
            success: true,
            message: 'Email configuration is working',
            config: {
                host: process.env.EMAIL_HOST,
                port: process.env.EMAIL_PORT,
                user: process.env.EMAIL_USER,
                enabled: process.env.EMAIL_ENABLED,
                hasPassword: !!process.env.EMAIL_PASS
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Email configuration failed',
            error: {
                message: error.message,
                code: error.code,
                command: error.command
            }
        });
    }
});

export default router;
