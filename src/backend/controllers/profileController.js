// Profile Controller
// Path: src/backend/controllers/profileController.js
// Purpose: Handle profile-related operations with Cloudinary photo upload

import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import upload from '../middleware/uploadMiddleware.js';
import cloudinary from '../config/cloudinary.js';

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

// Get user profile
exports.getProfile = [verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, profile: user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}];

// Update user profile
exports.updateProfile = [verifyToken, async (req, res) => {
  try {
    const {
      age,
      gender,
      height,
      bodyType,
      location,
      bio,
      interests,
      fitnessLevel,
      workoutPreferences,
      gymFrequency,
      lookingFor,
      prompts
    } = req.body;
    
    const updateData = {
      'profile.age': age,
      'profile.gender': gender,
      'profile.height': height,
      'profile.bodyType': bodyType,
      'profile.location': location,
      'profile.bio': bio,
      'profile.interests': interests,
      'profile.fitnessLevel': fitnessLevel,
      'profile.workoutPreferences': workoutPreferences,
      'profile.gymFrequency': gymFrequency,
      'profile.lookingFor': lookingFor,
      'profile.prompts': prompts
    };
    
    Object.keys(updateData).forEach(key =>
      updateData[key] === undefined && delete updateData[key]
    );
    
    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.json({ 
      success: true, 
      message: 'Profile updated successfully',
      profile: user 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}];

// Upload profile photos
exports.uploadPhotos = [verifyToken, upload.array('photos', 6), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No photos uploaded' });
    }

    const user = await User.findById(req.userId);
    const currentPhotoCount = user.profile.photos ? user.profile.photos.length : 0;
    
    if (currentPhotoCount + req.files.length > 6) {
      for (const file of req.files) {
        await cloudinary.uploader.destroy(file.filename);
      }
      return res.status(400).json({ 
        success: false, 
        message: `You can only have 6 photos total. You currently have ${currentPhotoCount}.` 
      });
    }

    const photos = req.files.map((file, index) => ({
      url: file.path,
      publicId: file.filename,
      isMain: currentPhotoCount === 0 && index === 0,
      displayMode: 'contain',
      thumbnailUrl: cloudinary.url(file.filename, {
        width: 200,
        height: 200,
        crop: 'fill',
        gravity: 'face'
      })
    }));

    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { $push: { 'profile.photos': { $each: photos } } },
      { new: true }
    ).select('-password');

    res.json({ 
      success: true, 
      message: 'Photos uploaded successfully',
      photos: updatedUser.profile.photos 
    });
  } catch (error) {
    console.error('Photo upload error:', error);
    if (req.files) {
      for (const file of req.files) {
        try {
          await cloudinary.uploader.destroy(file.filename);
        } catch (deleteError) {
          console.error('Error deleting file from Cloudinary:', deleteError);
        }
      }
    }
    res.status(500).json({ success: false, message: 'Failed to upload photos' });
  }
}];

// Delete a photo
exports.deletePhoto = [verifyToken, async (req, res) => {
  try {
    const { photoId } = req.params;
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const photoIndex = user.profile.photos.findIndex(p => p._id.toString() === photoId);
    if (photoIndex === -1) return res.status(404).json({ success: false, message: 'Photo not found' });

    const photo = user.profile.photos[photoIndex];
    try {
      await cloudinary.uploader.destroy(photo.publicId);
    } catch (err) {
      console.error('Cloudinary deletion error:', err);
    }

    user.profile.photos.splice(photoIndex, 1);
    if (photo.isMain && user.profile.photos.length > 0) {
      user.profile.photos[0].isMain = true;
    }

    await user.save();

    res.json({ 
      success: true, 
      message: 'Photo deleted successfully',
      photos: user.profile.photos 
    });
  } catch (error) {
    console.error('Photo deletion error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete photo' });
  }
}];

