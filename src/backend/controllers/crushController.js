// Crush Controller
// Path: src/backend/controllers/crushController.js
// Purpose: Handle crush-related operations (crushes sent/received, matches)

import User from '../models/User.js';
import CrushTransaction from '../models/CrushTransaction.js';
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';

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
export const getCrushes = [verifyToken, async (req, res) => {
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
export const getCrushData = [verifyToken, async (req, res) => {
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
      crushBalance: balance, // Add this for compatibility
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

// Verify Apple Purchase
export const verifyApplePurchase = [verifyToken, async (req, res) => {
  try {
    const { receipt, productId, transactionId } = req.body;
    const userId = req.userId;
    
    // Check if transaction already processed
    const existingTransaction = await CrushTransaction.findOne({ 
      transactionId: transactionId,
      platform: 'ios'
    });
    
    if (existingTransaction) {
      return res.status(400).json({
        success: false,
        message: 'Transaction already processed'
      });
    }
    
    // Verify receipt with Apple
    const verificationResponse = await verifyWithApple(receipt);
    
    if (verificationResponse.status === 0) {
      // Valid receipt
      const crushAmount = {
        'com.silverfoxmedia.gymcrush.5crushes': 5,
        'com.silverfoxmedia.gymcrush.10crushes': 10,
        'com.silverfoxmedia.gymcrush.25crushes': 25,
      }[productId] || 0;
      
      if (crushAmount === 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid product ID'
        });
      }
      
      // Add crushes to user
      const user = await User.findByIdAndUpdate(
        userId, 
        { $inc: { crushBalance: crushAmount } },
        { new: true }
      );
      
      // Store transaction
      await CrushTransaction.create({
        userId: userId,
        type: 'purchase',
        amount: crushAmount,
        platform: 'ios',
        transactionId: transactionId,
        productId: productId,
        description: `Purchased ${crushAmount} crushes`
      });
      
      res.json({
        success: true,
        crushesAdded: crushAmount,
        newBalance: user.crushBalance
      });
    } else {
      // Handle specific Apple error codes
      let errorMessage = 'Invalid receipt';
      if (verificationResponse.status === 21007) {
        // Sandbox receipt sent to production
        const sandboxResponse = await verifyWithApple(receipt, true);
        if (sandboxResponse.status === 0) {
          // Retry with sandbox verification
          return exports.verifyApplePurchase[1](req, res);
        }
      }
      
      res.status(400).json({
        success: false,
        message: errorMessage,
        appleStatus: verificationResponse.status
      });
    }
  } catch (error) {
    console.error('Purchase verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify purchase'
    });
  }
}];

// Helper function to verify with Apple
const verifyWithApple = async (receipt, forceSandbox = false) => {
  const isProduction = process.env.NODE_ENV === 'production' && !forceSandbox;
  const verifyUrl = isProduction 
    ? 'https://buy.itunes.apple.com/verifyReceipt'
    : 'https://sandbox.itunes.apple.com/verifyReceipt';
    
  try {
    const response = await fetch(verifyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        'receipt-data': receipt,
        'password': process.env.APPLE_SHARED_SECRET
      })
    });
    
    return await response.json();
  } catch (error) {
    console.error('Apple verification request failed:', error);
    throw error;
  }
};

// Verify Apple Subscription
export const verifyAppleSubscription = [verifyToken, async (req, res) => {
  try {
    const { receipt, productId, transactionId } = req.body;
    const userId = req.userId;
    
    // Verify receipt with Apple
    const verificationResponse = await verifyWithApple(receipt);
    
    if (verificationResponse.status === 0) {
      // Valid receipt
      const latestReceiptInfo = verificationResponse.latest_receipt_info;
      const latestReceipt = latestReceiptInfo[latestReceiptInfo.length - 1];
      
      // Check if subscription is active
      const expiresDate = new Date(parseInt(latestReceipt.expires_date_ms));
      const isActive = expiresDate > new Date();
      
      if (isActive) {
        // Update user subscription
        await User.findByIdAndUpdate(userId, {
          subscription: {
            status: 'active',
            tier: productId.includes('monthly') ? 'monthly' : 'yearly',
            currentPeriodEnd: expiresDate,
            appleTransactionId: transactionId,
            appleOriginalTransactionId: latestReceipt.original_transaction_id
          },
          hasActiveSubscription: true,
          subscriptionEndDate: expiresDate
        });
        
        // Store transaction
        await CrushTransaction.create({
          userId: userId,
          type: 'subscription',
          amount: 0, // Unlimited crushes
          platform: 'ios',
          transactionId: transactionId,
          productId: productId,
          description: `Subscribed to ${productId.includes('monthly') ? 'monthly' : 'yearly'} unlimited`
        });
        
        res.json({
          success: true,
          subscription: {
            active: true,
            expiresAt: expiresDate
          }
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Subscription is not active'
        });
      }
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid receipt',
        appleStatus: verificationResponse.status
      });
    }
  } catch (error) {
    console.error('Subscription verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify subscription'
    });
  }
}];

// Restore Apple Purchases
export const restorePurchases = [verifyToken, async (req, res) => {
  try {
    const { purchases } = req.body;
    const userId = req.userId;
    let restoredCount = 0;
    
    for (const purchase of purchases) {
      // Check if already processed
      const existing = await CrushTransaction.findOne({ 
        transactionId: purchase.transactionId,
        platform: 'ios'
      });
      
      if (!existing) {
        // Verify and process the purchase
        const verificationResponse = await verifyWithApple(purchase.receipt);
        
        if (verificationResponse.status === 0) {
          // Process based on product type
          if (purchase.productId.includes('crushes')) {
            // Restore crush pack
            const crushAmount = {
              'com.silverfoxmedia.gymcrush.5crushes': 5,
              'com.silverfoxmedia.gymcrush.10crushes': 10,
              'com.silverfoxmedia.gymcrush.25crushes': 25,
            }[purchase.productId] || 0;
            
            if (crushAmount > 0) {
              await User.findByIdAndUpdate(userId, {
                $inc: { crushBalance: crushAmount }
              });
              
              await CrushTransaction.create({
                userId: userId,
                type: 'restore',
                amount: crushAmount,
                platform: 'ios',
                transactionId: purchase.transactionId,
                productId: purchase.productId,
                description: `Restored ${crushAmount} crushes`
              });
              
              restoredCount++;
            }
          } else if (purchase.productId.includes('monthly') || purchase.productId.includes('yearly')) {
            // Restore subscription
            // Handle subscription restoration
            restoredCount++;
          }
        }
      }
    }
    
    res.json({
      success: true,
      restored: restoredCount
    });
  } catch (error) {
    console.error('Restore purchases error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to restore purchases'
    });
  }
}];

// Create Stripe checkout session for crush packages
export const createCheckoutSession = [verifyToken, async (req, res) => {
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
export const createSubscription = [verifyToken, async (req, res) => {
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
export const cancelSubscription = [verifyToken, async (req, res) => {
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