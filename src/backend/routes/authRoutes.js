// Auth Routes with Validation
// Path: src/backend/routes/authRoutes.js
// Purpose: Authentication routes with input validation

import express from 'express';
import { 
  register, 
  login,
  forgotPassword,
  resetPassword,
  verifyResetToken
} from '../controllers/authController.js';
import { 
  validateRegister, 
  validateLogin,
  validatePasswordResetRequest,
  validatePasswordReset
} from '../validators/authValidator.js';
import { handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

// POST /api/auth/register - Register new user
router.post(
  '/register',
  validateRegister,           // Apply validation rules
  handleValidationErrors,     // Handle validation errors
  register                    // Controller function
);

// POST /api/auth/login - Login user
router.post(
  '/login',
  validateLogin,              // Apply validation rules
  handleValidationErrors,     // Handle validation errors
  login                       // Controller function
);

// POST /api/auth/forgot-password - Request password reset
router.post(
  '/forgot-password',
  validatePasswordResetRequest,
  handleValidationErrors,
  forgotPassword
);

// POST /api/auth/reset-password - Reset password
router.post(
  '/reset-password',
  validatePasswordReset,
  handleValidationErrors,
  resetPassword
);

// GET /api/auth/verify-reset-token/:token - Verify reset token is valid
router.get('/verify-reset-token/:token', verifyResetToken);

// Future routes:
/*
// POST /api/auth/verify-email - Verify email address
router.post(
  '/verify-email',
  validateEmailVerification,
  handleValidationErrors,
  verifyEmail
);
*/

export default router;