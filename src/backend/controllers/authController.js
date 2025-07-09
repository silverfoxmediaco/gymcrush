// authController.js
// Path: src/backend/controllers/authController.js
// Purpose: Authentication controller with password reset functionality

import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { sendPasswordResetEmail, sendWelcomeEmail } from '../services/emailService.js';

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
export const register = async (req, res) => {
  try {
    const { email, password, username, dateOfBirth } = req.body;

    // Validate required fields
    if (!email || !password || !username || !dateOfBirth) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email, password, username, and date of birth',
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email',
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    // Validate date of birth - user must be 18+
    const dob = new Date(dateOfBirth);
    const today = new Date();
    const age = Math.floor((today - dob) / (365.25 * 24 * 60 * 60 * 1000));
    
    if (age < 18) {
      return res.status(400).json({
        success: false,
        message: 'You must be at least 18 years old to register',
      });
    }

    if (age > 100) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid date of birth',
      });
    }

    // Check if user exists (case-insensitive)
    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase() }, 
        { username: { $regex: new RegExp(`^${username}$`, 'i') } }
      ],
    });

    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
        return res.status(400).json({
          success: false,
          message: 'Email already registered',
        });
      } else {
        return res.status(400).json({
          success: false,
          message: 'Username already taken',
        });
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user with initial profile data
    const user = await User.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      username,
      dateOfBirth: dob,
      crushBalance: 5, // Give new users 5 free crushes
      profile: {
        age: age,
        photos: [],
        interests: [],
        prompts: []
      }
    });

    // Generate token
    const token = generateToken(user._id);
    
    // Send welcome email (optional - don't let it block registration)
    if (sendWelcomeEmail) {
      sendWelcomeEmail(user.email, user.username).catch(err => {
        console.error('Welcome email error:', err);
      });
    }

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        dateOfBirth: user.dateOfBirth,
        crushBalance: user.crushBalance,
        age: age
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Find user and include password field
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Calculate current age from DOB
    const today = new Date();
    const birthDate = new Date(user.dateOfBirth);
    const age = Math.floor((today - birthDate) / (365.25 * 24 * 60 * 60 * 1000));

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        dateOfBirth: user.dateOfBirth,
        crushBalance: user.crushBalance,
        age: age
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
    });
  }
};

// Forgot password - Send reset token
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email',
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Don't reveal if email exists or not for security
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
    try {
      if (sendPasswordResetEmail) {
        await sendPasswordResetEmail(user.email, resetUrl, user.username);
      }
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      // Continue anyway - don't expose email failures to user
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
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Validate new password
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

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

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    
    // Save user with new password
    await user.save({ validateModifiedOnly: true });

    // Calculate current age from DOB
    const today = new Date();
    const birthDate = new Date(user.dateOfBirth);
    const age = Math.floor((today - birthDate) / (365.25 * 24 * 60 * 60 * 1000));

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
        dateOfBirth: user.dateOfBirth,
        crushBalance: user.crushBalance,
        age: age
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
export const verifyResetToken = async (req, res) => {
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

// Get current user
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .select('-password -passwordResetToken -passwordResetExpires');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Calculate current age from DOB
    const today = new Date();
    const birthDate = new Date(user.dateOfBirth);
    const age = Math.floor((today - birthDate) / (365.25 * 24 * 60 * 60 * 1000));

    res.status(200).json({
      success: true,
      user: {
        ...user.toObject(),
        age: age
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};