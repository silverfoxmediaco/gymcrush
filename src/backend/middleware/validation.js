// Validation Middleware
// Path: src/backend/middleware/validation.js
// Purpose: Handle request validation and sanitization

const { validationResult } = require('express-validator');
const { ValidationError } = require('./errorHandler');

// Main validation handler middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    // Format errors for better readability
    const formattedErrors = errors.array().map(err => ({
      field: err.path,
      message: err.msg,
      value: err.value
    }));
    
    // Create error message
    const errorMessage = formattedErrors
      .map(err => `${err.field}: ${err.message}`)
      .join(', ');
    
    // If using the error handler system
    if (ValidationError) {
      throw new ValidationError(errorMessage);
    }
    
    // Fallback if error handler not implemented
    return res.status(400).json({
      success: false,
      errors: formattedErrors,
      message: 'Validation failed'
    });
  }
  
  next();
};

// Custom validators
const customValidators = {
  // Check if age is 18+
  isAdult: (dateOfBirth) => {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    if (age < 18) {
      throw new Error('Must be 18 or older to use Wallflower');
    }
    
    return true;
  },
  
  // Check if username is appropriate
  isValidUsername: (username) => {
    // Allow letters, numbers, underscores, and hyphens
    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    
    if (!usernameRegex.test(username)) {
      throw new Error('Username can only contain letters, numbers, underscores, and hyphens');
    }
    
    // Check for inappropriate words (add more as needed)
    const bannedWords = ['admin', 'wallflower', 'moderator', 'support'];
    const lowerUsername = username.toLowerCase();
    
    if (bannedWords.some(word => lowerUsername.includes(word))) {
      throw new Error('Username contains restricted words');
    }
    
    return true;
  },
  
  // Check if password is strong enough
  isStrongPassword: (password) => {
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }
    
    // Optional: Add more password requirements
    // if (!/[A-Z]/.test(password)) {
    //   throw new Error('Password must contain at least one uppercase letter');
    // }
    // if (!/[a-z]/.test(password)) {
    //   throw new Error('Password must contain at least one lowercase letter');
    // }
    // if (!/[0-9]/.test(password)) {
    //   throw new Error('Password must contain at least one number');
    // }
    
    return true;
  },
  
  // Check if interests array is valid
  isValidInterests: (interests) => {
    if (!Array.isArray(interests)) {
      throw new Error('Interests must be an array');
    }
    
    if (interests.length < 3) {
      throw new Error('Please select at least 3 interests');
    }
    
    if (interests.length > 10) {
      throw new Error('Maximum 10 interests allowed');
    }
    
    // Check if all interests are strings
    if (!interests.every(interest => typeof interest === 'string')) {
      throw new Error('All interests must be text');
    }
    
    return true;
  },
  
  // Check if location format is valid
  isValidLocation: (location) => {
    // Basic format: "City, State" or "City, Country"
    const locationRegex = /^[a-zA-Z\s]+,\s*[a-zA-Z\s]+$/;
    
    if (!locationRegex.test(location)) {
      throw new Error('Location format should be "City, State" or "City, Country"');
    }
    
    return true;
  },
  
  // Check if height format is valid
  isValidHeight: (height) => {
    // Format: 5'10" or 6'2"
    const heightRegex = /^[4-7]'(?:1[0-1]|[0-9])"$/;
    
    if (!heightRegex.test(height)) {
      throw new Error('Height format should be like 5\'10"');
    }
    
    return true;
  },
  
  // Sanitize HTML input
  sanitizeHtml: (input) => {
    if (typeof input !== 'string') return input;
    
    // Remove any HTML tags
    return input
      .replace(/<[^>]*>/g, '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  },
  
  // Check if bio is appropriate
  isValidBio: (bio) => {
    if (bio.length < 20) {
      throw new Error('Bio must be at least 20 characters long');
    }
    
    if (bio.length > 500) {
      throw new Error('Bio must not exceed 500 characters');
    }
    
    // Check for excessive caps (more than 50% caps)
    const capsCount = (bio.match(/[A-Z]/g) || []).length;
    if (capsCount > bio.length * 0.5) {
      throw new Error('Please avoid excessive use of capital letters');
    }
    
    // Check for spam patterns
    const urlRegex = /(https?:\/\/|www\.)/gi;
    if (urlRegex.test(bio)) {
      throw new Error('URLs are not allowed in bio');
    }
    
    // Check for repeated characters (like "hiiiiiii")
    const repeatedChars = /(.)\1{4,}/;
    if (repeatedChars.test(bio)) {
      throw new Error('Please avoid excessive repeated characters');
    }
    
    return true;
  },
  
  // Validate MongoDB ObjectId
  isValidObjectId: (id) => {
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    
    if (!objectIdRegex.test(id)) {
      throw new Error('Invalid ID format');
    }
    
    return true;
  },
  
  // Check if prompt answer is valid
  isValidPromptAnswer: (answer) => {
    if (answer.length < 10) {
      throw new Error('Answer must be at least 10 characters');
    }
    
    if (answer.length > 200) {
      throw new Error('Answer must not exceed 200 characters');
    }
    
    return true;
  },
  
  // Validate image file
  isValidImageFile: (file) => {
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    
    if (!allowedMimes.includes(file.mimetype)) {
      throw new Error('Only JPEG, PNG and WebP images are allowed');
    }
    
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Image size must not exceed 5MB');
    }
    
    return true;
  }
};

// Common validation chains for reuse
const commonValidations = {
  // Email validation
  email: {
    notEmpty: {
      errorMessage: 'Email is required'
    },
    isEmail: {
      errorMessage: 'Please provide a valid email'
    },
    normalizeEmail: {
      options: {
        gmail_remove_dots: false,
        gmail_remove_subaddress: false
      }
    },
    trim: true,
    escape: true
  },
  
  // Password validation
  password: {
    notEmpty: {
      errorMessage: 'Password is required'
    },
    isLength: {
      options: { min: 8 },
      errorMessage: 'Password must be at least 8 characters long'
    },
    trim: true
  },
  
  // Username validation
  username: {
    notEmpty: {
      errorMessage: 'Username is required'
    },
    isLength: {
      options: { min: 3, max: 20 },
      errorMessage: 'Username must be between 3 and 20 characters'
    },
    matches: {
      options: /^[a-zA-Z0-9_-]+$/,
      errorMessage: 'Username can only contain letters, numbers, underscores, and hyphens'
    },
    trim: true,
    escape: true
  },
  
  // Age validation
  age: {
    notEmpty: {
      errorMessage: 'Age is required'
    },
    isInt: {
      options: { min: 18, max: 100 },
      errorMessage: 'Age must be between 18 and 100'
    },
    toInt: true
  },
  
  // ObjectId validation
  objectId: {
    notEmpty: {
      errorMessage: 'ID is required'
    },
    matches: {
      options: /^[0-9a-fA-F]{24}$/,
      errorMessage: 'Invalid ID format'
    }
  },
  
  // Text field validation (for bio, messages, etc.)
  textField: (fieldName, minLength = 1, maxLength = 500) => ({
    notEmpty: {
      errorMessage: `${fieldName} is required`
    },
    isLength: {
      options: { min: minLength, max: maxLength },
      errorMessage: `${fieldName} must be between ${minLength} and ${maxLength} characters`
    },
    trim: true,
    escape: true
  })
};

module.exports = {
  handleValidationErrors,
  customValidators,
  commonValidations
};