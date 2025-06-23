// Updated Auth Controller with Password Reset
// Path: src/backend/controllers/authController.js
// Purpose: Authentication controller with password reset functionality

const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { sendPasswordResetEmail, sendWelcomeEmail } = require('../services/emailService');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// Generate password reset token
const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Register new user
exports.register = async (req, res) => {
  try {
    const { email, password, username, dateOfBirth } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email or username already exists',
      });
    }

    // Create user
    const user = await User.create({
      email,
      password,
      username,
      dateOfBirth,
    });

    // Generate token
    const token = generateToken(user._id);
    
    // Send welcome email (optional - don't let it block registration)
    sendWelcomeEmail(user.email, user.username).catch(err => {
      console.error('Welcome email error:', err);
    });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        accountTier: user.accountTier,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        accountTier: user.accountTier,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// Forgot password - Send reset token
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      // Don't reveal if email exists or not
      return res.json({
        success: true,
        message: 'If an account exists with this email, a password reset link has been sent.',
      });
    }

    // Generate reset token
    const resetToken = generateResetToken();
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Save reset token and expiry to user
    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = Date.now() + 3600000; // 1 hour
    await user.save({ validateBeforeSave: false });

    // Create reset URL
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    // Send password reset email
    const emailResult = await sendPasswordResetEmail(user.email, resetUrl, user.username);
    
    if (!emailResult.success) {
      console.error('Failed to send password reset email:', emailResult.error);
      // Continue anyway - user might still have the token from logs
    }

    res.json({
      success: true,
      message: 'If an account exists with this email, a password reset link has been sent.',
      // Remove these in production - only for development/testing
      ...(process.env.NODE_ENV === 'development' && {
        resetToken: resetToken,
        resetUrl: resetUrl
      })
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing password reset request',
    });
  }
};

// Reset password - Use reset token to change password
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Hash the token to match what's in database
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find user with valid reset token
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token',
      });
    }

    // Update password
    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    
    // IMPORTANT: Use validateModifiedOnly to avoid photo validation issues
    await user.save({ validateModifiedOnly: true });

    // Generate new auth token
    const authToken = generateToken(user._id);

    res.json({
      success: true,
      message: 'Password reset successful',
      token: authToken,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        accountTier: user.accountTier,
      },
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error resetting password',
    });
  }
};

// Verify reset token - Check if token is valid
exports.verifyResetToken = async (req, res) => {
  try {
    const { token } = req.params;

    // Hash the token to match what's in database
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find user with valid reset token
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token',
      });
    }

    res.json({
      success: true,
      message: 'Token is valid',
      email: user.email, // Show email so user knows which account they're resetting
    });
  } catch (error) {
    console.error('Verify token error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying token',
    });
  }
};