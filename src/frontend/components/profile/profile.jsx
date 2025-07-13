// Profile Component
// Path: src/frontend/components/profile/profile.jsx

import React, { useState, useEffect } from 'react';
import FilterSettings from './FilterSettings';
import CrushComponent from '../crushcomponents/CrushComponent';
import './Profile.css';

const Profile = () => {
  const [isEditing, setIsEditing] = useState(true);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showCrushes, setShowCrushes] = useState(false);
  const [filterPreferences, setFilterPreferences] = useState({});
  const [gettingLocation, setGettingLocation] = useState(false);
  const [profileData, setProfileData] = useState({
    username: '',
    age: '',
    gender: '',
    height: '',
    bodyType: '',
    location: '',
    coordinates: null,
    locationType: 'manual',
    bio: '',
    interests: [],
    lookingFor: '',
    photos: [],
    prompts: [
      { question: '', answer: '' },
      { question: '', answer: '' },
      { question: '', answer: '' }
    ]
  });

  const bodyTypes = ['Slim', 'Athletic', 'Muscular', 'Fit', 'Toned', 'Average', 'Curvy', 'Full Figured', 'Prefer not to say'];
  const lookingForOptions = ['Long-term relationship', 'Workout partner', 'Something casual', 'Not sure yet', 'New gym buddies'];
  
  const heightOptions = [];
  for (let feet = 4; feet <= 7; feet++) {
    for (let inches = 0; inches < 12; inches++) {
      if (feet === 7 && inches > 0) break;
      heightOptions.push(`${feet}'${inches}"`);
    }
  }

  const interestOptions = [
    'Weightlifting', 'CrossFit', 'Running', 'Cycling', 'Swimming', 'Yoga',
    'Pilates', 'Boxing', 'MMA', 'Rock Climbing', 'Hiking', 'Dance',
    'Bodybuilding', 'Powerlifting', 'Olympic Lifting', 'Calisthenics',
    'HIIT', 'Spin Classes', 'Martial Arts', 'Tennis', 'Basketball',
    'Soccer', 'Volleyball', 'Nutrition', 'Meal Prep', 'Meditation',
    'Outdoor Activities', 'Adventure Sports', 'Functional Fitness',
    'Group Classes', 'Personal Training'
  ];

  const promptQuestions = [
    "My ideal workout partner would...",
    "My fitness goals are...",
    "After the gym, you'll find me...",
    "My favorite way to stay active is...",
    "I'm looking for someone who...",
    "My rest day looks like...",
    "The best thing about fitness is...",
    "My gym pet peeve is...",
    "My proudest fitness achievement is...",
    "My pre-workout ritual includes..."
  ];

  useEffect(() => {
    loadProfile();
    loadFilterPreferences();
    checkForSuccessfulPurchase();
  }, []);

  // Helper functions for purchase tracking
  const getPackagePrice = (crushes) => {
    const prices = { '5': 4.99, '15': 9.99, '30': 14.99, '60': 24.99 };
    return prices[crushes] || 0;
  };

  const getPackageId = (crushes) => {
    const ids = { '5': 'starter', '15': 'power', '30': 'athlete', '60': 'champion' };
    return ids[crushes] || 'unknown';
  };

  const getPackageName = (crushes) => {
    const names = { 
      '5': 'Starter Pack', 
      '15': 'Power Pack', 
      '30': 'Athlete Bundle', 
      '60': 'Champion Bundle' 
    };
    return names[crushes] || 'Unknown Package';
  };

  // Check for successful purchase and track it
  const checkForSuccessfulPurchase = () => {
    // Check URL parameters for successful payment
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    const subscriptionStatus = urlParams.get('subscription');
    const crushCount = urlParams.get('crushes');
    
    if (paymentStatus === 'success' && crushCount && window.gtag) {
      // Track crush package purchase
      const price = getPackagePrice(crushCount);
      const packageId = getPackageId(crushCount);
      const packageName = getPackageName(crushCount);
      
      window.gtag('event', 'purchase', {
        transaction_id: `GC-${Date.now()}`,
        value: price,
        currency: 'USD',
        items: [{
          item_id: packageId,
          item_name: packageName,
          item_category: 'crushes',
          price: price,
          quantity: 1
        }]
      });

      // Also track as a custom event for more detail
      window.gtag('event', 'crush_package_purchased', {
        package_id: packageId,
        crushes_count: parseInt(crushCount),
        value: price
      });

      // Clear the URL parameters after tracking
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    if (subscriptionStatus === 'success' && window.gtag) {
      // Track subscription purchase
      window.gtag('event', 'purchase', {
        transaction_id: `GC-SUB-${Date.now()}`,
        value: 29.99,
        currency: 'USD',
        items: [{
          item_id: 'unlimited_monthly',
          item_name: 'Unlimited Monthly Membership',
          item_category: 'subscription',
          price: 29.99,
          quantity: 1
        }]
      });

      // Also track as a custom event
      window.gtag('event', 'subscription_started', {
        subscription_type: 'unlimited_monthly',
        value: 29.99
      });

      // Clear the URL parameters after tracking
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Track cancelled purchases
    if (paymentStatus === 'cancelled' && window.gtag) {
      window.gtag('event', 'payment_cancelled', {
        payment_type: crushCount ? 'crush_package' : 'unknown'
      });
    }

    if (subscriptionStatus === 'cancelled' && window.gtag) {
      window.gtag('event', 'subscription_cancelled', {
        subscription_type: 'unlimited_monthly'
      });
    }
  };

  const loadProfile = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch('/api/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success && data.profile) {
        const profile = data.profile.profile || {};
        setProfileData(prev => ({
          ...prev,
          username: data.profile.username || '',
          age: profile.age || '',
          gender: profile.gender || '',
          height: profile.height || '',
          bodyType: profile.bodyType || '',
          location: profile.location || '',
          coordinates: profile.coordinates?.coordinates || null,
          locationType: profile.locationType || 'manual',
          bio: profile.bio || '',
          interests: profile.interests || [],
          lookingFor: profile.lookingFor || '',
          photos: profile.photos || [],
          prompts: (profile.prompts && profile.prompts.length > 0) ? profile.prompts : [
            { question: '', answer: '' },
            { question: '', answer: '' },
            { question: '', answer: '' }
          ]
        }));
      }
    } catch (error) {
      console.error('Load profile error:', error);
    }
  };

  const loadFilterPreferences = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch('/api/profile/filters', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success && data.filters) {
        setFilterPreferences(data.filters);
      }
    } catch (error) {
      console.error('Load filter preferences error:', error);
    }
  };

  const saveFilterPreferences = async (filters) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/profile/filters', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(filters)
      });
      
      const data = await response.json();
      if (data.success) {
        setFilterPreferences(filters);
        alert('Match preferences saved! 💪');
        
        // Track filter preferences saved
        if (window.gtag) {
          window.gtag('event', 'preferences_saved', {
            preference_type: 'match_filters',
            age_range: `${filters.ageMin}-${filters.ageMax}`,
            distance: filters.distance,
            gender_preference: filters.gender?.join(',') || 'not_set'
          });
        }
      } else {
        alert(data.message || 'Failed to save preferences');
      }
    } catch (error) {
      console.error('Error saving filters:', error);
      alert('Failed to save preferences');
    }
  };

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleInterestToggle = (interest) => {
    setProfileData(prev => {
      const interests = [...prev.interests];
      const index = interests.indexOf(interest);
      
      if (index > -1) {
        interests.splice(index, 1);
      } else if (interests.length < 10) {
        interests.push(interest);
      }
      
      return { ...prev, interests };
    });
  };

  const handlePromptChange = (index, field, value) => {
    setProfileData(prev => {
      const prompts = [...prev.prompts];
      prompts[index] = { ...prompts[index], [field]: value };
      return { ...prev, prompts };
    });
  };

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    for (let file of files) {
      if (!validTypes.includes(file.type)) {
        setPhotoError('Please upload only JPEG, PNG or WebP images');
        return;
      }
      if (file.size > maxSize) {
        setPhotoError('Each photo must be less than 5MB');
        return;
      }
    }
    
    if (profileData.photos.length + files.length > 6) {
      setPhotoError(`You can only have 6 photos total. You currently have ${profileData.photos.length}.`);
      return;
    }
    
    setUploadingPhotos(true);
    setPhotoError('');
    
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('photos', file);
      });
      
      const token = localStorage.getItem('token');
      const response = await fetch('/api/profile/photos', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      const data = await response.json();
      
      if (data.success) {
        setProfileData(prev => ({
          ...prev,
          photos: data.photos
        }));
        
        // Track photo upload
        if (window.gtag) {
          window.gtag('event', 'content_upload', {
            content_type: 'profile_photo',
            photo_count: files.length,
            total_photos: data.photos.length
          });
        }
      } else {
        setPhotoError(data.message || 'Failed to upload photos');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setPhotoError('Failed to upload photos. Please try again.');
    } finally {
      setUploadingPhotos(false);
    }
  };

  const removePhoto = async (photoId) => {
    if (!window.confirm('Are you sure you want to remove this photo?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/profile/photos/${photoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setProfileData(prev => ({
          ...prev,
          photos: data.photos
        }));
      } else {
        alert('Failed to remove photo');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to remove photo');
    }
  };

  const calculateCompletion = () => {
    const requiredFields = ['age', 'bio', 'location'];
    const filledRequired = requiredFields.filter(field => profileData[field]).length;
    const hasPhoto = profileData.photos.length > 0;
    const hasInterests = profileData.interests.length >= 3;
    const hasPrompt = profileData.prompts.some(p => p.answer);
    
    const total = requiredFields.length + 3;
    const completed = filledRequired + (hasPhoto ? 1 : 0) + (hasInterests ? 1 : 0) + (hasPrompt ? 1 : 0);
    
    return Math.round((completed / total) * 100);
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setGettingLocation(true);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          const token = localStorage.getItem('token');
          // Use YOUR backend endpoint for reverse geocoding
          const response = await fetch('/api/profile/reverse-geocode', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ latitude, longitude })
          });
          
          const data = await response.json();
          
          if (data.success) {
            setProfileData(prev => ({
              ...prev,
              location: data.location,
              coordinates: [longitude, latitude],
              locationType: 'device'
            }));
          } else {
            alert('Could not determine your city. Please enter manually.');
          }
          
          setGettingLocation(false);
        } catch (error) {
          console.error('Reverse geocoding error:', error);
          setGettingLocation(false);
          alert('Could not determine your city. Please enter manually.');
        }
      },
      (error) => {
        setGettingLocation(false);
        console.error('Geolocation error:', error);
        alert('Could not get your location. Please enter manually.');
      }
    );
  };

  const geocodeLocation = async (location) => {
    try {
      const token = localStorage.getItem('token');
      // Use YOUR backend endpoint for geocoding
      const response = await fetch('/api/profile/geocode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ location })
      });
      
      const data = await response.json();
      
      if (data.success) {
        return data.coordinates; // [longitude, latitude]
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
    return null;
  };

  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please log in to save your profile');
        return;
      }

      // If location was entered manually and we don't have coordinates, geocode it
      let coordinates = profileData.coordinates;
      if (profileData.location && !coordinates && profileData.locationType === 'manual') {
        coordinates = await geocodeLocation(profileData.location);
      }

      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          age: profileData.age,
          gender: profileData.gender,
          height: profileData.height,
          bodyType: profileData.bodyType,
          location: profileData.location,
          coordinates: coordinates ? {
            type: 'Point',
            coordinates: coordinates
          } : undefined,
          locationType: profileData.locationType,
          bio: profileData.bio,
          interests: profileData.interests,
          lookingFor: profileData.lookingFor,
          prompts: profileData.prompts.filter(p => p.question && p.answer)
        })
      });

      const data = await response.json();

      if (data.success) {
        alert('Profile saved successfully! 💪');
        setIsEditing(false);
        
        // Track profile completion
        const completion = calculateCompletion();
        if (window.gtag) {
          window.gtag('event', 'profile_updated', {
            profile_completion: completion,
            has_photos: profileData.photos.length > 0,
            interests_count: profileData.interests.length,
            prompts_answered: profileData.prompts.filter(p => p.answer).length
          });
          
          // Special event for 100% completion
          if (completion === 100) {
            window.gtag('event', 'profile_completed', {
              profile_completion_percentage: 100,
              has_photos: true,
              interests_count: profileData.interests.length
            });
          }
        }
      } else {
        alert(data.message || 'Failed to save profile');
      }
    } catch (error) {
      console.error('Save profile error:', error);
      alert('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Your GymCrush Profile</h1>
        <div className="profile-completion">
          <span className="completion-text">{calculateCompletion()}% Complete</span>
          <div className="completion-bar">
            <div className="completion-fill" style={{ width: `${calculateCompletion()}%` }}></div>
          </div>
        </div>
      </div>

      {/* Photo Section */}
      <section className="profile-section profile-edit-photo-section">
        <h2>Your Photos</h2>
        <p className="section-description">Add up to 6 photos that show your fitness journey</p>
        
        {photoError && (
          <div className="photo-error">
            {photoError}
          </div>
        )}
        
        <div className="photo-grid">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="photo-slot">
              {profileData.photos && profileData.photos[index] ? (
                <div className="photo-preview">
                  <img 
                    src={profileData.photos[index].thumbnailUrl || profileData.photos[index].url} 
                    alt={`Photo ${index + 1}`} 
                    className={`preview-img ${profileData.photos[index].displayMode || 'contain'}`}
                  />
                  {profileData.photos[index].isMain && (
                    <span className="main-photo-badge">Main</span>
                  )}
                  <button 
                    className="remove-photo"
                    onClick={() => removePhoto(profileData.photos[index]._id)}
                    disabled={uploadingPhotos}
                    aria-label="Remove photo"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <label className={`photo-upload ${uploadingPhotos ? 'uploading' : ''}`}>
                  <input 
                    type="file" 
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handlePhotoUpload}
                    multiple
                    disabled={uploadingPhotos}
                  />
                  {uploadingPhotos ? (
                    <>
                      <div className="upload-spinner"></div>
                      <span className="upload-text">Uploading...</span>
                    </>
                  ) : (
                    <>
                      <span className="upload-icon">+</span>
                      <span className="upload-text">Add Photo</span>
                    </>
                  )}
                </label>
              )}
            </div>
          ))}
        </div>
        <div className="photo-tips">
          <p className="tip-title">Photo Tips:</p>
          <ul>
            <li>Show off your fitness progress and gym moments</li>
            <li>Include action shots - lifting, running, or in classes</li>
            <li>Mix gym selfies with outdoor activities</li>
            <li>Let your personality shine through! 💪</li>
          </ul>
        </div>
      </section>
      
      <div className="profile-content">
        
        {/* Basic Info Section */}
        <section className="profile-section">
          <h2>Basic Information</h2>
          
          <div className="form-grid">
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                value={profileData.username}
                disabled
                style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
              />
              <small className="form-hint">Username cannot be changed</small>
            </div>

            <div className="form-group">
              <label>Age*</label>
              <input
                type="number"
                min="18"
                max="100"
                value={profileData.age}
                onChange={(e) => handleInputChange('age', e.target.value)}
                placeholder="Your age"
              />
            </div>

            <div className="form-group">
              <label>Gender*</label>
              <select
                value={profileData.gender}
                onChange={(e) => handleInputChange('gender', e.target.value)}
              >
                <option value="">Select gender</option>
                <option value="Man">Man</option>
                <option value="Woman">Woman</option>
              </select>
            </div>

            <div className="form-group">
              <label>Height</label>
              <select
                value={profileData.height}
                onChange={(e) => handleInputChange('height', e.target.value)}
              >
                <option value="">Select height</option>
                {heightOptions.map(height => (
                  <option key={height} value={height}>{height}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Body Type</label>
              <select
                value={profileData.bodyType}
                onChange={(e) => handleInputChange('bodyType', e.target.value)}
              >
                <option value="">Select body type</option>
                {bodyTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Location*</label>
              <div className="location-input-group">
                <input
                  type="text"
                  value={profileData.location}
                  onChange={(e) => {
                    handleInputChange('location', e.target.value);
                    // Reset coordinates and type when manually changing location
                    setProfileData(prev => ({
                      ...prev,
                      coordinates: null,
                      locationType: 'manual'
                    }));
                  }}
                  placeholder="City, State (e.g., Austin, TX)"
                  className="location-input"
                />
                <button
                  type="button"
                  className="btn-location"
                  onClick={handleUseCurrentLocation}
                  disabled={gettingLocation}
                >
                  {gettingLocation ? '📍 Getting location...' : '📍 Use Current Location'}
                </button>
              </div>
              <small className="form-hint">
                Your exact location is never shown to other users
              </small>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="profile-section">
          <h2>About You</h2>
          
          <div className="form-group">
            <label>Bio*</label>
            <textarea
              value={profileData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder="Share your fitness journey, goals, and what makes you unique. What drives you? What are you passionate about?"
              rows="5"
              maxLength="500"
            />
            <span className="char-count">{profileData.bio.length}/500</span>
          </div>

          <div className="form-group">
            <label>What are you looking for?</label>
            <select
              value={profileData.lookingFor}
              onChange={(e) => handleInputChange('lookingFor', e.target.value)}
            >
              <option value="">Select an option</option>
              {lookingForOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        </section>

        {/* Interests Section */}
        <section className="profile-section">
          <h2>Your Fitness Interests</h2>
          <p className="section-description">Choose up to 10 activities (minimum 3)</p>
          
          <div className="interests-grid">
            {interestOptions.map(interest => (
              <button
                key={interest}
                className={`interest-chip ${profileData.interests.includes(interest) ? 'selected' : ''}`}
                onClick={() => handleInterestToggle(interest)}
              >
                {interest}
              </button>
            ))}
          </div>
          <p className="interests-count">{profileData.interests.length}/10 interests selected</p>
        </section>

        {/* Prompts Section */}
        <section className="profile-section">
          <h2>Conversation Starters</h2>
          <p className="section-description">Answer at least one prompt to help others get to know you</p>
          
          <div className="prompt-group">
            <select
              value={profileData.prompts?.[0]?.question || ''}
              onChange={(e) => handlePromptChange(0, 'question', e.target.value)}
              className="prompt-select"
            >
              <option value="">Choose a prompt...</option>
              {promptQuestions.map(q => (
                <option key={q} value={q}>{q}</option>
              ))}
            </select>
            {profileData.prompts?.[0]?.question && (
              <textarea
                value={profileData.prompts[0].answer || ''}
                onChange={(e) => handlePromptChange(0, 'answer', e.target.value)}
                placeholder="Your answer..."
                rows="3"
                maxLength="200"
                className="prompt-answer"
              />
            )}
          </div>

          <div className="prompt-group">
            <select
              value={profileData.prompts?.[1]?.question || ''}
              onChange={(e) => handlePromptChange(1, 'question', e.target.value)}
              className="prompt-select"
            >
              <option value="">Choose a prompt...</option>
              {promptQuestions.map(q => (
                <option key={q} value={q}>{q}</option>
              ))}
            </select>
            {profileData.prompts?.[1]?.question && (
              <textarea
                value={profileData.prompts[1].answer || ''}
                onChange={(e) => handlePromptChange(1, 'answer', e.target.value)}
                placeholder="Your answer..."
                rows="3"
                maxLength="200"
                className="prompt-answer"
              />
            )}
          </div>

          <div className="prompt-group">
            <select
              value={profileData.prompts?.[2]?.question || ''}
              onChange={(e) => handlePromptChange(2, 'question', e.target.value)}
              className="prompt-select"
            >
              <option value="">Choose a prompt...</option>
              {promptQuestions.map(q => (
                <option key={q} value={q}>{q}</option>
              ))}
            </select>
            {profileData.prompts?.[2]?.question && (
              <textarea
                value={profileData.prompts[2].answer || ''}
                onChange={(e) => handlePromptChange(2, 'answer', e.target.value)}
                placeholder="Your answer..."
                rows="3"
                maxLength="200"
                className="prompt-answer"
              />
            )}
          </div>
        </section>

        {/* Match Preferences Section */}
        <section className="profile-section">
          <div className="match-preferences-header">
            <h2>Match Preferences</h2>
            <button 
              className="btn-secondary match-preferences-toggle" 
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? 'Hide' : 'Show'} Preferences
            </button>
          </div>
          
          {showFilters && (
            <FilterSettings 
              initialFilters={filterPreferences}
              onSave={saveFilterPreferences}
            />
          )}
        </section>

        {/* Crushes Section */}
        <section className="profile-section" id="crushes">
          <div className="my-crushes-header">
            <h2>My Crushes</h2>
            <button 
              className="btn-secondary my-crushes-toggle" 
              onClick={() => {
                setShowCrushes(!showCrushes);
                // Track when users view crush packages
                if (!showCrushes && window.gtag) {
                  window.gtag('event', 'view_item_list', {
                    item_list_name: 'crush_packages',
                    items: [
                      { item_id: 'starter', item_name: 'Starter Pack', price: 4.99, item_category: 'crushes' },
                      { item_id: 'power', item_name: 'Power Pack', price: 9.99, item_category: 'crushes' },
                      { item_id: 'athlete', item_name: 'Athlete Bundle', price: 14.99, item_category: 'crushes' },
                      { item_id: 'champion', item_name: 'Champion Bundle', price: 24.99, item_category: 'crushes' },
                      { item_id: 'unlimited_monthly', item_name: 'Unlimited Monthly', price: 29.99, item_category: 'subscription' }
                    ]
                  });
                }
              }}
            >
              {showCrushes ? 'Hide' : 'Show'} Crushes
            </button>
          </div>
          
          {showCrushes && (
            <CrushComponent isEmbedded={true} />
          )}
        </section>

        {/* Action Buttons */}
        <div className="profile-actions">
          <button 
            className="btn-secondary"
            onClick={() => setShowPreview(true)}
          >
            Preview Profile
          </button>
          <button 
            className="btn-primary" 
            disabled={calculateCompletion() < 60}
            onClick={handleSaveProfile}
          >
            Save Profile
          </button>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="preview-modal-overlay" onClick={() => setShowPreview(false)}>
          <div className="preview-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-preview" onClick={() => setShowPreview(false)}>×</button>
            <h2>Profile Preview</h2>
            <p className="preview-subtitle">This is how others will see your profile</p>
            
            <div className="preview-content">
              {/* Photo */}
              <div className="preview-photo">
                {profileData.photos[0] ? (
                  <img 
                    src={profileData.photos[0].thumbnailUrl || profileData.photos[0].url} 
                    alt="Profile preview" 
                  />
                ) : (
                  <div className="no-photo-preview">
                    <span>💪</span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="preview-info">
                <h3>{profileData.username || 'Username'}, {profileData.age || '??'}</h3>
                <p className="preview-location">{profileData.location || 'Location not set'}</p>

                <div className="preview-details">
                  {profileData.gender && <span>Gender: {profileData.gender}</span>}
                  {profileData.height && <span>Height: {profileData.height}</span>}
                  {profileData.bodyType && <span>Body Type: {profileData.bodyType}</span>}
                  {profileData.lookingFor && <span>Looking for: {profileData.lookingFor}</span>}
                </div>

                {profileData.bio && (
                  <div className="preview-bio">
                    <h4>About Me</h4>
                    <p>{profileData.bio}</p>
                  </div>
                )}

                {profileData.interests.length > 0 && (
                  <div className="preview-interests">
                    <h4>Fitness Interests</h4>
                    <div className="interests-list">
                      {profileData.interests.map((interest, idx) => (
                        <span key={idx} className="interest-chip">{interest}</span>
                      ))}
                    </div>
                  </div>
                )}

                {profileData.prompts.some(p => p.answer) && (
                  <div className="preview-prompts">
                    {profileData.prompts.filter(p => p.answer).map((prompt, idx) => (
                      <div key={idx} className="preview-prompt">
                        <p className="prompt-q">{prompt.question}</p>
                        <p className="prompt-a">{prompt.answer}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;