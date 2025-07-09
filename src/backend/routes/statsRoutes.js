// Stats Routes
// Path: src/backend/routes/statsRoutes.js
// Purpose: Public statistics endpoints

import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// GET /api/stats/members - Get member statistics (public endpoint)
router.get('/members', async (req, res) => {
  try {
    // Get total member count
    const totalMembers = await User.countDocuments();
    
    // Get members who joined in the last 7 days
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const newThisWeek = await User.countDocuments({
      createdAt: { $gte: oneWeekAgo }
    });
    
    // Get users who have both sent and received crushes (matches)
    const successStories = await User.countDocuments({
      $and: [
        { 'crushes.sent.0': { $exists: true } },
        { 'crushes.received.0': { $exists: true } }
      ]
    });
    
    // Get users who have sent at least one crush (active members)
    const activeMembers = await User.countDocuments({
      'crushes.sent.0': { $exists: true }
    });
    
    res.json({
      success: true,
      stats: {
        total: totalMembers.toString(),
        newThisWeek: newThisWeek.toString(),
        successStories: successStories.toString(),
        activeMembers: activeMembers.toString()
      }
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to retrieve stats' 
    });
  }
});

export default router;