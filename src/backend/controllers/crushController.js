// Crush Controller
// Path: src/backend/controllers/crushController.js
// Purpose: Handle crush-related operations (crushes sent/received, matches)

const User = require('../models/User');
const CrushTransaction = require('../models/CrushTransaction');
const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// Get user's crush data
exports.getCrushes = [verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Get users who sent crushes to current user
    const crushesReceivedIds = user.crushes.received.map(crush => crush.from);
    const crushesReceived = await User.find({ 
      _id: { $in: crushesReceivedIds } 
    }).select('-password -email');
    
    // Get users current user sent crushes to
    const crushesSentIds = user.crushes.sent.map(crush => crush.to);
    const crushesSent = await User.find({ 
      _id: { $in: crushesSentIds } 
    }).select('-password -email');
    
    // Find matches (users who both sent crushes to each other)
    const matches = [];
    
    // Check each person you sent a crush to
    for (const sentCrush of user.crushes.sent) {
      const recipientId = sentCrush.to.toString();
      
      // Check if they also sent you a crush
      const theyAlsoSentToYou = user.crushes.received.some(
        received => received.from.toString() === recipientId
      );
      
      if (theyAlsoSentToYou) {
        // It's a match! Get their full profile
        const matchUser = await User.findById(recipientId).select('-password -email');
        if (matchUser) {
          matches.push(matchUser);
        }
      }
    }
    
    // Active connections - matches with recent conversations
    // For now, this is empty until messaging is fully implemented
    const activeConnections = [];
    
    // Return all data - note the key name change from crushData to crushes
    res.json({
      success: true,
      crushes: {
        crushesReceived: crushesReceived,
        crushesSent: crushesSent,
        matches: matches,
        activeConnections: activeConnections
      }
    });
  } catch (error) {
    console.error('Crushes error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to retrieve crush data' 
    });
  }
}];

// Get user's crush balance and transaction history
exports.getCrushData = [verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Get crush transactions
    const history = await CrushTransaction.find({ 
      userId: req.userId,
      type: { $in: ['purchased', 'sent', 'received', 'bonus', 'refund'] }
    })
    .sort({ createdAt: -1 })
    .limit(20);
    
    // Format history
    const formattedHistory = history.map(transaction => {
      let action = transaction.type;
      let recipientName = '';
      let senderName = '';
      
      // Get names from metadata if available
      if (transaction.metadata) {
        recipientName = transaction.metadata.recipientName || '';
        senderName = transaction.metadata.senderName || '';
      }
      
      return {
        _id: transaction._id,
        action: action,
        amount: transaction.amount || 0,
        change: transaction.change || 0,
        createdAt: transaction.createdAt,
        recipientName: recipientName,
        senderName: senderName
      };
    });
    
    // Check subscription status
    const hasActiveSubscription = user.subscription?.status === 'active' && 
      user.subscription?.currentPeriodEnd > new Date();
    
    res.json({
      success: true,
      balance: user.crushBalance || 0,
      history: formattedHistory,
      hasActiveSubscription: hasActiveSubscription,
      subscriptionEndDate: user.subscription?.currentPeriodEnd || null
    });
  } catch (error) {
    console.error('Get crush data error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to retrieve crush data' 
    });
  }
}];