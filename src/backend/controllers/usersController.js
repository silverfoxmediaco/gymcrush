// Users Controller
// Path: src/backend/controllers/usersController.js
// Purpose: Handle user profile viewing and filter preferences

import User from '../models/User.js';
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
    req.user = { _id: decoded.userId }; // Add this for compatibility
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// Get a specific user's profile
export const getUserProfile = [verifyToken, async (req, res) => {
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
}];

// Get user activity
export const getUserActivity = [verifyToken, async (req, res) => {
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
}];

// Get user's filter preferences
export const getFilterPreferences = [verifyToken, async (req, res) => {
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
}];

// Update user's filter preferences
export const updateFilterPreferences = [verifyToken, async (req, res) => {
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
}];