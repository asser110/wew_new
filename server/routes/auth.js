import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authenticateToken } from '../middleware/auth.js';
import { generateVerificationCode, sendVerificationEmail } from '../utils/emailService.js';

const router = express.Router();

// In-memory user storage (replace with database in production)
const users = [];
const verificationCodes = new Map(); // Store verification codes temporarily

// Initialize admin user
(async () => {
  const adminPassword = await bcrypt.hash('1234', 12);
  users.push({
    id: 'admin-001',
    email: 'admin@clutch.com',
    username: 'admin',
    password: adminPassword,
    createdAt: new Date().toISOString(),
    avatar: null,
    status: 'online'
  });
})();

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const { email, password, username } = req.body;

    // Validation
    if (!email || !password || !username) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'Email, password, and username are required'
      });
    }

    // Check if user already exists
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      return res.status(409).json({ 
        error: 'User already exists',
        message: 'A user with this email already exists'
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = {
      id: Date.now().toString(),
      email,
      username,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
      avatar: null,
      status: 'online'
    };

    users.push(user);

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'clutch-secret-key',
      { expiresIn: '7d' }
    );

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user;
    
    res.status(201).json({
      message: 'User registered successfully',
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      error: 'Registration failed',
      message: 'An error occurred during registration'
    });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Missing credentials',
        message: 'Email and password are required'
      });
    }

    // Find user
    const user = users.find(user => user.email === email);
    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid credentials',
        message: 'Invalid email or password'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ 
        error: 'Invalid credentials',
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'clutch-secret-key',
      { expiresIn: '7d' }
    );

    // Update user status
    user.status = 'online';
    user.lastLogin = new Date().toISOString();

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      message: 'Login successful',
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Login failed',
      message: 'An error occurred during login'
    });
  }
});

// Send verification code endpoint
router.post('/send-verification', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Missing credentials',
        message: 'Email and password are required'
      });
    }

    // Find user
    const user = users.find(user => user.email === email);
    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid credentials',
        message: 'Invalid email or password'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ 
        error: 'Invalid credentials',
        message: 'Invalid email or password'
      });
    }

    // Generate verification code
    const verificationCode = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store verification code
    verificationCodes.set(email, {
      code: verificationCode,
      expiresAt,
      userId: user.id
    });

    // Send verification email
    const emailSent = await sendVerificationEmail(email, verificationCode, user.username);
    
    if (!emailSent) {
      return res.status(500).json({
        error: 'Email sending failed',
        message: 'Could not send verification email. Please try again.'
      });
    }

    res.json({
      message: 'Verification code sent to your email',
      email: email.replace(/(.{2})(.*)(@.*)/, '$1***$3') // Mask email for security
    });
  } catch (error) {
    console.error('Send verification error:', error);
    res.status(500).json({ 
      error: 'Verification failed',
      message: 'An error occurred while sending verification code'
    });
  }
});

// Verify code and complete login
router.post('/verify-login', async (req, res) => {
  try {
    const { email, code } = req.body;

    // Validation
    if (!email || !code) {
      return res.status(400).json({ 
        error: 'Missing verification data',
        message: 'Email and verification code are required'
      });
    }

    // Check verification code
    const storedVerification = verificationCodes.get(email);
    if (!storedVerification) {
      return res.status(401).json({ 
        error: 'Invalid verification',
        message: 'No verification code found for this email'
      });
    }

    // Check if code expired
    if (new Date() > storedVerification.expiresAt) {
      verificationCodes.delete(email);
      return res.status(401).json({ 
        error: 'Code expired',
        message: 'Verification code has expired. Please request a new one.'
      });
    }

    // Verify code
    if (storedVerification.code !== code) {
      return res.status(401).json({ 
        error: 'Invalid code',
        message: 'Incorrect verification code'
      });
    }

    // Find user
    const user = users.find(user => user.id === storedVerification.userId);
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found',
        message: 'User account no longer exists'
      });
    }

    // Clean up verification code
    verificationCodes.delete(email);

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'clutch-secret-key',
      { expiresIn: '7d' }
    );

    // Update user status
    user.status = 'online';
    user.lastLogin = new Date().toISOString();

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      message: 'Login successful',
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Verify login error:', error);
    res.status(500).json({ 
      error: 'Verification failed',
      message: 'An error occurred during verification'
    });
  }
});

// Get current user endpoint
router.get('/me', authenticateToken, (req, res) => {
  const user = users.find(user => user.id === req.user.userId);
  if (!user) {
    return res.status(404).json({ 
      error: 'User not found',
      message: 'User account no longer exists'
    });
  }

  const { password: _, ...userWithoutPassword } = user;
  res.json({ user: userWithoutPassword });
});

// Logout endpoint
router.post('/logout', authenticateToken, (req, res) => {
  const user = users.find(user => user.id === req.user.userId);
  if (user) {
    user.status = 'offline';
  }
  
  res.json({ message: 'Logout successful' });
});

export default router;