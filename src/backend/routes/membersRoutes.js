// Members Routes
// Path: src/backend/routes/membersRoutes.js
// Purpose: Public endpoints for displaying members

const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET /api/members/featured - Get featured members for landing page (public)
router.get('/featured', async (req, res) => {
  try {
    // Get total count of users with complete profiles
    const totalCompleteProfiles = await User.countDocuments({
      'profile.bio': { $exists: true, $ne: '' },
      'profile.age': { $exists: true, $ne: null }
    });

    // If we have enough complete profiles, use MongoDB's $sample to get random ones
    if (totalCompleteProfiles >= 3) {
      const members = await User.aggregate([
        {
          $match: {
            'profile.bio': { $exists: true, $ne: '' },
            'profile.age': { $exists: true, $ne: null }
          }
        },
        { $sample: { size: 3 } }, // This randomly selects 3 documents
        {
          $project: {
            password: 0,
            email: 0,
            crushes: 0,
            __v: 0
          }
        }
      ]);

      return res.json({
        success: true,
        members: members
      });
    }

    // If we don't have enough complete profiles, get what we can
    let members = await User.find({
      'profile.bio': { $exists: true, $ne: '' },
      'profile.age': { $exists: true, $ne: null }
    })
    .select('-password -email -crushes -__v')
    .limit(3);

    // If still not enough, get any members (including incomplete profiles)
    if (members.length < 3) {
      const additionalCount = 3 - members.length;
      const excludeIds = members.map(m => m._id);
      
      // Use aggregation with $sample for random selection of additional members
      const additionalMembers = await User.aggregate([
        {
          $match: {
            _id: { $nin: excludeIds }
          }
        },
        { $sample: { size: additionalCount } },
        {
          $project: {
            password: 0,
            email: 0,
            crushes: 0,
            __v: 0
          }
        }
      ]);
      
      members = [...members, ...additionalMembers];
    }

    res.json({
      success: true,
      members: members
    });
  } catch (error) {
    console.error('Featured members error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to retrieve members' 
    });
  }
});

module.exports = router;