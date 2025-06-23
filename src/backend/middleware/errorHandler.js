// Custom Error Classes and Error Handling Middleware
// Path: src/backend/middleware/errorHandler.js
// Purpose: Centralized error handling for the application

// Custom Error Class
class AppError extends Error {
    constructor(message, statusCode) {
      super(message);
      this.statusCode = statusCode;
      this.isOperational = true;
      
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  // Specific Error Classes
  class ValidationError extends AppError {
    constructor(message) {
      super(message, 400);
      this.name = 'ValidationError';
    }
  }
  
  class AuthenticationError extends AppError {
    constructor(message = 'Authentication failed') {
      super(message, 401);
      this.name = 'AuthenticationError';
    }
  }
  
  class AuthorizationError extends AppError {
    constructor(message = 'Not authorized') {
      super(message, 403);
      this.name = 'AuthorizationError';
    }
  }
  
  class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
      super(message, 404);
      this.name = 'NotFoundError';
    }
  }
  
  class ConflictError extends AppError {
    constructor(message) {
      super(message, 409);
      this.name = 'ConflictError';
    }
  }
  
  class RateLimitError extends AppError {
    constructor(message = 'Too many requests') {
      super(message, 429);
      this.name = 'RateLimitError';
    }
  }
  
  // Async Error Wrapper - Catches errors in async route handlers
  const catchAsync = (fn) => {
    return (req, res, next) => {
      fn(req, res, next).catch(next);
    };
  };
  
  // Error Logger Middleware
  const errorLogger = (err, req, res, next) => {
    console.error('\n========== ERROR LOG ==========');
    console.error('Time:', new Date().toISOString());
    console.error('Method:', req.method);
    console.error('Path:', req.path);
    console.error('Body:', req.body);
    console.error('Error:', err);
    console.error('Stack:', err.stack);
    console.error('==============================\n');
    
    next(err);
  };
  
  // MongoDB Error Handler
  const handleMongoError = (err) => {
    if (err.code === 11000) {
      // Duplicate key error
      const field = Object.keys(err.keyPattern)[0];
      return new ConflictError(`${field} already exists`);
    }
    
    if (err.name === 'ValidationError') {
      // Mongoose validation error
      const errors = Object.values(err.errors).map(e => e.message);
      return new ValidationError(errors.join(', '));
    }
    
    if (err.name === 'CastError') {
      // Invalid ObjectId
      return new ValidationError('Invalid ID format');
    }
    
    return err;
  };
  
  // Multer Error Handler
  const handleMulterError = (err) => {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return new ValidationError('File size too large. Maximum size is 5MB.');
    }
    
    if (err.code === 'LIMIT_FILE_COUNT') {
      return new ValidationError('Too many files. Maximum is 6 files at once.');
    }
    
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return new ValidationError('Unexpected file field.');
    }
    
    if (err.message && err.message.includes('Invalid file type')) {
      return new ValidationError(err.message);
    }
    
    return err;
  };
  
  // Stripe Error Handler
  const handleStripeError = (err) => {
    if (err.type === 'StripeCardError') {
      return new ValidationError(err.message);
    }
    
    if (err.type === 'StripeInvalidRequestError') {
      return new ValidationError('Invalid payment request');
    }
    
    if (err.type === 'StripeAPIError') {
      return new AppError('Payment service temporarily unavailable', 503);
    }
    
    if (err.type === 'StripeConnectionError') {
      return new AppError('Network error during payment processing', 503);
    }
    
    if (err.type === 'StripeAuthenticationError') {
      console.error('Stripe authentication error - check API keys');
      return new AppError('Payment configuration error', 500);
    }
    
    return err;
  };
  
  // JWT Error Handler
  const handleJWTError = (err) => {
    if (err.name === 'JsonWebTokenError') {
      return new AuthenticationError('Invalid token');
    }
    
    if (err.name === 'TokenExpiredError') {
      return new AuthenticationError('Token expired');
    }
    
    return err;
  };
  
  // Main Error Handler Middleware
  const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;
    error.stack = err.stack;
    
    // Handle specific error types
    if (err.name === 'MongoError' || err.name === 'ValidationError' || err.name === 'CastError') {
      error = handleMongoError(err);
    }
    
    if (err.name === 'MulterError' || (err.message && err.message.includes('file'))) {
      error = handleMulterError(err);
    }
    
    if (err.type && err.type.includes('Stripe')) {
      error = handleStripeError(err);
    }
    
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      error = handleJWTError(err);
    }
    
    // Default to 500 server error
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';
    
    // Send error response
    res.status(statusCode).json({
      success: false,
      error: {
        message: message,
        statusCode: statusCode,
        ...(process.env.NODE_ENV === 'development' && {
          stack: error.stack,
          details: error
        })
      }
    });
  };
  
  // 404 Handler - Must be placed after all other routes
  const notFoundHandler = (req, res, next) => {
    const error = new NotFoundError(`Route ${req.originalUrl} not found`);
    next(error);
  };
  
  module.exports = {
    // Error classes
    AppError,
    ValidationError,
    AuthenticationError,
    AuthorizationError,
    NotFoundError,
    ConflictError,
    RateLimitError,
    
    // Middleware
    catchAsync,
    errorLogger,
    errorHandler,
    notFoundHandler
  };