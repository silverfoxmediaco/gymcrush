// Match Routes
// Path: src/backend/routes/matchRoutes.js
// Purpose: Define matching/browsing API endpoints

const express = require('express');
const router = express.Router();
const { getBrowseProfiles, sendCrush } = require('../controllers/matchController');

// GET /api/match/browse - Get profiles to browse
router.get('/browse', getBrowseProfiles);

// POST /api/match/send-crush - Send a crush (like) to someone
router.post('/send-crush', sendCrush);

module.exports = router;