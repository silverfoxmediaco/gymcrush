// Users Routes
// Path: src/backend/routes/usersRoutes.js
// Purpose: Define user-related API endpoints

const express = require('express');
const router = express.Router();
const { getUserProfile } = require('../controllers/usersController');

// GET /api/users/:userId - Get a specific user's profile
router.get('/:userId', getUserProfile);

module.exports = router;