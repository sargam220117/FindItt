import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';

dotenv.config();

// Initialize SendGrid with API key
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  console.log('✅ SendGrid initialized successfully');
} else {
  console.log('❌ SendGrid API key not found in environment variables');
}

export const sendOtpEmail = async (email, otp) => {
  try {
    if (!process.env.SENDGRID_API_KEY) {
      throw new Error('SendGrid API key is not configured');
    }

    if (!process.env.SENDGRID_FROM_EMAIL) {
      throw new Error('SendGrid FROM email is not configured');
    }

    const msg = {
      to: email,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL,
        name: process.env.SENDGRID_FROM_NAME || 'FindIt'
      },
      subject: 'Your FindIt Verification Code',
      html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 40px auto;
              background-color: #ffffff;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              padding: 30px;
              text-align: center;
              color: white;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: 600;
            }
            .content {
              padding: 40px 30px;
              text-align: center;
            }
            .content p {
              color: #555;
              font-size: 16px;
              line-height: 1.6;
              margin-bottom: 30px;
            }
            .otp-box {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              font-size: 36px;
              font-weight: bold;
              letter-spacing: 8px;
              padding: 20px;
              border-radius: 8px;
              display: inline-block;
              margin: 20px 0;
            }
            .expiry {
              color: #e74c3c;
              font-size: 14px;
              font-weight: 600;
              margin-top: 20px;
            }
            .footer {
              background-color: #f8f9fa;
              padding: 20px;
              text-align: center;
              color: #888;
              font-size: 12px;
              border-top: 1px solid #e0e0e0;
            }
            .warning {
              background-color: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 15px;
              margin-top: 20px;
              text-align: left;
              font-size: 13px;
              color: #856404;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 FindIt Verification</h1>
            </div>
            <div class="content">
              <p>Hello!</p>
              <p>You requested a verification code for your FindIt account. Use the code below to complete your authentication:</p>
              
              <div class="otp-box">${otp}</div>
              
              <p class="expiry">⏰ This code will expire in 5 minutes</p>
              
              <div class="warning">
                <strong>⚠️ Security Notice:</strong><br>
                Never share this code with anyone. FindIt staff will never ask for your verification code.
              </div>
            </div>
            <div class="footer">
              <p>If you didn't request this code, please ignore this email.</p>
              <p>&copy; ${new Date().getFullYear()} FindIt. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `
    };

    const response = await sgMail.send(msg);
    console.log('✅ OTP email sent successfully via SendGrid');
    console.log('Response status:', response[0].statusCode);
    console.log('To:', email);
    console.log('From:', process.env.SENDGRID_FROM_EMAIL);
    return { messageId: response[0].headers['x-message-id'], statusCode: response[0].statusCode };
  } catch (error) {
    console.error('❌ Error sending OTP email via SendGrid:', {
      message: error.message,
      code: error.code,
    });

    // Log detailed SendGrid error response
    if (error.response) {
      console.error('SendGrid Error Details:', JSON.stringify(error.response.body, null, 2));

      // Check for common errors
      if (error.response.body?.errors) {
        error.response.body.errors.forEach(err => {
          console.error(`  - ${err.message}`);
          if (err.field) console.error(`    Field: ${err.field}`);
          if (err.help) console.error(`    Help: ${err.help}`);
        });
      }
    }

    throw error;
  }
};

export default sgMail;
