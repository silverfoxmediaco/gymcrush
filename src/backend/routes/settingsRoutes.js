// Settings Routes
// Path: src/backend/routes/settingsRoutes.js
// Purpose: Handle user settings and account management

import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

// All settings routes require authentication
router.use(authenticate);

// GET /api/settings/account - Get user account settings
router.get('/account', async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Format settings response
    const settings = {
      email: user.email,
      notifications: {
        newMatches: user.notifications?.newMatches ?? true,
        messages: user.notifications?.messages ?? true,
        crushesReceived: user.notifications?.crushesReceived ?? true,
        profileViews: user.notifications?.profileViews ?? false,
        marketingEmails: user.notifications?.marketingEmails ?? false,
      },
      privacy: {
        showOnlineStatus: user.privacy?.showOnlineStatus ?? true,
        showLastActive: user.privacy?.showLastActive ?? true,
        readReceipts: user.privacy?.readReceipts ?? true,
        profileVisibility: user.privacy?.profileVisibility ?? 'everyone',
      }
    };

    res.json({
      success: true,
      settings
    });
  } catch (error) {
    console.error('Error getting account settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching account settings'
    });
  }
});

// PUT /api/settings/email - Update email address
router.put('/email', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Verify current password
    const user = await User.findById(req.userId);
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password'
      });
    }

    // Check if email is already taken
    const existingUser = await User.findOne({ 
      email: email.toLowerCase(),
      _id: { $ne: req.userId }
    });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already in use'
      });
    }

    // Update email
    user.email = email.toLowerCase();
    await user.save();

    res.json({
      success: true,
      message: 'Email updated successfully'
    });
  } catch (error) {
    console.error('Error updating email:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating email'
    });
  }
});

// PUT /api/settings/password - Update password
router.put('/password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current and new passwords are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    const user = await User.findById(req.userId);
    
    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash and save new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating password'
    });
  }
});

// PUT /api/settings/notifications - Update notification preferences
router.put('/notifications', async (req, res) => {
  try {
    const notifications = req.body;
    
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update notification settings
    user.notifications = {
      newMatches: notifications.newMatches ?? true,
      messages: notifications.messages ?? true,
      crushesReceived: notifications.crushesReceived ?? true,
      profileViews: notifications.profileViews ?? false,
      marketingEmails: notifications.marketingEmails ?? false,
    };
    
    await user.save();

    res.json({
      success: true,
      message: 'Notification settings updated',
      notifications: user.notifications
    });
  } catch (error) {
    console.error('Error updating notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating notification settings'
    });
  }
});

// PUT /api/settings/privacy - Update privacy settings
router.put('/privacy', async (req, res) => {
  try {
    const privacy = req.body;
    
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update privacy settings
    user.privacy = {
      showOnlineStatus: privacy.showOnlineStatus ?? true,
      showLastActive: privacy.showLastActive ?? true,
      readReceipts: privacy.readReceipts ?? true,
      profileVisibility: privacy.profileVisibility ?? 'everyone',
    };
    
    await user.save();

    res.json({
      success: true,
      message: 'Privacy settings updated',
      privacy: user.privacy
    });
  } catch (error) {
    console.error('Error updating privacy:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating privacy settings'
    });
  }
});

// DELETE /api/settings/account - Delete account
router.delete('/account', async (req, res) => {
  try {
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required to delete account'
      });
    }

    const user = await User.findById(req.userId);
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password'
      });
    }

    // Delete user account
    // You might want to soft delete instead of hard delete
    await User.findByIdAndDelete(req.userId);
    
    // TODO: Clean up related data (messages, matches, photos, etc.)
    // This should ideally be handled with mongoose middleware or a cleanup service

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting account'
    });
  }
});

export default router;