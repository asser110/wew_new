import nodemailer from 'nodemailer';

// Create transporter (using Gmail as example - configure for your email provider)
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'your-email@gmail.com',
      pass: process.env.EMAIL_PASS || 'your-app-password'
    }
  });
};

// Generate 6-digit verification code
export const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send verification email
export const sendVerificationEmail = async (email, code, username) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@clutch.com',
      to: email,
      subject: 'Clutch - Login Verification Code',
      html: `
        <div style="font-family: 'Courier New', monospace; background: #000; color: #fff; padding: 20px; max-width: 600px;">
          <h1 style="color: #fff; font-size: 24px; margin-bottom: 20px;">CLUTCH</h1>
          <h2 style="color: #fff; font-size: 18px; margin-bottom: 20px;">Login Verification</h2>
          <p style="color: #ccc; font-size: 14px; line-height: 1.6;">
            Hello ${username},<br><br>
            Your verification code is:
          </p>
          <div style="background: #333; border: 2px solid #fff; padding: 20px; text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #fff;">${code}</span>
          </div>
          <p style="color: #ccc; font-size: 12px; line-height: 1.6;">
            This code will expire in 10 minutes.<br>
            If you didn't request this code, please ignore this email.
          </p>
          <div style="border-top: 1px solid #333; margin-top: 30px; padding-top: 20px;">
            <p style="color: #666; font-size: 10px;">
              CLUTCH - Discord-like Platform
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
};