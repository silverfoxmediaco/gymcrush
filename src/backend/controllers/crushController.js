// Crush Controller
// Path: src/backend/controllers/crushController.js
// Purpose: Handle crush-related operations (crushes sent/received, matches)

import User from '../models/User.js';
import CrushTransaction from '../models/CrushTransaction.js';
import jwt from 'jsonwebtoken';

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

// Get user's crush data including balance
exports.getCrushes = [verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
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
    
    // Return all data
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

// Get crush data including balance and history
exports.getCrushData = [verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Get crush balance - ensure it's never negative
    const balance = Math.max(0, user.crushBalance || 0);
    
    // Get transaction history
    const history = await CrushTransaction.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('recipientId', 'username')
      .populate('senderId', 'username');
    
    // Check for active subscription
    const hasActiveSubscription = user.subscription?.status === 'active' && 
                                 user.subscription?.currentPeriodEnd > new Date();
    
    res.json({
      success: true,
      balance: balance,
      history: history,
      hasActiveSubscription: hasActiveSubscription,
      subscriptionEndDate: user.subscription?.currentPeriodEnd
    });
  } catch (error) {
    console.error('Get crush data error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to retrieve crush data' 
    });
  }
}];

// Create Stripe checkout session for crush packages
exports.createCheckoutSession = [verifyToken, async (req, res) => {
  try {
    const { packageId, crushes, amount } = req.body;
    
    // Forward to crushAccountController
    const crushAccountController = require('./crushAccountController');
    return crushAccountController.createCheckoutSession[1](req, res);
  } catch (error) {
    console.error('Create checkout session error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create checkout session' 
    });
  }
}];

// Create subscription
exports.createSubscription = [verifyToken, async (req, res) => {
  try {
    // Forward to crushAccountController
    const crushAccountController = require('./crushAccountController');
    return crushAccountController.createSubscription[1](req, res);
  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create subscription' 
    });
  }
}];

// Cancel subscription
exports.cancelSubscription = [verifyToken, async (req, res) => {
  try {
    // Forward to crushAccountController
    const crushAccountController = require('./crushAccountController');
    return crushAccountController.cancelSubscription[1](req, res);
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to cancel subscription' 
    });
  }
}];