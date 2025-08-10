// Users Controller
// Path: src/backend/controllers/usersController.js
// Purpose: Handle user profile viewing, filter preferences, and blocking

import User from '../models/User.js';

// Get a specific user's profile
export const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get the requested user's profile
    const user = await User.findById(userId).select('-password -email -crushes');
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Check if current user has sent a crush to this user
    const currentUser = await User.findById(req.userId);
    const crushSent = currentUser.crushes.sent.some(
      crush => crush.to.toString() === userId
    );
    
    res.json({
      success: true,
      user: user,
      crushSent: crushSent
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to retrieve profile' 
    });
  }
};

// Get user activity
export const getUserActivity = async (req, res) => {
  try {
    const userId = req.userId;
    
    const user = await User.findById(userId)
      .select('lastActive crushesRemaining subscription filterPreferences')
      .populate('subscription');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      lastActive: user.lastActive,
      crushesRemaining: user.crushesRemaining,
      subscription: user.subscription,
      filterPreferences: user.filterPreferences
    });
  } catch (error) {
    console.error('Get user activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user activity'
    });
  }
};

// Get user's filter preferences
export const getFilterPreferences = async (req, res) => {
  try {
    const userId = req.userId;
    
    const user = await User.findById(userId).select('filterPreferences');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Default preferences if none exist
    const defaultPreferences = {
      ageRange: { min: 18, max: 50 },
      distance: 25,
      gender: 'everyone',
      fitnessLevel: 'any',
      bodyTypes: ['Any'],
      lookingFor: ['Any'],
      gymFrequency: 'any',
      verifiedOnly: false,
      hasPhotosOnly: true,
    };
    
    // Return user preferences or defaults
    const preferences = user.filterPreferences || defaultPreferences;
    
    res.json({
      success: true,
      preferences
    });
  } catch (error) {
    console.error('Get filter preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve filter preferences'
    });
  }
};

// Update user's filter preferences
export const updateFilterPreferences = async (req, res) => {
  try {
    const userId = req.userId;
    const preferences = req.body;
    
    // Validate preferences
    if (!preferences || typeof preferences !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Invalid preferences data'
      });
    }
    
    // Update user's filter preferences
    const user = await User.findByIdAndUpdate(
      userId,
      { filterPreferences: preferences },
      { new: true, runValidators: true }
    ).select('filterPreferences');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Filter preferences updated successfully',
      preferences: user.filterPreferences
    });
  } catch (error) {
    console.error('Update filter preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update filter preferences',
      error: error.message
    });
  }
};

// ============================================
// BLOCK/UNBLOCK FUNCTIONS
// ============================================

// Block a user
export const blockUser = async (req, res) => {
  try {
    const { userId } = req.params; // User to block
    const blockerId = req.userId; // Current user (from auth middleware)

    // Check if user exists
    const userToBlock = await User.findById(userId);
    if (!userToBlock) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Can't block yourself
    if (userId === blockerId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot block yourself'
      });
    }

    // Add to blocked users list (using $addToSet to prevent duplicates)
    const blocker = await User.findByIdAndUpdate(
      blockerId,
      { 
        $addToSet: { blockedUsers: userId }
      },
      { new: true }
    );

    // Remove any existing crushes between them
    // Remove from sent crushes
    await User.findByIdAndUpdate(
      blockerId,
      {
        $pull: { 'crushes.sent': { to: userId } }
      }
    );

    await User.findByIdAndUpdate(
      userId,
      {
        $pull: { 'crushes.received': { from: blockerId } }
      }
    );

    // Remove reverse crushes as well
    await User.findByIdAndUpdate(
      userId,
      {
        $pull: { 'crushes.sent': { to: blockerId } }
      }
    );

    await User.findByIdAndUpdate(
      blockerId,
      {
        $pull: { 'crushes.received': { from: userId } }
      }
    );

    res.json({
      success: true,
      message: 'User blocked successfully'
    });
  } catch (error) {
    console.error('Block user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to block user'
    });
  }
};

// Unblock a user
export const unblockUser = async (req, res) => {
  try {
    const { userId } = req.params; // User to unblock
    const unblockerId = req.userId; // Current user

    // Remove from blocked users list
    await User.findByIdAndUpdate(
      unblockerId,
      { 
        $pull: { blockedUsers: userId }
      }
    );

    res.json({
      success: true,
      message: 'User unblocked successfully'
    });
  } catch (error) {
    console.error('Unblock user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unblock user'
    });
  }
};

// Get list of blocked users
export const getBlockedUsers = async (req, res) => {
  try {
    const userId = req.userId; // Current user

    const user = await User.findById(userId)
      .populate({
        path: 'blockedUsers',
        select: 'username profile.photos profile.age profile.bio'
      });

    const blockedUsers = user?.blockedUsers || [];

    res.json({
      success: true,
      data: blockedUsers
    });
  } catch (error) {
    console.error('Get blocked users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get blocked users'
    });
  }
};