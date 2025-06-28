// Updated Match Controller with Notifications - SIMPLIFIED VERSION
// Path: src/backend/controllers/matchController.js
// Purpose: Handle matching/browsing functionality with email notifications

const User = require('../models/User');
const CrushTransaction = require('../models/CrushTransaction');
const jwt = require('jsonwebtoken');
const notificationService = require('../services/notificationService');

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

// GET: Browse profiles
exports.getBrowseProfiles = [verifyToken, async (req, res) => {
  try {
    const currentUser = await User.findById(req.userId);

    const sentCrushUserIds = currentUser.crushes.sent.map(crush => crush.to);

    let filterQuery = {
      _id: {
        $ne: req.userId,
        $nin: sentCrushUserIds
      },
      'profile.bio': { $exists: true, $ne: '' },
      'profile.interests': { $exists: true, $ne: [] }
    };

    if (currentUser.filterPreferences?.gender?.length > 0 && 
      !currentUser.filterPreferences.gender.includes('Other')) {
      // Convert plural preference to singular for matching
      const genderFilter = currentUser.filterPreferences.gender.map(g => {
        if (g === 'Men') return 'Man';
        if (g === 'Women') return 'Woman';
        return g;
      });
      filterQuery['profile.gender'] = { $in: genderFilter };
    }

    const profiles = await User.find(filterQuery)
      .select('-password -email')
      .limit(10);

    const formattedProfiles = profiles.map(user => ({
      id: user._id,
      username: user.username,
      age: user.profile.age || 'Not specified',
      gender: user.profile.gender || 'Not specified',
      height: user.profile.height || 'Not specified',
      bodyType: user.profile.bodyType || 'Not specified',
      location: user.profile.location || 'Location not set',
      bio: user.profile.bio,
      interests: user.profile.interests,
      photos: user.profile.photos || [],
      lastActive: 'Recently active',
      fitnessLevel: user.profile.fitnessLevel || 'Not specified',
      workoutPreferences: user.profile.workoutPreferences || [],
      gymFrequency: user.profile.gymFrequency || 'Not specified',
      prompts: user.profile.prompts || []
    }));

    res.json({
      success: true,
      profiles: formattedProfiles,
      accountTier: currentUser.accountTier,
      crushBalance: Math.max(0, currentUser.crushBalance || 0),
      hasActiveSubscription: currentUser.subscription?.status === 'active'
    });
  } catch (error) {
    console.error('Browse profiles error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}];

// POST: Send a crush to another user - SIMPLIFIED VERSION
exports.sendCrush = [verifyToken, async (req, res) => {
  try {
    const { recipientId } = req.body;
    const senderId = req.userId;

    console.log('Send crush request:', { senderId, recipientId });

    // Get sender
    const sender = await User.findById(senderId);
    if (!sender) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user has crushes available or active subscription
    const hasActiveSubscription = sender.subscription?.status === 'active' && 
                                 sender.subscription?.currentPeriodEnd > new Date();
    
    const currentBalance = sender.crushBalance || 0;
    
    console.log('Sender crush status:', { hasActiveSubscription, currentBalance });
    
    if (!hasActiveSubscription && currentBalance <= 0) {
      return res.status(400).json({
        success: false,
        message: 'You need crushes to send. Please purchase more crushes or subscribe for unlimited!',
        needsCrushes: true,
        balance: 0
      });
    }

    // Check if already sent a crush to this user
    const alreadySent = sender.crushes.sent.some(
      crush => crush.to.toString() === recipientId
    );

    if (alreadySent) {
      return res.status(400).json({
        success: false,
        message: 'Crush already sent to this user'
      });
    }

    // Check if recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: 'Recipient not found'
      });
    }

    // Check if recipient already sent a crush to sender (for match detection)
    const recipientSentToSender = recipient.crushes.sent.some(
      crush => crush.to.toString() === senderId
    );

    // Update sender: add to sent list and decrease crush balance if not unlimited
    const updateData = {
      $push: {
        'crushes.sent': {
          to: recipientId,
          sentAt: new Date()
        }
      }
    };

    // Only decrease crush balance if user doesn't have active subscription
    if (!hasActiveSubscription) {
      updateData.$inc = { crushBalance: -1 };
    }

    const updatedSender = await User.findByIdAndUpdate(
      senderId,
      updateData,
      { new: true }
    );

    // Update recipient: add to received list
    await User.findByIdAndUpdate(recipientId, {
      $push: {
        'crushes.received': {
          from: senderId,
          receivedAt: new Date()
        }
      }
    });

    // Create transaction record
    try {
      await CrushTransaction.create({
        userId: senderId,
        type: 'sent',
        action: 'sent',
        amount: 1,
        change: -1,
        balanceAfter: hasActiveSubscription ? 999999 : Math.max(0, updatedSender.crushBalance),
        recipientId: recipientId,
        recipientName: recipient.username,
        description: `Sent crush to ${recipient.username}`
      });
    } catch (txError) {
      console.error('Transaction creation error:', txError);
      // Don't fail the whole operation if transaction logging fails
    }

    // Send notifications (don't await to avoid blocking response)
    try {
      if (recipientSentToSender) {
        // It's a match! Send match notifications to both users
        notificationService.sendMatchNotification(senderId, recipientId).catch(console.error);
      } else {
        // Just send crush received notification to recipient
        notificationService.sendCrushReceivedNotification(senderId, recipientId).catch(console.error);
      }
    } catch (notifError) {
      console.error('Notification error:', notifError);
      // Don't fail the operation if notifications fail
    }

    res.json({
      success: true,
      message: recipientSentToSender ? 'It\'s a match! 💪🔥' : 'Crush sent successfully!',
      isMatch: recipientSentToSender,
      remainingCrushes: hasActiveSubscription ? 'unlimited' : Math.max(0, updatedSender.crushBalance)
    });

  } catch (error) {
    console.error('Send crush error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error occurred. Please try again.',
      error: error.message 
    });
  }
}];

// Helper function to check crush sending limits based on tier
async function checkCrushLimit(user) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  // Count crushes sent today
  const crushesToday = user.crushes.sent.filter(crush => 
    new Date(crush.sentAt) >= today
  ).length;
  
  // Define limits by tier
  const tierLimits = {
    free: 5,      // 5 crushes per day
    basic: 15,    // 15 crushes per day
    premium: 50,  // 50 crushes per day
    elite: -1     // Unlimited
  };
  
  const limit = tierLimits[user.accountTier] || tierLimits.free;
  
  if (limit === -1 || crushesToday < limit) {
    return { allowed: true };
  }
  
  return { 
    allowed: false, 
    message: `Daily crush limit reached. Upgrade to ${user.accountTier === 'free' ? 'Basic' : 'Premium'} for more crushes!`
  };
}