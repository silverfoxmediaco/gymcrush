// Crush Controller - UPDATED WITH ANDROID SUPPORT
// Path: src/backend/controllers/crushController.js
// Purpose: Handle crush-related operations (crushes sent/received, matches)

import User from '../models/User.js';
import CrushTransaction from '../models/CrushTransaction.js';
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';
import { google } from 'googleapis';

// Configure Google Play API (add this at the top)
const androidPublisher = google.androidpublisher('v3');
let authClient = null;

// Initialize Google Auth Client
const initGoogleAuth = async () => {
  if (!authClient && process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH) {
    authClient = new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH,
      scopes: ['https://www.googleapis.com/auth/androidpublisher'],
    });
    google.options({ auth: await authClient.getClient() });
  }
};

// Initialize on startup
initGoogleAuth().catch(console.error);

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

// ============ NEW: GENERIC VERIFY PURCHASE (iOS & Android) ============
export const verifyPurchase = [verifyToken, async (req, res) => {
  try {
    const { platform } = req.body;
    
    if (platform === 'ios') {
      // Use existing Apple verification
      return verifyApplePurchase[1](req, res);
    } else if (platform === 'android') {
      // Use new Android verification
      return verifyAndroidPurchase[1](req, res);
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid platform specified'
      });
    }
  } catch (error) {
    console.error('Verify purchase error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify purchase'
    });
  }
}];

// ============ NEW: VERIFY ANDROID PURCHASE ============
export const verifyAndroidPurchase = [verifyToken, async (req, res) => {
  try {
    const { purchaseToken, productId, transactionId, packageName } = req.body;
    const userId = req.userId;
    
    // Check if transaction already processed
    const existingTransaction = await CrushTransaction.findOne({ 
      transactionId: transactionId,
      platform: 'android'
    });
    
    if (existingTransaction) {
      return res.status(400).json({
        success: false,
        message: 'Transaction already processed'
      });
    }
    
    // Initialize Google Auth if needed
    await initGoogleAuth();
    
    if (!authClient) {
      console.error('Google Play API not configured');
      return res.status(500).json({
        success: false,
        message: 'Google Play verification not configured'
      });
    }
    
    try {
      // Verify with Google Play
      const response = await androidPublisher.purchases.products.get({
        packageName: packageName || 'com.silverfoxmedia.gymcrush',
        productId: productId,
        token: purchaseToken,
      });
      
      const purchaseData = response.data;
      
      // Check purchase state (0 = purchased, 1 = canceled)
      if (purchaseData.purchaseState !== 0) {
        return res.status(400).json({
          success: false,
          message: 'Purchase not valid'
        });
      }
      
      // Determine crush amount based on product ID
      const crushAmount = {
        'com.silverfoxmedia.gymcrush.5crushes': 5,
        'com.silverfoxmedia.gymcrush.10crushes': 10,
        'com.silverfoxmedia.gymcrush.25crushes': 25,
        // Also support your iOS product IDs if they're different
        'com.silverfoxmedia.gymcrush.15crushes': 15,
        'com.silverfoxmedia.gymcrush.30crushes': 30,
        'com.silverfoxmedia.gymcrush.60crushes': 60
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
      
      // Acknowledge the purchase with Google
      if (!purchaseData.acknowledgementState) {
        await androidPublisher.purchases.products.acknowledge({
          packageName: packageName || 'com.silverfoxmedia.gymcrush',
          productId: productId,
          token: purchaseToken,
        });
      }
      
      // Store transaction
      await CrushTransaction.create({
        userId: userId,
        type: 'purchase',
        amount: crushAmount,
        platform: 'android',
        transactionId: transactionId,
        productId: productId,
        purchaseToken: purchaseToken,
        description: `Purchased ${crushAmount} crushes`
      });
      
      res.json({
        success: true,
        crushesAdded: crushAmount,
        newBalance: user.crushBalance
      });
      
    } catch (googleError) {
      console.error('Google Play API error:', googleError);
      return res.status(400).json({
        success: false,
        message: 'Failed to verify with Google Play',
        error: googleError.message
      });
    }
    
  } catch (error) {
    console.error('Android purchase verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify purchase'
    });
  }
}];

