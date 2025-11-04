const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const rateLimit = require('express-rate-limit');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(express.json());

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: { error: 'Too many authentication attempts, please try again later.' }
});

// Email transporter setup
const transporter = nodemailer.createTransporter({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Utility functions
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const maskEmail = (email) => {
  const [username, domain] = email.split('@');
  const maskedUsername = username.charAt(0) + '*'.repeat(username.length - 2) + username.charAt(username.length - 1);
  return `${maskedUsername}@${domain}`;
};

const sendVerificationEmail = async (email, code) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Clutch - Email Verification Code',
    html: `
      <div style="font-family: 'Courier New', monospace; background-color: #000; color: #fff; padding: 20px; text-align: center;">
        <h1 style="color: #fff; font-size: 24px; margin-bottom: 20px;">CLUTCH</h1>
        <div style="background-color: #111; border: 2px solid #fff; padding: 30px; margin: 20px 0;">
          <h2 style="color: #fff; font-size: 18px; margin-bottom: 20px;">Email Verification</h2>
          <p style="color: #ccc; font-size: 14px; margin-bottom: 30px;">
            Enter this code to complete your login:
          </p>
          <div style="background-color: #000; border: 1px solid #fff; padding: 20px; font-size: 32px; letter-spacing: 8px; color: #fff; margin: 20px 0;">
            ${code}
          </div>
          <p style="color: #888; font-size: 12px; margin-top: 30px;">
            This code will expire in 10 minutes.<br>
            If you didn't request this code, please ignore this email.
          </p>
        </div>
        <p style="color: #666; font-size: 10px; margin-top: 20px;">
          © 2024 Clutch Platform. All rights reserved.
        </p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
};

// Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Clutch backend is running' });
});

// Send verification code
app.post('/api/auth/send-verification', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Missing credentials', 
        message: 'Email and password are required' 
      });
    }

    // Check if user exists in Supabase
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Database error:', fetchError);
      return res.status(500).json({ 
        error: 'Database error', 
        message: 'Unable to verify user credentials' 
      });
    }

    let user = existingUser;

    // If user doesn't exist, create new user
    if (!user) {
      const hashedPassword = await bcrypt.hash(password, 12);
      
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert([
          {
            email,
            password: hashedPassword,
            username: email.split('@')[0],
            status: 'offline',
            created_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (createError) {
        console.error('User creation error:', createError);
        return res.status(500).json({ 
          error: 'User creation failed', 
          message: 'Unable to create user account' 
        });
      }

      user = newUser;
    } else {
      // Verify password for existing user
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ 
          error: 'Invalid credentials', 
          message: 'Invalid email or password' 
        });
      }
    }

    // Generate verification code
    const verificationCode = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store verification code in database
    const { error: codeError } = await supabase
      .from('verification_codes')
      .upsert([
        {
          email,
          code: verificationCode,
          expires_at: expiresAt.toISOString(),
          created_at: new Date().toISOString()
        }
      ]);

    if (codeError) {
      console.error('Verification code storage error:', codeError);
      return res.status(500).json({ 
        error: 'Code generation failed', 
        message: 'Unable to generate verification code' 
      });
    }

    // Send email
    const emailSent = await sendVerificationEmail(email, verificationCode);
    
    if (!emailSent) {
      return res.status(500).json({ 
        error: 'Email sending failed', 
        message: 'Unable to send verification email' 
      });
    }

    res.json({
      message: 'Verification code sent successfully',
      email: maskEmail(email)
    });

  } catch (error) {
    console.error('Send verification error:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      message: 'An unexpected error occurred' 
    });
  }
});

// Verify code and login
app.post('/api/auth/verify-login', authLimiter, async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ 
        error: 'Missing data', 
        message: 'Email and verification code are required' 
      });
    }

    // Get verification code from database
    const { data: verificationData, error: codeError } = await supabase
      .from('verification_codes')
      .select('*')
      .eq('email', email)
      .eq('code', code)
      .single();

    if (codeError || !verificationData) {
      return res.status(400).json({ 
        error: 'Invalid code', 
        message: 'Invalid or expired verification code' 
      });
    }

    // Check if code is expired
    if (new Date() > new Date(verificationData.expires_at)) {
      // Delete expired code
      await supabase
        .from('verification_codes')
        .delete()
        .eq('email', email);

      return res.status(400).json({ 
        error: 'Code expired', 
        message: 'Verification code has expired' 
      });
    }

    // Get user data
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, username, status, created_at')
      .eq('email', email)
      .single();

    if (userError || !user) {
      return res.status(404).json({ 
        error: 'User not found', 
        message: 'User account not found' 
      });
    }

    // Update user's last login and status
    await supabase
      .from('users')
      .update({ 
        last_login: new Date().toISOString(),
        status: 'online'
      })
      .eq('id', user.id);

    // Delete used verification code
    await supabase
      .from('verification_codes')
      .delete()
      .eq('email', email);

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        username: user.username
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        status: user.status,
        createdAt: user.created_at
      },
      token
    });

  } catch (error) {
    console.error('Verify login error:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      message: 'An unexpected error occurred' 
    });
  }
});

// Get user profile (protected route)
app.get('/api/user/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        error: 'No token', 
        message: 'Access token required' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, username, status, created_at, last_login')
      .eq('id', decoded.userId)
      .single();

    if (error || !user) {
      return res.status(404).json({ 
        error: 'User not found', 
        message: 'User profile not found' 
      });
    }

    res.json({ user });

  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(401).json({ 
      error: 'Invalid token', 
      message: 'Invalid or expired access token' 
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error', 
    message: 'An unexpected error occurred' 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Not found', 
    message: 'API endpoint not found' 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Clutch backend server running on port ${PORT}`);
  console.log(`📧 Email service configured with ${process.env.EMAIL_USER}`);
  console.log(`🗄️  Database connected to Supabase`);
});