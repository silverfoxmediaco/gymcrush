// Users Routes
// Path: src/backend/routes/usersRoutes.js
// Purpose: Define user-related API endpoints

import express from 'express';
import { 
  getUserProfile,
  getUserActivity,
  getFilterPreferences,
  updateFilterPreferences
} from '../controllers/usersController.js';

const router = express.Router();

// GET /api/users/activity - Get user activity
router.get('/activity', getUserActivity);

// GET /api/users/filter-preferences - Get user's filter preferences
router.get('/filter-preferences', getFilterPreferences);

// PUT /api/users/filter-preferences - Update user's filter preferences
router.put('/filter-preferences', updateFilterPreferences);

// GET /api/users/:userId - Get a specific user's profile
// Note: This must be last because :userId is a catch-all parameter
router.get('/:userId', getUserProfile);

export default router;