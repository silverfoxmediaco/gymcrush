// Message Routes
// Path: src/backend/routes/messageRoutes.js
// Purpose: Define message-related API endpoints

const express = require('express');
const router = express.Router();
const {
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
  deleteMessage,
  sendImage,
  getUnreadCount
} = require('../controllers/messageController');
const { handleMulterError } = require('../middleware/uploadMiddleware');

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }
  
  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// GET /api/messages/conversations - Get all conversations for logged-in user
router.get('/conversations', verifyToken, getConversations);

// GET /api/messages/:userId - Get messages with a specific user
router.get('/:userId', verifyToken, getMessages);

// POST /api/messages/send - Send a text message
router.post('/send', verifyToken, sendMessage);

// POST /api/messages/send-image - Send an image message (requires premium)
// Note: verifyToken must come BEFORE the upload middleware
router.post('/send-image', verifyToken, sendImage, handleMulterError);

// PUT /api/messages/read/:conversationId - Mark messages as read
router.put('/read/:conversationId', verifyToken, markAsRead);

// DELETE /api/messages/:messageId - Delete a message
router.delete('/:messageId', verifyToken, deleteMessage);

// GET /api/messages/unread/count - Get unread message count
router.get('/unread/count', verifyToken, getUnreadCount);

module.exports = router;