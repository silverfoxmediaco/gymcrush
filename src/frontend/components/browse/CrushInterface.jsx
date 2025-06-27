// CrushInterface Component
// Path: src/frontend/components/browse/CrushInterface.jsx
// Purpose: Browse profiles with full-screen swipe interface

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './CrushInterface.css';

const CrushInterface = () => {
  const [profiles, setProfiles] = useState([]);
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [crushesRemaining, setCrushesRemaining] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragCurrent, setDragCurrent] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [passedProfiles, setPassedProfiles] = useState(new Set());
  const [isAnimating, setIsAnimating] = useState(false);
  const navigate = useNavigate();
  const cardRef = useRef(null);

  // Improved swipe thresholds
  const swipeThreshold = window.innerWidth * 0.2; // 20% of screen width for easier swiping
  const velocityThreshold = 0.5; // Velocity in px/ms
  const rotationMultiplier = 0.2;
  const tapThreshold = 5; // Reduced for better tap detection
  const maxRotation = 30; // Maximum rotation in degrees

  // Track time for velocity calculation
  const [dragStartTime, setDragStartTime] = useState(0);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/');
        return;
      }

      const response = await fetch('/api/match/browse', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setProfiles(data.profiles);
        setCrushesRemaining(data.crushesRemaining);
        setLoading(false);
      } else {
        setError(data.message);
        setLoading(false);
      }
    } catch (error) {
      console.error('Fetch profiles error:', error);
      setError('Failed to load profiles');
      setLoading(false);
    }
  };

  // Handle drag/swipe start
  const handleDragStart = (e) => {
    if (isAnimating) return;
    
    e.preventDefault();
    const startX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    const startY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
    
    setDragStart({ x: startX, y: startY });
    setDragCurrent({ x: startX, y: startY });
    setDragStartTime(Date.now());
    setIsDragging(true);

    // Add transition class
    if (cardRef.current) {
      cardRef.current.style.transition = 'none';
    }
  };

  // Handle drag/swipe move
  const handleDragMove = (e) => {
    if (!isDragging || isAnimating) return;
    
    const currentX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    const currentY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
    
    setDragCurrent({ x: currentX, y: currentY });
    
    // Apply transform to card with improved physics
    if (cardRef.current) {
      const deltaX = currentX - dragStart.x;
      const deltaY = currentY - dragStart.y;
      
      // Calculate rotation based on horizontal movement
      let rotation = deltaX * rotationMultiplier;
      rotation = Math.max(-maxRotation, Math.min(maxRotation, rotation));
      
      // Calculate opacity based on distance
      const distance = Math.abs(deltaX);
      const opacity = Math.max(0.5, 1 - distance / (window.innerWidth * 0.5));
      
      // Apply slight vertical movement for more natural feel
      const translateY = Math.abs(deltaX) * 0.02;
      
      cardRef.current.style.transform = `translate(${deltaX}px, ${translateY}px) rotate(${rotation}deg)`;
      cardRef.current.style.opacity = opacity;

      // Show visual feedback for swipe direction
      const feedbackThreshold = swipeThreshold * 0.5;
      if (deltaX > feedbackThreshold) {
        cardRef.current.classList.add('will-crush');
        cardRef.current.classList.remove('will-pass');
      } else if (deltaX < -feedbackThreshold) {
        cardRef.current.classList.add('will-pass');
        cardRef.current.classList.remove('will-crush');
      } else {
        cardRef.current.classList.remove('will-crush', 'will-pass');
      }
    }
  };

  // Handle drag/swipe end
  const handleDragEnd = (e) => {
    if (!isDragging || isAnimating) return;
    
    const deltaX = dragCurrent.x - dragStart.x;
    const deltaY = Math.abs(dragCurrent.y - dragStart.y);
    
    // Calculate velocity
    const dragEndTime = Date.now();
    const dragDuration = dragEndTime - dragStartTime;
    const velocity = Math.abs(deltaX) / dragDuration;
    
    // Determine if it's a swipe based on distance OR velocity
    const isSwipeRight = deltaX > swipeThreshold || (deltaX > 50 && velocity > velocityThreshold);
    const isSwipeLeft = deltaX < -swipeThreshold || (deltaX < -50 && velocity > velocityThreshold);
    
    // Ignore if too much vertical movement (scrolling)
    if (deltaY > 100) {
      resetCardPosition();
      setIsDragging(false);
      return;
    }
    
    if (cardRef.current) {
      cardRef.current.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
      cardRef.current.classList.remove('will-crush', 'will-pass');
      
      if (isSwipeLeft || isSwipeRight) {
        // Both left and right swipes just browse to next profile
        setIsAnimating(true);
        const direction = isSwipeLeft ? -1 : 1;
        cardRef.current.style.transform = `translateX(${direction * window.innerWidth * 1.5}px) rotate(${direction * 30}deg)`;
        cardRef.current.style.opacity = '0';
        
        setTimeout(() => {
          moveToNextProfile();
          resetCardPosition();
          setIsAnimating(false);
        }, 300);
      } else {
        // Snap back animation
        resetCardPosition();
      }
    }
    
    setIsDragging(false);
    setDragStart({ x: 0, y: 0 });
    setDragCurrent({ x: 0, y: 0 });
  };

  const resetCardPosition = () => {
    if (cardRef.current) {
      cardRef.current.style.transition = 'transform 0.2s ease-out, opacity 0.2s ease-out';
      cardRef.current.style.transform = 'translate(0, 0) rotate(0deg)';
      cardRef.current.style.opacity = '1';
      cardRef.current.classList.remove('swipe-left', 'swipe-right', 'will-crush', 'will-pass');
    }
  };

  const handlePrevious = (e) => {
    if (e) e.stopPropagation();
    
    if (currentProfileIndex > 0) {
      setCurrentProfileIndex(prev => prev - 1);
    } else {
      // If at the beginning, loop to the end
      setCurrentProfileIndex(profiles.length - 1);
    }
  };

  const handleNext = (e) => {
    if (e) e.stopPropagation();
    moveToNextProfile();
  };

  const handleSendCrush = async (e) => {
    // Prevent event bubbling if called from button click
    if (e && e.stopPropagation) {
      e.stopPropagation();
    }
    
    if (crushesRemaining > 0 && profiles[currentProfileIndex]) {
      try {
        const token = localStorage.getItem('token');
        const currentProfile = profiles[currentProfileIndex];

        const response = await fetch('/api/match/send-crush', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            recipientId: currentProfile.id
          })
        });

        const data = await response.json();

        if (data.success) {
          setCrushesRemaining(data.crushesRemaining);
          moveToNextProfile();
        } else {
          alert(data.message);
        }
      } catch (error) {
        console.error('Send crush error:', error);
        alert('Failed to send crush');
      }
    } else if (crushesRemaining === 0) {
      alert('You\'re out of crushes! Visit your profile to get more.');
    }
  };

  const moveToNextProfile = () => {
    if (profiles.length === 0) return;
    
    // Reset card styles before moving to next
    if (cardRef.current) {
      cardRef.current.style.transition = 'none';
      cardRef.current.style.transform = 'translate(0, 0) rotate(0deg)';
      cardRef.current.style.opacity = '1';
    }
    
    // If we're at the end of the list
    if (currentProfileIndex >= profiles.length - 1) {
      // Shuffle profiles and loop back to the beginning
      const shuffled = [...profiles].sort(() => Math.random() - 0.5);
      setProfiles(shuffled);
      setCurrentProfileIndex(0);
    } else {
      // Move to next profile
      setCurrentProfileIndex(prev => prev + 1);
    }
  };

  // Get the next profile indices for preview cards (with looping)
  const getNextProfileIndex = (offset) => {
    if (profiles.length === 0) return null;
    return (currentProfileIndex + offset) % profiles.length;
  };

  // Handle profile card click/tap
  const handleProfileClick = (e) => {
    const moveDistance = Math.abs(dragCurrent.x - dragStart.x) + Math.abs(dragCurrent.y - dragStart.y);
    
    if (!isDragging && !isAnimating && moveDistance < tapThreshold) {
      e.stopPropagation();
      const currentProfile = profiles[currentProfileIndex];
      if (currentProfile && currentProfile.id) {
        navigate(`/profile/${currentProfile.id}`);
      }
    }
  };

  // Prevent default touch behavior on mobile
  useEffect(() => {
    const preventDefaultTouch = (e) => {
      if (e.target.closest('.profile-card-simple')) {
        e.preventDefault();
      }
    };

    document.addEventListener('touchmove', preventDefaultTouch, { passive: false });
    
    return () => {
      document.removeEventListener('touchmove', preventDefaultTouch);
    };
  }, []);

  if (loading) {
    return (
      <div className="crush-container">
        <div className="loading-message">
          <p>Finding your perfect gym matches...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="crush-container">
        <div className="error-message">
          <p>{error}</p>
          <button className="btn-primary" onClick={() => navigate('/')}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Only show "no profiles" if we truly have no profiles
  if (profiles.length === 0) {
    return (
      <div className="crush-container">
        <div className="no-profiles-message">
          <h2>No profiles available</h2>
          <p>Check back later for new gym members.</p>
          <button className="btn-primary" onClick={() => navigate('/crushes')}>
            Visit My Crushes
          </button>
        </div>
      </div>
    );
  }

  const profile = profiles[currentProfileIndex];
  const nextProfile1 = profiles[getNextProfileIndex(1)];
  const nextProfile2 = profiles[getNextProfileIndex(2)];

  return (
    <div className="crush-container">
      {/* Profile Stack */}
      <div className="profile-stack">
        {/* Current Profile Card */}
        <div 
          className={`profile-card-simple ${isDragging ? 'dragging' : ''} ${isAnimating ? 'animating' : ''}`}
          ref={cardRef}
          onClick={handleProfileClick}
          onMouseDown={handleDragStart}
          onMouseMove={handleDragMove}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
          onTouchStart={handleDragStart}
          onTouchMove={handleDragMove}
          onTouchEnd={handleDragEnd}
          style={{
            backgroundImage: profile.photos && profile.photos.length > 0 
              ? `url(${profile.photos[0].url || profile.photos[0]})`
              : 'none',
            backgroundColor: profile.photos && profile.photos.length > 0 
              ? 'transparent' 
              : '#FF3B30',
            touchAction: 'none' // Prevent default touch scrolling
          }}
        >
          {/* Gradient overlay for better text readability */}
          <div className="profile-overlay">
            {/* Top section - badges and photo navigation */}
            <div className="profile-top-section">
              {/* Recently active badge */}
              <span className="active-badge">● Active recently</span>
              
              {/* Photo navigation indicator */}
              {profile.photos && profile.photos.length > 1 && (
                <span className="photo-indicator">
                  1 / {profile.photos.length}
                </span>
              )}
            </div>

            {/* Middle section - spacer */}
            <div className="profile-middle-section">
              {/* Empty space for viewing the photo */}
              {(!profile.photos || profile.photos.length === 0) && (
                <div className="no-photo-icon">
                  <span>💪</span>
                  <p>No photo yet</p>
                </div>
              )}
            </div>

            {/* Bottom section - profile info and actions */}
            <div className="profile-bottom-section">
              {/* Profile info */}
              <div className="profile-info">
                <h2 className="profile-username">{profile.username}</h2>
                {/* Optional: Show if this is a profile you've seen before */}
                {passedProfiles.has(profile.id) && (
                  <span className="seen-before-badge">Seen before</span>
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="action-buttons">
                <button 
                  className="action-btn pass-btn" 
                  onClick={handlePrevious}
                  onMouseDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                  title="Go to Previous Profile"
                  aria-label="View previous profile"
                  disabled={currentProfileIndex === 0 && profiles.length > 0}
                >
                  <span className="btn-icon">⬅️</span>
                  <span className="btn-text">Previous</span>
                </button>
                
                <button 
                  className="action-btn crush-btn" 
                  onClick={handleSendCrush}
                  onMouseDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                  disabled={crushesRemaining === 0 || isAnimating}
                  title="Send a Crush"
                  aria-label="Send a crush to show interest"
                >
                  <span className="btn-icon">🔥</span>
                  <span className="btn-text">Send Crush</span>
                </button>
                
                <button 
                  className="action-btn next-btn"
                  onClick={handleNext}
                  onMouseDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                  title="Go to Next Profile"
                  aria-label="View next profile"
                  disabled={isAnimating}
                >
                  <span className="btn-icon">➡️</span>
                  <span className="btn-text">Next</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Preview of next profiles */}
        {nextProfile1 && (
          <div 
            className="profile-card-simple preview-card" 
            style={{ 
              pointerEvents: 'none',
              backgroundImage: nextProfile1.photos?.[0] 
                ? `url(${nextProfile1.photos[0].url || nextProfile1.photos[0]})`
                : 'none',
              backgroundColor: nextProfile1.photos?.[0] 
                ? 'transparent' 
                : '#32FF6A'
            }}
          />
        )}

        {nextProfile2 && (
          <div 
            className="profile-card-simple preview-card-2" 
            style={{ 
              pointerEvents: 'none',
              backgroundImage: nextProfile2.photos?.[0] 
                ? `url(${nextProfile2.photos[0].url || nextProfile2.photos[0]})`
                : 'none',
              backgroundColor: nextProfile2.photos?.[0] 
                ? 'transparent' 
                : '#FF2D95'
            }}
          />
        )}
      </div>

      {/* Out of crushes message */}
      {crushesRemaining === 0 && (
        <div className="out-of-crushes-overlay">
          <p>You're out of crushes!</p>
          <button className="cta-btn" onClick={() => navigate('/profile')}>
            Get More Crushes
          </button>
        </div>
      )}
    </div>
  );
};

export default CrushInterface;