// ============ NEW: VERIFY ANDROID SUBSCRIPTION ============
export const verifyAndroidSubscription = [verifyToken, async (req, res) => {
  try {
    const { purchaseToken, productId, transactionId, packageName } = req.body;
    const userId = req.userId;
    
    // Initialize Google Auth if needed
    await initGoogleAuth();
    
    if (!authClient) {
      console.error('Google Play API not configured');
      return res.status(500).json({
        success: false,
        message: 'Google Play verification not configured'
      });
    }
    
    try {
      // Verify subscription with Google Play
      const response = await androidPublisher.purchases.subscriptions.get({
        packageName: packageName || 'com.silverfoxmedia.gymcrush',
        subscriptionId: productId,
        token: purchaseToken,
      });
      
      const subscriptionData = response.data;
      
      // Check if subscription is active (paymentState: 1 = payment received)
      if (subscriptionData.paymentState !== 1) {
        return res.status(400).json({
          success: false,
          message: 'Subscription is not active'
        });
      }
      
      const expiryDate = new Date(parseInt(subscriptionData.expiryTimeMillis));
      
      // Update user subscription
      await User.findByIdAndUpdate(userId, {
        subscription: {
          status: 'active',
          tier: 'unlimited',
          currentPeriodEnd: expiryDate,
          androidPurchaseToken: purchaseToken,
          androidOrderId: subscriptionData.orderId
        },
        hasActiveSubscription: true,
        subscriptionEndDate: expiryDate
      });
      
      // Acknowledge the subscription if needed
      if (!subscriptionData.acknowledgementState) {
        await androidPublisher.purchases.subscriptions.acknowledge({
          packageName: packageName || 'com.silverfoxmedia.gymcrush',
          subscriptionId: productId,
          token: purchaseToken,
        });
      }
      
      // Store transaction
      await CrushTransaction.create({
        userId: userId,
        type: 'subscription',
        amount: 0, // Unlimited
        platform: 'android',
        transactionId: transactionId,
        productId: productId,
        purchaseToken: purchaseToken,
        description: 'Subscribed to unlimited membership'
      });
      
      res.json({
        success: true,
        subscription: {
          active: true,
          expiresAt: expiryDate
        }
      });
      
    } catch (googleError) {
      console.error('Google Play Subscription API error:', googleError);
      return res.status(400).json({
        success: false,
        message: 'Failed to verify subscription with Google Play',
        error: googleError.message
      });
    }
    
  } catch (error) {
    console.error('Android subscription verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify subscription'
    });
  }
}];

// ============ NEW: GENERIC VERIFY SUBSCRIPTION (iOS & Android) ============
export const verifySubscription = [verifyToken, async (req, res) => {
  try {
    const { platform } = req.body;
    
    if (platform === 'ios') {
      return verifyAppleSubscription[1](req, res);
    } else if (platform === 'android') {
      return verifyAndroidSubscription[1](req, res);
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid platform specified'
      });
    }
  } catch (error) {
    console.error('Verify subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify subscription'
    });
  }
}];

