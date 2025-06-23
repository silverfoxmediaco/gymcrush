// Admin Routes
// Path: src/backend/routes/adminRoutes.js
// Purpose: Define admin-related API endpoints

const express = require('express');
const router = express.Router();
const { createMockProfiles } = require('../controllers/adminController');

// POST /api/admin/create-mock-profiles - Create mock user profiles
router.post('/create-mock-profiles', createMockProfiles);

module.exports = router;