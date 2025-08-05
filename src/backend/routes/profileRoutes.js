// Updated Profile Routes with Cloudinary Integration
// Path: src/backend/routes/profileRoutes.js
// Purpose: Define profile-related API endpoints including notification preferences and username-based profile viewing

import express from 'express';
import multer from 'multer';
import cloudinary from '../config/cloudinary.js'; // Use your existing config
import { 
  getProfile, 
  updateProfile, 
  uploadPhotos, 
  deletePhoto,
  updatePhotoDisplayMode,
  getAllProfiles
} from '../controllers/profileController.js';
import User from '../models/User.js';
import { verifyToken } from '../middleware/authMiddleware.js';  // Import shared middleware

const router = express.Router();

// Configure multer for photo uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit per file
    files: 6 // Maximum 6 photos
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG and WebP are allowed.'));
    }
  }
});

// Helper function to upload to Cloudinary
const uploadToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'gymcrush/profiles',
        resource_type: 'image',
        transformation: [
          { width: 800, height: 800, crop: 'limit' }, // Limit max size
          { quality: 'auto:good' }, // Auto optimize quality
          { fetch_format: 'auto' } // Auto format (webp where supported)
        ],
        ...options
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
    uploadStream.end(buffer);
  });
};

// PUBLIC ROUTES (no authentication needed)

// GET /api/profile/all - Get all user profiles (for browsing)
router.get('/all', getAllProfiles);

// GET /api/profile/user/:username - Get profile by username (public profiles)
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

// PROTECTED ROUTES (authentication required)

// GET /api/profile - Get current user's profile
router.get('/', verifyToken, getProfile);

// PUT /api/profile - Update current user's profile
router.put('/', verifyToken, updateProfile);

// POST /api/profile/complete-onboarding - Complete user onboarding with Cloudinary
router.post('/complete-onboarding', verifyToken, upload.array('photos', 6), async (req, res) => {
  try {
    const userId = req.userId;
    
    // Parse profile data if sent as FormData
    let profileData;
    if (req.body.profileData) {
      try {
        profileData = JSON.parse(req.body.profileData);
      } catch (parseError) {
        return res.status(400).json({
          success: false,
          message: 'Invalid profile data format'
        });
      }
    } else {
      profileData = req.body;
    }
    
    // Validate required fields
    const requiredFields = ['gender', 'location', 'bio', 'interests', 'fitnessLevel', 'gymFrequency', 'lookingFor'];
    const missingFields = requiredFields.filter(field => !profileData[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }
    
    // Validate interests array
    if (!Array.isArray(profileData.interests) || profileData.interests.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Please select at least 3 interests'
      });
    }
    
    // Handle photo uploads to Cloudinary
    let photoData = [];
    if (req.files && req.files.length > 0) {
      console.log(`Uploading ${req.files.length} photos to Cloudinary...`);
      
      try {
        // Upload all photos to Cloudinary in parallel
        const uploadPromises = req.files.map(async (file, index) => {
          const result = await uploadToCloudinary(file.buffer, {
            public_id: `user_${userId}_photo_${Date.now()}_${index}`,
            tags: ['profile', `user_${userId}`]
          });
          
          return {
            url: result.secure_url,
            publicId: result.public_id,
            isMain: index === 0,
            width: result.width,
            height: result.height,
            format: result.format
          };
        });
        
        photoData = await Promise.all(uploadPromises);
        console.log(`Successfully uploaded ${photoData.length} photos to Cloudinary`);
      } catch (uploadError) {
        console.error('Error uploading photos to Cloudinary:', uploadError);
        return res.status(500).json({
          success: false,
          message: 'Failed to upload photos. Please try again.'
        });
      }
    }
    
    // Prepare update data
    const updateData = {
      'profile.gender': profileData.gender,
      'profile.height': profileData.height || '',
      'profile.bodyType': profileData.bodyType || '',
      'profile.location': profileData.location,
      'profile.bio': profileData.bio,
      'profile.interests': profileData.interests,
      'profile.fitnessLevel': profileData.fitnessLevel,
      'profile.gymFrequency': profileData.gymFrequency,
      'profile.lookingFor': profileData.lookingFor,
      'profile.prompts': profileData.prompts || [],
      'filterPreferences': profileData.preferences || {
        minAge: 18,
        maxAge: 50,
        distance: 25,
        gender: ['Everyone']
      },
      'onboardingComplete': true,
      'profileCompletedAt': new Date()
    };
    
    // Add photos if uploaded
    if (photoData.length > 0) {
      updateData['profile.photos'] = photoData;
    }
    
    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { 
        new: true, 
        runValidators: true,
        select: '-password -resetPasswordToken -resetPasswordExpires'
      }
    );
    
    if (!updatedUser) {
      // If user not found and we uploaded photos, delete them from Cloudinary
      if (photoData.length > 0) {
        const deletePromises = photoData.map(photo => 
          cloudinary.uploader.destroy(photo.publicId)
        );
        await Promise.all(deletePromises).catch(err => 
          console.error('Error cleaning up Cloudinary photos:', err)
        );
      }
      
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Return success response
    res.status(200).json({
      success: true,
      message: 'Profile completed successfully',
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        onboardingComplete: true,
        profile: updatedUser.profile,
        crushBalance: updatedUser.crushBalance
      }
    });
    
  } catch (error) {
    console.error('Complete onboarding error:', error);
    
    // Handle multer errors
    if (error.message && error.message.includes('File too large')) {
      return res.status(413).json({
        success: false,
        message: 'Photos are too large. Maximum size is 5MB per photo.'
      });
    }
    
    if (error.message && error.message.includes('Invalid file type')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to complete profile setup',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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
router.post('/photos', verifyToken, uploadPhotos);

// DELETE /api/profile/photos/:photoId - Delete a specific photo
router.delete('/photos/:photoId', verifyToken, deletePhoto);

// PATCH /api/profile/photos/:photoId/display-mode - Update photo display mode
router.patch('/photos/:photoId/display-mode', verifyToken, updatePhotoDisplayMode);

export default router;