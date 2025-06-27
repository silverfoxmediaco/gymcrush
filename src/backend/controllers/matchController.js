// Updated Match Controller with Notifications
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

    // USE filterQuery here, not the hardcoded object
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
      accountTier: currentUser.accountTier
    });
  } catch (error) {
    console.error('Browse profiles error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}];

// POST: Send a crush to another user
exports.sendCrush = [verifyToken, async (req, res) => {
  try {
    const { recipientId } = req.body;

    const sender = await User.findById(req.userId);
    const recipient = await User.findById(recipientId);

    if (!sender || !recipient) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user has crushes available (if not unlimited)
    const hasActiveSubscription = sender.subscription?.status === 'active' && 
      sender.subscription?.currentPeriodEnd > new Date();
    
    if (!hasActiveSubscription && sender.crushBalance <= 0) {
      return res.status(400).json({
        success: false,
        message: 'No crushes available. Please purchase more crushes.'
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

    // Check if recipient already sent a crush to sender (for match detection)
    const recipientSentToSender = recipient.crushes.sent.some(
      crush => crush.to.toString() === req.userId
    );

    // Update sender: add to sent list and decrease crush balance
    const updateData = {
      $push: {
        'crushes.sent': {
          to: recipientId,
          sentAt: new Date()
        }
      }
    };

    // Only decrease balance if not unlimited
    if (!hasActiveSubscription) {
      updateData.$inc = { crushBalance: -1 };
    }

    await User.findByIdAndUpdate(req.userId, updateData, { new: true });

    // Update recipient: add to received list
    await User.findByIdAndUpdate(recipientId, {
      $push: {
        'crushes.received': {
          from: req.userId,
          receivedAt: new Date()
        }
      }
    });

    // Create transaction record
    await CrushTransaction.create({
      userId: req.userId,
      type: 'sent',
      amount: 1,
      change: -1,
      balanceAfter: hasActiveSubscription ? 999999 : sender.crushBalance - 1,
      description: `Sent crush to ${recipient.username}`,
      metadata: {
        recipientId: recipientId,
        recipientName: recipient.username
      }
    });

    // Send notifications
    if (recipientSentToSender) {
      // It's a match! Send match notifications to both users
      await notificationService.sendMatchNotification(req.userId, recipientId);
    } else {
      // Just send crush received notification to recipient
      await notificationService.sendCrushReceivedNotification(req.userId, recipientId);
    }

    res.json({
      success: true,
      message: recipientSentToSender ? 'It\'s a match! 💪🔥' : 'Crush sent successfully!',
      isMatch: recipientSentToSender,
      remainingCrushes: hasActiveSubscription ? 'unlimited' : sender.crushBalance - 1
    });
  } catch (error) {
    console.error('Send crush error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
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