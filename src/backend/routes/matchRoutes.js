// Match Routes
// Path: src/backend/routes/matchRoutes.js
// Purpose: Define matching/browsing API endpoints

import express from 'express';
import { getBrowseProfiles, sendCrush } from '../controllers/matchController.js';

const router = express.Router();

// GET /api/match/browse - Get profiles to browse
router.get('/browse', getBrowseProfiles);

// POST /api/match/send-crush - Send a crush (like) to someone
router.post('/send-crush', sendCrush);

export default router;