// Users Routes
// Path: src/backend/routes/usersRoutes.js
// Purpose: Define user-related API endpoints

import express from 'express';
import { getUserProfile } from '../controllers/usersController.js';

const router = express.Router();

// GET /api/users/:userId - Get a specific user's profile
router.get('/:userId', getUserProfile);

export default router;