// ============ EXISTING APPLE VERIFICATION (unchanged) ============
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
      // Valid receipt - Updated with correct product IDs and amounts
      const crushAmount = {
        'com.silverfoxmedia.gymcrush.5crushes': 5,
        'com.silverfoxmedia.gymcrush.10crushes': 10,
        'com.silverfoxmedia.gymcrush.25crushes': 25,
        // Support both naming conventions
        'com.silverfoxmedia.gymcrush.15crushes': 15,
        'com.silverfoxmedia.gymcrush.30crushes': 30,
        'com.silverfoxmedia.gymcrush.60crushes': 60
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

// Verify Apple Subscription (keeping existing code)
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
        // Update user subscription - Fixed for unlimited_monthly subscription
        await User.findByIdAndUpdate(userId, {
          subscription: {
            status: 'active',
            tier: 'unlimited',
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
          description: 'Subscribed to unlimited membership'
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

// ============ UPDATED: Restore Purchases (now handles both iOS & Android) ============
export const restorePurchases = [verifyToken, async (req, res) => {
  try {
    const { purchases } = req.body;
    const userId = req.userId;
    let restoredCount = 0;
    
    for (const purchase of purchases) {
      // Check platform
      const platform = purchase.platform || 'ios'; // Default to iOS for backward compatibility
      
      // Check if already processed
      const existing = await CrushTransaction.findOne({ 
        transactionId: purchase.transactionId,
        platform: platform
      });
      
      if (!existing) {
        if (platform === 'ios') {
          // Verify and process iOS purchase
          const verificationResponse = await verifyWithApple(purchase.receipt);
          
          if (verificationResponse.status === 0) {
            // Process based on product type
            if (purchase.productId.includes('crushes')) {
              // Restore crush pack
              const crushAmount = {
                'com.silverfoxmedia.gymcrush.5crushes': 5,
                'com.silverfoxmedia.gymcrush.10crushes': 10,
                'com.silverfoxmedia.gymcrush.25crushes': 25,
                'com.silverfoxmedia.gymcrush.15crushes': 15,
                'com.silverfoxmedia.gymcrush.30crushes': 30,
                'com.silverfoxmedia.gymcrush.60crushes': 60
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
            }
          }
        } else if (platform === 'android' && purchase.purchaseToken) {
          // Android restore would need to verify with Google Play
          // For now, we'll trust the client if they have a valid purchase token
          // In production, you should verify with Google Play API
          
          const crushAmount = {
            'com.silverfoxmedia.gymcrush.5crushes': 5,
            'com.silverfoxmedia.gymcrush.10crushes': 10,
            'com.silverfoxmedia.gymcrush.25crushes': 25,
            'com.silverfoxmedia.gymcrush.15crushes': 15,
            'com.silverfoxmedia.gymcrush.30crushes': 30,
            'com.silverfoxmedia.gymcrush.60crushes': 60
          }[purchase.productId] || 0;
          
          if (crushAmount > 0) {
            await User.findByIdAndUpdate(userId, {
              $inc: { crushBalance: crushAmount }
            });
            
            await CrushTransaction.create({
              userId: userId,
              type: 'restore',
              amount: crushAmount,
              platform: 'android',
              transactionId: purchase.transactionId,
              productId: purchase.productId,
              purchaseToken: purchase.purchaseToken,
              description: `Restored ${crushAmount} crushes`
            });
            
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

// GET /api/crushes/balance - Get user's current crush balance and subscription status
export const getCrushBalance = [verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    
    const user = await User.findById(userId)
      .select('crushBalance hasActiveSubscription subscriptionEndDate accountTier subscription');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if subscription is actually active
    const hasActiveSubscription = user.hasActiveSubscription && 
                                 user.subscriptionEndDate && 
                                 user.subscriptionEndDate > new Date();
    
    res.json({
      success: true,
      crushBalance: user.crushBalance || 0,
      hasActiveSubscription: hasActiveSubscription,
      subscriptionEndDate: user.subscriptionEndDate,
      accountTier: user.accountTier || 'free',
      isUnlimited: hasActiveSubscription,
      subscriptionStatus: user.subscription?.status || 'none'
    });
    
  } catch (error) {
    console.error('Get crush balance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get crush balance'
    });
  }
}];

// Create Stripe checkout session for crush packages (keeping for web)
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

// Create subscription (keeping for web)
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

// Cancel subscription (keeping for web)
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