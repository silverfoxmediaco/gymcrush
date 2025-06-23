// Crush Routes
// Path: src/backend/routes/crushRoutes.js
// Purpose: Define crush-related API endpoints

const express = require('express');
const router = express.Router();
const { getCrushes } = require('../controllers/crushController');

// GET /api/crushes - Get user's crushes data
router.get('/', getCrushes);

module.exports = router;