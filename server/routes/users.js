import express from 'express';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Mock users data (replace with database in production)
const users = [];

// Get all users (protected route)
router.get('/', authenticateToken, (req, res) => {
  const usersWithoutPasswords = users.map(user => {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  });
  
  res.json({ users: usersWithoutPasswords });
});

// Get user by ID
router.get('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const user = users.find(user => user.id === id);
  
  if (!user) {
    return res.status(404).json({ 
      error: 'User not found',
      message: 'User with this ID does not exist'
    });
  }
  
  const { password, ...userWithoutPassword } = user;
  res.json({ user: userWithoutPassword });
});

// Update user profile
router.put('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { username, avatar, status } = req.body;
  
  // Check if user is updating their own profile
  if (req.user.userId !== id) {
    return res.status(403).json({ 
      error: 'Forbidden',
      message: 'You can only update your own profile'
    });
  }
  
  const userIndex = users.findIndex(user => user.id === id);
  if (userIndex === -1) {
    return res.status(404).json({ 
      error: 'User not found',
      message: 'User with this ID does not exist'
    });
  }
  
  // Update user data
  if (username) users[userIndex].username = username;
  if (avatar !== undefined) users[userIndex].avatar = avatar;
  if (status) users[userIndex].status = status;
  users[userIndex].updatedAt = new Date().toISOString();
  
  const { password, ...userWithoutPassword } = users[userIndex];
  res.json({ 
    message: 'Profile updated successfully',
    user: userWithoutPassword 
  });
});

export default router;