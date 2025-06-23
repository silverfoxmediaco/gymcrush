// Auth Validation Rules
// Path: src/backend/validators/authValidator.js
// Purpose: Validation rules for authentication routes

const { body } = require('express-validator');
const { customValidators } = require('../middleware/validation');

// Validation rules for user registration
const validateRegister = [
  // Email validation
  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail()
    .trim()
    .escape(),
  
  // Password validation
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .custom(customValidators.isStrongPassword)
    .trim(),
  
  // Confirm password validation
  body('confirmPassword')
    .notEmpty().withMessage('Please confirm your password')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Passwords do not match'),
  
  // Username validation
  body('username')
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 3, max: 20 }).withMessage('Username must be between 3 and 20 characters')
    .custom(customValidators.isValidUsername)
    .trim()
    .escape(),
  
  // Date of birth validation
  body('dateOfBirth')
    .notEmpty().withMessage('Date of birth is required')
    .isISO8601().withMessage('Invalid date format')
    .custom(customValidators.isAdult)
    .toDate()
];

// Validation rules for user login
const validateLogin = [
  // Email validation
  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail()
    .trim()
    .escape(),
  
  // Password validation
  body('password')
    .notEmpty().withMessage('Password is required')
    .trim()
];

// Validation rules for password reset request
const validatePasswordResetRequest = [
  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail()
    .trim()
    .escape()
];

// Validation rules for password reset
const validatePasswordReset = [
  body('token')
    .notEmpty().withMessage('Reset token is required')
    .isLength({ min: 20 }).withMessage('Invalid reset token')
    .trim()
    .escape(),
  
  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .custom(customValidators.isStrongPassword)
    .trim(),
  
  body('confirmPassword')
    .notEmpty().withMessage('Please confirm your new password')
    .custom((value, { req }) => value === req.body.newPassword)
    .withMessage('Passwords do not match')
];

// Validation rules for email verification
const validateEmailVerification = [
  body('token')
    .notEmpty().withMessage('Verification token is required')
    .isLength({ min: 20 }).withMessage('Invalid verification token')
    .trim()
    .escape()
];

module.exports = {
  validateRegister,
  validateLogin,
  validatePasswordResetRequest,
  validatePasswordReset,
  validateEmailVerification
};