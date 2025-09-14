import express from 'express';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Mock servers data (replace with database in production)
const servers = [];
const channels = [];
const messages = [];

// Get all servers for user
router.get('/', authenticateToken, (req, res) => {
  // In a real app, filter servers by user membership
  res.json({ servers });
});

// Create new server
router.post('/', authenticateToken, (req, res) => {
  const { name, description, icon } = req.body;
  
  if (!name) {
    return res.status(400).json({ 
      error: 'Missing server name',
      message: 'Server name is required'
    });
  }
  
  const server = {
    id: Date.now().toString(),
    name,
    description: description || '',
    icon: icon || null,
    ownerId: req.user.userId,
    members: [req.user.userId],
    createdAt: new Date().toISOString()
  };
  
  servers.push(server);
  
  // Create default general channel
  const generalChannel = {
    id: (Date.now() + 1).toString(),
    serverId: server.id,
    name: 'general',
    type: 'text',
    createdAt: new Date().toISOString()
  };
  
  channels.push(generalChannel);
  
  res.status(201).json({ 
    message: 'Server created successfully',
    server: { ...server, channels: [generalChannel] }
  });
});

// Get server by ID
router.get('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const server = servers.find(server => server.id === id);
  
  if (!server) {
    return res.status(404).json({ 
      error: 'Server not found',
      message: 'Server with this ID does not exist'
    });
  }
  
  // Check if user is member of server
  if (!server.members.includes(req.user.userId)) {
    return res.status(403).json({ 
      error: 'Access denied',
      message: 'You are not a member of this server'
    });
  }
  
  // Get server channels
  const serverChannels = channels.filter(channel => channel.serverId === id);
  
  res.json({ 
    server: { ...server, channels: serverChannels }
  });
});

// Get messages for a channel
router.get('/:serverId/channels/:channelId/messages', authenticateToken, (req, res) => {
  const { serverId, channelId } = req.params;
  const limit = parseInt(req.query.limit) || 50;
  
  // Verify user has access to server
  const server = servers.find(server => server.id === serverId);
  if (!server || !server.members.includes(req.user.userId)) {
    return res.status(403).json({ 
      error: 'Access denied',
      message: 'You do not have access to this server'
    });
  }
  
  // Get messages for channel
  const channelMessages = messages
    .filter(message => message.channelId === channelId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, limit)
    .reverse();
  
  res.json({ messages: channelMessages });
});

// Send message to channel
router.post('/:serverId/channels/:channelId/messages', authenticateToken, (req, res) => {
  const { serverId, channelId } = req.params;
  const { content } = req.body;
  
  if (!content || content.trim().length === 0) {
    return res.status(400).json({ 
      error: 'Empty message',
      message: 'Message content cannot be empty'
    });
  }
  
  // Verify user has access to server
  const server = servers.find(server => server.id === serverId);
  if (!server || !server.members.includes(req.user.userId)) {
    return res.status(403).json({ 
      error: 'Access denied',
      message: 'You do not have access to this server'
    });
  }
  
  const message = {
    id: Date.now().toString(),
    channelId,
    authorId: req.user.userId,
    content: content.trim(),
    createdAt: new Date().toISOString(),
    editedAt: null
  };
  
  messages.push(message);
  
  res.status(201).json({ 
    message: 'Message sent successfully',
    data: message
  });
});

export default router;