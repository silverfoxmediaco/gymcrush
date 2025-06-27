// Browsing Component
// Path: src/frontend/components/browse/Browsing.jsx
// Purpose: Main browsing interface with swipeable cards and action buttons

import React, { useState, useEffect } from 'react';
import ProfileCard from './ProfileCard';
import NoMoreProfiles from './NoMoreProfiles';
import MatchModal from './MatchModal';
import SuperCrushAnimation from './SuperCrushAnimation';
import './Browsing.css';

const Browsing = () => {
  const [profiles, setProfiles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showMatch, setShowMatch] = useState(false);
  const [matchedUser, setMatchedUser] = useState(null);
  const [showSuperCrush, setShowSuperCrush] = useState(false);
  const [crushBalance, setCrushBalance] = useState(0);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [sendingCrush, setSendingCrush] = useState(false);

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

  const handleSendCrush = async (userId, isSuperCrush = false) => {
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
          recipientId: userId,
          isSuperCrush: isSuperCrush 
        })
      });

      const data = await response.json();
      
      if (data.success) {
        if (isSuperCrush) {
          setShowSuperCrush(true);
          setTimeout(() => setShowSuperCrush(false), 3000);
        }

        if (data.isMatch) {
          const matchedProfile = profiles[currentIndex];
          setMatchedUser(matchedProfile);
          setShowMatch(true);
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
          // Optionally redirect to profile
          // window.location.href = '/profile';
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
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    setCurrentIndex(0);
    loadProfiles();
    loadCrushBalance();
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
    return <NoMoreProfiles onRefresh={handleRefresh} />;
  }

  const currentProfile = profiles[currentIndex];

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

      <div className="cards-container">
        <ProfileCard 
          profile={currentProfile}
          onCrush={() => handleSendCrush(currentProfile.id)}
          onSkip={handleSkip}
          isLoading={sendingCrush}
        />
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
        
        <button 
          className="action-btn super-crush-btn" 
          onClick={() => handleSendCrush(currentProfile.id, true)}
          disabled={sendingCrush || (!hasSubscription && crushBalance <= 0)}
          title="Super Crush!"
        >
          <span className="icon">⚡</span>
        </button>
      </div>

      {showMatch && matchedUser && (
        <MatchModal 
          user={matchedUser} 
          onClose={() => {
            setShowMatch(false);
            setMatchedUser(null);
          }} 
        />
      )}

      {showSuperCrush && <SuperCrushAnimation />}
    </div>
  );
};

export default Browsing;