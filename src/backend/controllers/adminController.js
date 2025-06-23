// Admin Controller
// Path: src/backend/controllers/adminController.js
// Purpose: Handle admin operations like creating mock profiles

const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Middleware to verify JWT token and check if admin
const verifyAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    
    // For now, we'll allow any authenticated user to create mock profiles
    // In production, you'd check if the user is an admin
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// Create mock profiles
exports.createMockProfiles = [verifyAdmin, async (req, res) => {
  try {
    const { profiles } = req.body;
    
    if (!profiles || !Array.isArray(profiles)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid profiles data' 
      });
    }
    
    let created = 0;
    let skipped = 0;
    const errors = [];
    
    for (const profile of profiles) {
      try {
        // Check if user already exists
        const existingUser = await User.findOne({ 
          $or: [
            { email: profile.email },
            { username: profile.username }
          ]
        });
        
        if (existingUser) {
          skipped++;
          continue;
        }
        
        // Create the user
        await User.create(profile);
        created++;
      } catch (error) {
        errors.push(`Failed to create ${profile.username}: ${error.message}`);
      }
    }
    
    res.json({
      success: true,
      message: 'Mock profiles creation completed',
      created,
      skipped,
      total: profiles.length,
      errors: errors.length > 0 ? errors : undefined
    });
    
  } catch (error) {
    console.error('Create mock profiles error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while creating profiles' 
    });
  }
}];