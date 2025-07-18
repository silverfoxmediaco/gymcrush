// Updated Profile Routes with Notification Settings and Username Route
// Path: src/backend/routes/profileRoutes.js
// Purpose: Define profile-related API endpoints including notification preferences and username-based profile viewing

import express from 'express';
import jwt from 'jsonwebtoken';
import { 
  getProfile, 
  updateProfile, 
  uploadPhotos, 
  deletePhoto,
  updatePhotoDisplayMode,
  getAllProfiles
} from '../controllers/profileController.js';
import User from '../models/User.js';

const router = express.Router();

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

//NEW: GET /api/profile/all - Get all user profiles (no match filter)
router.get('/all', getAllProfiles);

// GET /api/profile - Get current user's profile
router.get('/', getProfile);

// PUT /api/profile - Update current user's profile
router.put('/', updateProfile);

// GET /api/profile/user/:username - Get profile by username
router.get('/user/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    // Find user by username (case-insensitive)
    const user = await User.findOne({ 
      username: { $regex: new RegExp(`^${username}$`, 'i') } 
    })
    .select('-password -email -resetPasswordToken -resetPasswordExpires -stripeCustomerId -stripeSubscriptionId');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      profile: user
    });
    
  } catch (error) {
    console.error('Get profile by username error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load profile'
    });
  }
});

// GET /api/profile/filters - Get filter preferences
router.get('/filters', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('filterPreferences');
    
    res.json({ 
      success: true, 
      filters: {
        ageMin: user?.filterPreferences?.minAge || 18,
        ageMax: user?.filterPreferences?.maxAge || 99,
        distance: user?.filterPreferences?.distance || 50,
        gender: user?.filterPreferences?.gender || [],
        lookingFor: user?.filterPreferences?.lookingFor || [],
        heightMin: user?.filterPreferences?.heightMin || '',
        heightMax: user?.filterPreferences?.heightMax || '',
      }
    });
  } catch (error) {
    console.error('Get filter preferences error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get filter preferences' 
    });
  }
});

// PUT /api/profile/filters - Update filter preferences
router.put('/filters', verifyToken, async (req, res) => {
  try {
    const { 
      ageMin, 
      ageMax, 
      distance, 
      gender, 
      lookingFor,
      heightMin,
      heightMax,
      interests 
    } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.userId,
      { 
        filterPreferences: {
          minAge: ageMin || 18,
          maxAge: ageMax || 100,
          distance: distance || 50,
          gender: gender || [],
          lookingFor: lookingFor || [],
          heightMin: heightMin || '',
          heightMax: heightMax || '',
          interests: interests || []
        }
      },
      { new: true }
    ).select('filterPreferences');
    
    res.json({ 
      success: true, 
      message: 'Filter preferences updated',
      filters: user.filterPreferences
    });
  } catch (error) {
    console.error('Update filter preferences error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update filter preferences' 
    });
  }
});

// POST /api/profile/geocode - Geocode a location
router.post('/geocode', verifyToken, async (req, res) => {
  try {
    const { location } = req.body;
    
    if (!location) {
      return res.status(400).json({ 
        success: false, 
        message: 'Location is required' 
      });
    }
    
    // Add a User-Agent header as required by Nominatim
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1`,
      {
        headers: {
          'User-Agent': 'GymCrush/1.0'
        }
      }
    );
    
    const data = await response.json();
    
    if (data && data[0]) {
      res.json({
        success: true,
        coordinates: [parseFloat(data[0].lon), parseFloat(data[0].lat)]
      });
    } else {
      res.json({
        success: false,
        message: 'Location not found'
      });
    }
  } catch (error) {
    console.error('Geocoding error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to geocode location' 
    });
  }
});

// POST /api/profile/reverse-geocode - Reverse geocode coordinates
router.post('/reverse-geocode', verifyToken, async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    
    if (!latitude || !longitude) {
      return res.status(400).json({ 
        success: false, 
        message: 'Coordinates are required' 
      });
    }
    
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
      {
        headers: {
          'User-Agent': 'GymCrush/1.0'
        }
      }
    );
    
    const data = await response.json();
    
    if (data && data.address) {
      const city = data.address.city || data.address.town || data.address.village;
      const state = data.address.state;
      const displayLocation = `${city}, ${state}`;
      
      res.json({
        success: true,
        location: displayLocation
      });
    } else {
      res.json({
        success: false,
        message: 'Could not determine location'
      });
    }
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to reverse geocode' 
    });
  }
});

// GET /api/profile/notifications - Get notification preferences
router.get('/notifications', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('profile.notifications');
    
    res.json({ 
      success: true, 
      notifications: user?.profile?.notifications || {
        emailEnabled: true,
        crushReceived: true,
        newMessage: true,
        newMatch: true,
        premiumExpiring: true,
        marketing: false
      }
    });
  } catch (error) {
    console.error('Get notification preferences error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get notification preferences' 
    });
  }
});

// PUT /api/profile/notifications - Update notification preferences
router.put('/notifications', verifyToken, async (req, res) => {
  try {
    const { notifications } = req.body;
    
    if (!notifications) {
      return res.status(400).json({
        success: false,
        message: 'Notification preferences are required'
      });
    }
    
    const validKeys = ['emailEnabled', 'crushReceived', 'newMessage', 'newMatch', 'premiumExpiring', 'marketing'];
    const providedKeys = Object.keys(notifications);
    const invalidKeys = providedKeys.filter(key => !validKeys.includes(key));
    
    if (invalidKeys.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid notification settings: ${invalidKeys.join(', ')}`
      });
    }
    
    const user = await User.findByIdAndUpdate(
      req.userId,
      { 
        'profile.notifications': {
          emailEnabled: notifications.emailEnabled !== undefined ? notifications.emailEnabled : true,
          crushReceived: notifications.crushReceived !== undefined ? notifications.crushReceived : true,
          newMessage: notifications.newMessage !== undefined ? notifications.newMessage : true,
          newMatch: notifications.newMatch !== undefined ? notifications.newMatch : true,
          premiumExpiring: notifications.premiumExpiring !== undefined ? notifications.premiumExpiring : true,
          marketing: notifications.marketing !== undefined ? notifications.marketing : false
        }
      },
      { new: true, runValidators: true }
    ).select('profile.notifications');
    
    res.json({ 
      success: true, 
      message: 'Notification preferences updated successfully',
      notifications: user.profile.notifications
    });
  } catch (error) {
    console.error('Update notification preferences error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update notification preferences' 
    });
  }
});

// POST /api/profile/photos - Upload photos
router.post('/photos', uploadPhotos);

// DELETE /api/profile/photos/:photoId - Delete a specific photo
router.delete('/photos/:photoId', deletePhoto);

// PATCH /api/profile/photos/:photoId/display-mode - Update photo display mode
router.patch('/photos/:photoId/display-mode', updatePhotoDisplayMode);

export default router;