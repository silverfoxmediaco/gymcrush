// Browsing Component
// Path: src/frontend/components/browse/Browsing.jsx
// Purpose: Main browsing interface - FIXED VERSION WITHOUT NEW COMPONENTS

import React, { useState, useEffect } from 'react';
import './Browsing.css';

const Browsing = () => {
  const [profiles, setProfiles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [crushBalance, setCrushBalance] = useState(0);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [sendingCrush, setSendingCrush] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  useEffect(() => {
    loadProfiles();
    loadCrushBalance();
  }, []);

  const loadProfiles = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/match/browse', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success && data.profiles) {
        setProfiles(data.profiles);
        setCrushBalance(data.crushBalance || 0);
        setHasSubscription(data.hasActiveSubscription || false);
      } else {
        console.error('Failed to load profiles:', data.message);
      }
    } catch (error) {
      console.error('Error loading profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCrushBalance = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/crushes/data', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setCrushBalance(data.balance || 0);
        setHasSubscription(data.hasActiveSubscription || false);
      }
    } catch (error) {
      console.error('Error loading crush balance:', error);
    }
  };

  const handleSendCrush = async (userId) => {
    if (sendingCrush) return;
    
    // Check if user has crushes available
    if (!hasSubscription && crushBalance <= 0) {
      alert('You need crushes to send! Click on your profile to purchase more or get unlimited access.');
      return;
    }

    setSendingCrush(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/match/send-crush', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          recipientId: userId
        })
      });

      const data = await response.json();
      
      if (data.success) {
        if (data.isMatch) {
          alert("It's a match! 💪❤️ Check your messages!");
        } else {
          alert('Crush sent successfully! 💪');
        }

        // Update crush balance if not unlimited
        if (!hasSubscription && typeof data.remainingCrushes === 'number') {
          setCrushBalance(data.remainingCrushes);
        }

        // Move to next profile
        handleNext();
      } else {
        if (data.needsCrushes) {
          alert('You need crushes to send! Click on your profile to purchase more or get unlimited access.');
        } else {
          alert(data.message || 'Failed to send crush');
        }
      }
    } catch (error) {
      console.error('Error sending crush:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setSendingCrush(false);
    }
  };

  const handleNext = () => {
    setCurrentPhotoIndex(0); // Reset photo index for new profile
    if (currentIndex < profiles.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Reload more profiles when we reach the end
      loadProfiles();
      setCurrentIndex(0);
    }
  };

  const handleSkip = () => {
    handleNext();
  };

  const handleRewind = () => {
    setCurrentPhotoIndex(0); // Reset photo index
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handlePhotoNav = (direction) => {
    const currentProfile = profiles[currentIndex];
    if (!currentProfile || !currentProfile.photos) return;

    if (direction === 'next' && currentPhotoIndex < currentProfile.photos.length - 1) {
      setCurrentPhotoIndex(currentPhotoIndex + 1);
    } else if (direction === 'prev' && currentPhotoIndex > 0) {
      setCurrentPhotoIndex(currentPhotoIndex - 1);
    }
  };

  if (loading) {
    return (
      <div className="browsing-container loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Finding your perfect gym partner...</p>
        </div>
      </div>
    );
  }

  if (profiles.length === 0 || currentIndex >= profiles.length) {
    return (
      <div className="browsing-container">
        <div className="no-more-profiles">
          <div className="no-more-content">
            <h2>No more profiles!</h2>
            <p>Check back later or adjust your preferences.</p>
            <button onClick={() => {
              setLoading(true);
              setCurrentIndex(0);
              loadProfiles();
            }}>
              Refresh
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentProfile = profiles[currentIndex];
  const currentPhoto = currentProfile.photos && currentProfile.photos[currentPhotoIndex];

  return (
    <div className="browsing-container">
      <div className="crush-balance-indicator">
        {hasSubscription ? (
          <span className="unlimited-badge">∞ Unlimited</span>
        ) : (
          <span className="crush-count">{crushBalance} crushes</span>
        )}
      </div>

      <div className="browse-header">
        <h1>Find Your Gym Crush</h1>
        <div className="header-stats">
          <span className="profile-counter">
            {currentIndex + 1} of {profiles.length}
          </span>
        </div>
      </div>

      <div className="profile-card">
        <div className="profile-card-image-container">
          {currentProfile.photos && currentProfile.photos.length > 0 ? (
            <>
              <img 
                src={currentPhoto?.url || currentPhoto?.thumbnailUrl} 
                alt={currentProfile.username}
                className="profile-card-image"
              />
              {currentProfile.photos.length > 1 && (
                <>
                  <div className="photo-indicators">
                    {currentProfile.photos.map((_, index) => (
                      <span 
                        key={index} 
                        className={`indicator ${index === currentPhotoIndex ? 'active' : ''}`}
                      />
                    ))}
                  </div>
                  <button 
                    className="photo-nav photo-nav-prev" 
                    onClick={() => handlePhotoNav('prev')}
                    disabled={currentPhotoIndex === 0}
                  >
                    ‹
                  </button>
                  <button 
                    className="photo-nav photo-nav-next" 
                    onClick={() => handlePhotoNav('next')}
                    disabled={currentPhotoIndex === currentProfile.photos.length - 1}
                  >
                    ›
                  </button>
                </>
              )}
            </>
          ) : (
            <div className="no-photo-placeholder">
              <span className="placeholder-icon">💪</span>
            </div>
          )}
        </div>

        <div className="profile-info">
          <h2>{currentProfile.username}, {currentProfile.age}</h2>
          <p className="location">{currentProfile.location}</p>
          
          {currentProfile.bio && (
            <div className="bio-section">
              <h3>About</h3>
              <p>{currentProfile.bio}</p>
            </div>
          )}
          
          {currentProfile.interests && currentProfile.interests.length > 0 && (
            <div className="interests-section">
              <h3>Interests</h3>
              <div className="interests-grid">
                {currentProfile.interests.map((interest, index) => (
                  <span key={index} className="interest-chip">{interest}</span>
                ))}
              </div>
            </div>
          )}

          <div className="profile-details">
            <div className="detail-item">
              <span className="label">Height:</span>
              <span className="value">{currentProfile.height || 'Not specified'}</span>
            </div>
            <div className="detail-item">
              <span className="label">Body Type:</span>
              <span className="value">{currentProfile.bodyType || 'Not specified'}</span>
            </div>
            <div className="detail-item">
              <span className="label">Looking For:</span>
              <span className="value">{currentProfile.lookingFor || 'Not specified'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="action-buttons">
        <button 
          className="action-btn rewind-btn" 
          onClick={handleRewind}
          disabled={currentIndex === 0 || sendingCrush}
          title="Go back"
        >
          <span className="icon">↶</span>
        </button>
        
        <button 
          className="action-btn skip-btn" 
          onClick={handleSkip}
          disabled={sendingCrush}
          title="Skip"
        >
          <span className="icon">✕</span>
        </button>
        
        <button 
          className="action-btn crush-btn" 
          onClick={() => handleSendCrush(currentProfile.id)}
          disabled={sendingCrush || (!hasSubscription && crushBalance <= 0)}
          title="Send Crush"
        >
          <span className="icon">💪</span>
        </button>
      </div>
    </div>
  );
};

export default Browsing;