// Update photo display mode
exports.updatePhotoDisplayMode = [verifyToken, async (req, res) => {
  try {
    const { photoId } = req.params;
    const { displayMode } = req.body;

    if (!['contain', 'cover'].includes(displayMode)) {
      return res.status(400).json({ success: false, message: 'Invalid display mode. Must be \"contain\" or \"cover\"' });
    }

    const user = await User.findOneAndUpdate(
      { _id: req.userId, 'profile.photos._id': photoId },
      { $set: { 'profile.photos.$.displayMode': displayMode } },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'Photo not found' });
    }

    res.json({ 
      success: true, 
      message: 'Display mode updated successfully',
      photo: user.profile.photos.find(p => p._id.toString() === photoId)
    });
  } catch (error) {
    console.error('Update display mode error:', error);
    res.status(500).json({ success: false, message: 'Failed to update display mode' });
  }
}];

// NEW: Get all user profiles for browsing
exports.getAllProfiles = [verifyToken, async (req, res) => {
  try {
    const currentUser = await User.findById(req.userId);
    
    let filterQuery = {
      _id: { $ne: req.userId },
      'profile.bio': { $exists: true, $ne: '' },
      'profile.interests': { $exists: true, $ne: [] }
    };

    // Apply gender filter
    if (currentUser.filterPreferences?.gender?.length > 0 && 
        !currentUser.filterPreferences.gender.includes('Other')) {
      const genderFilter = currentUser.filterPreferences.gender.map(g => {
        if (g === 'Men') return 'Man';
        if (g === 'Women') return 'Woman';
        return g;
      });
      filterQuery['profile.gender'] = { $in: genderFilter };
    }

    // Apply age filter
    if (currentUser.filterPreferences?.minAge || currentUser.filterPreferences?.maxAge) {
      filterQuery['profile.age'] = {};
      if (currentUser.filterPreferences.minAge) {
        filterQuery['profile.age'].$gte = currentUser.filterPreferences.minAge;
      }
      if (currentUser.filterPreferences.maxAge) {
        filterQuery['profile.age'].$lte = currentUser.filterPreferences.maxAge;
      }
    }

    // Apply lookingFor filter - match people looking for the same things
    if (currentUser.filterPreferences?.lookingFor?.length > 0) {
      filterQuery['profile.lookingFor'] = { 
        $in: currentUser.filterPreferences.lookingFor 
      };
    }

    // Get initial results
    let users = await User.find(filterQuery).select('-password -email');

    // Apply height filter in application layer (since height is stored as string)
    if (currentUser.filterPreferences?.heightMin || currentUser.filterPreferences?.heightMax) {
      const heightToInches = (heightStr) => {
        if (!heightStr) return 0;
        const match = heightStr.match(/(\d+)'(\d+)"/);
        if (match) {
          return parseInt(match[1]) * 12 + parseInt(match[2]);
        }
        return 0;
      };

      const minInches = heightToInches(currentUser.filterPreferences.heightMin);
      const maxInches = heightToInches(currentUser.filterPreferences.heightMax);

      users = users.filter(user => {
        const profileInches = heightToInches(user.profile.height);
        if (minInches && profileInches < minInches) return false;
        if (maxInches && profileInches > maxInches) return false;
        return true;
      });
    }

    const profiles = users.map(user => ({
      id: user._id,
      username: user.username,
      age: user.profile.age || 'Not specified',
      gender: user.profile.gender || 'Not specified',
      height: user.profile.height || 'Not specified',
      bodyType: user.profile.bodyType || 'Not specified',
      location: user.profile.location || 'Location not set',
      bio: user.profile.bio,
      interests: user.profile.interests,
      photos: user.profile.photos || [],
      lastActive: 'Recently active',
      fitnessLevel: user.profile.fitnessLevel || 'Not specified',
      workoutPreferences: user.profile.workoutPreferences || [],
      gymFrequency: user.profile.gymFrequency || 'Not specified',
      prompts: user.profile.prompts || [],
      lookingFor: user.profile.lookingFor || 'Not specified'
    }));

    res.json({ 
      success: true, 
      profiles, 
      accountTier: currentUser.accountTier 
    });
  } catch (error) {
    console.error('Fetch all profiles error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}];