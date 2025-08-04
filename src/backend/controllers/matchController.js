// Updated Match Controller with Complete Filter Implementation
// Path: src/backend/controllers/matchController.js
// Purpose: Handle matching/browsing functionality with all filters

import User from '../models/User.js';
import CrushTransaction from '../models/CrushTransaction.js';
import jwt from 'jsonwebtoken';
import notificationService from '../services/notificationService.js';

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

// GET: Browse profiles with complete filtering
export const getBrowseProfiles = [verifyToken, async (req, res) => {
  try {
    const currentUser = await User.findById(req.userId);

    if (!currentUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    console.log('Current user filter preferences:', currentUser.filterPreferences);

    // Get IDs of users this person already sent crushes to
    const sentCrushUserIds = currentUser.crushes.sent.map(crush => crush.to);

    // Base query - exclude self and already sent crushes
    let filterQuery = {
      _id: {
        $ne: req.userId,
        $nin: sentCrushUserIds
      },
      'profile.bio': { $exists: true, $ne: '' },
      'profile.interests': { $exists: true, $ne: [] }
    };

    // Apply gender filter
    if (currentUser.filterPreferences?.gender?.length > 0) {
      // Convert plural preference to singular for matching
      const genderFilter = currentUser.filterPreferences.gender.map(g => {
        if (g === 'Men') return 'Man';
        if (g === 'Women') return 'Woman';
        return g;
      });
      filterQuery['profile.gender'] = { $in: genderFilter };
      console.log('Applying gender filter:', genderFilter);
    }

    // Apply age filter
    if (currentUser.filterPreferences?.minAge || currentUser.filterPreferences?.maxAge) {
      filterQuery['profile.age'] = {};
      if (currentUser.filterPreferences.minAge) {
        filterQuery['profile.age'].$gte = currentUser.filterPreferences.minAge;
      }
      if (currentUser.filterPreferences.maxAge) {
        filterQuery['profile.age'].$lte = currentUser.filterPreferences.maxAge;
      }
      console.log('Applying age filter:', filterQuery['profile.age']);
    }

    // Apply fitness level filter
    if (currentUser.filterPreferences?.fitnessLevel && 
        currentUser.filterPreferences.fitnessLevel !== 'any') {
      filterQuery['profile.fitnessLevel'] = currentUser.filterPreferences.fitnessLevel;
      console.log('Applying fitness level filter:', currentUser.filterPreferences.fitnessLevel);
    }

    // Apply gym frequency filter
    if (currentUser.filterPreferences?.gymFrequency && 
        currentUser.filterPreferences.gymFrequency !== 'any') {
      filterQuery['profile.gymFrequency'] = currentUser.filterPreferences.gymFrequency;
      console.log('Applying gym frequency filter:', currentUser.filterPreferences.gymFrequency);
    }

    // Apply verified only filter
    if (currentUser.filterPreferences?.verifiedOnly) {
      filterQuery.isVerified = true;
      console.log('Applying verified only filter');
    }

    // Apply has photos filter
    if (currentUser.filterPreferences?.hasPhotosOnly) {
      filterQuery['profile.photos.0'] = { $exists: true };
      console.log('Applying has photos filter');
    }

    // Apply looking for filter - match users looking for similar things
    if (currentUser.filterPreferences?.lookingFor?.length > 0 && 
        !currentUser.filterPreferences.lookingFor.includes('Any')) {
      filterQuery['profile.lookingFor'] = { 
        $in: currentUser.filterPreferences.lookingFor 
      };
      console.log('Applying looking for filter:', currentUser.filterPreferences.lookingFor);
    }

    console.log('Final filter query:', JSON.stringify(filterQuery, null, 2));

    // Get initial results
    let profiles = await User.find(filterQuery)
      .select('-password -email -emailVerificationToken -passwordResetToken')
      .limit(50); // Get more initially, we'll filter further

    console.log(`Found ${profiles.length} profiles before additional filtering`);

    // Apply body type filter in application layer
    if (currentUser.filterPreferences?.bodyTypes?.length > 0 && 
        !currentUser.filterPreferences.bodyTypes.includes('Any')) {
      profiles = profiles.filter(user => 
        currentUser.filterPreferences.bodyTypes.includes(user.profile.bodyType)
      );
      console.log(`After body type filter: ${profiles.length} profiles`);
    }

    // Apply height filter in application layer (since height is stored as string)
    if (currentUser.filterPreferences?.heightMin || currentUser.filterPreferences?.heightMax) {
      const heightToInches = (heightStr) => {
        if (!heightStr) return 0;
        const match = heightStr.match(/(\d+)'(\d+)"/);
        if (match) {
          return parseInt(match[1]) * 12 + parseInt(match[2]);
        }
        return 0;
      };

      const minInches = heightToInches(currentUser.filterPreferences.heightMin);
      const maxInches = heightToInches(currentUser.filterPreferences.heightMax);

      profiles = profiles.filter(user => {
        const profileInches = heightToInches(user.profile.height);
        if (minInches && profileInches < minInches) return false;
        if (maxInches && profileInches > maxInches) return false;
        return true;
      });
      console.log(`After height filter: ${profiles.length} profiles`);
    }

    // Apply distance filter if user has location
    if (currentUser.profile?.coordinates?.coordinates && currentUser.filterPreferences?.distance) {
      // This would require geospatial query - simplified for now
      // In production, you'd use MongoDB's $geoNear aggregation
      console.log('Distance filter requested but requires geospatial query implementation');
    }

    // Limit final results
    profiles = profiles.slice(0, 20);

    // Format the profiles for response
    const formattedProfiles = profiles.map(user => ({
      id: user._id,
      _id: user._id, // Include both for compatibility
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
      prompts: user.profile.prompts || [],
      lookingFor: user.profile.lookingFor || 'Not specified',
      isVerified: user.isVerified || false
    }));

    console.log(`Returning ${formattedProfiles.length} profiles to client`);

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

// POST: Send a crush to another user
export const sendCrush = [verifyToken, async (req, res) => {
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