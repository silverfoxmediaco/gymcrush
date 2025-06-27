// Browsing Component
// Path: src/frontend/components/browse/Browsing.jsx
// Purpose: Browse all profiles in a responsive grid layout

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../Footer';
import './Browsing.css';

const Browsing = () => {
  const [profiles, setProfiles] = useState([]);
  const [crushesRemaining, setCrushesRemaining] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sentCrushes, setSentCrushes] = useState(new Set());
  const navigate = useNavigate();

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

      const response = await fetch('/api/profile/all', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setProfiles(data.profiles);
        setCrushesRemaining(data.seedsRemaining);
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

  const handleSendCrush = async (profileId) => {
    if (crushesRemaining === 0) {
      alert('You\'re out of crushes! Visit your profile to get more.');
      return;
    }

    if (sentCrushes.has(profileId)) {
      alert('You\'ve already sent a crush to this person.');
      return;
    }

    try {
      const token = localStorage.getItem('token');

      const response = await fetch('/api/match/send-seed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          recipientId: profileId
        })
      });

      const data = await response.json();

      if (data.success) {
        setCrushesRemaining(data.seedsRemaining);
        setSentCrushes(prev => new Set([...prev, profileId]));
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Send crush error:', error);
      alert('Failed to send crush');
    }
  };

  const handleProfileClick = (profileId) => {
    navigate(`/profile/${profileId}`);
  };

  if (loading) {
    return (
      <div className="browsing-container">
        <div className="loading-message">
          <p>Finding your perfect gym matches...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="browsing-container">
        <div className="error-message">
          <p>{error}</p>
          <button className="btn-primary" onClick={() => navigate('/')}>Go Back</button>
        </div>
      </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <div className="browsing-container">
        <div className="no-profiles-message">
          <h2>No profiles available</h2>
          <p>Check back later for new gym members.</p>
          <button className="btn-primary" onClick={() => navigate('/')}>Visit My Crushes</button>
        </div>
      </div>
    );
  }

  return (
    <div className="browsing-page-container">
      <div className="browsing-container">
        <div className="profiles-grid">
          {profiles.map((profile) => (
            <div key={profile.id} className="profile-card-browse">
              <div
                className="profile-image-container"
                onClick={() => handleProfileClick(profile.id)}
                style={{
                  backgroundImage: profile.photos && profile.photos.length > 0 
                    ? `url(${profile.photos[0].url || profile.photos[0]})`
                    : 'none',
                  backgroundColor: profile.photos && profile.photos.length > 0 
                    ? 'transparent' 
                    : '#FF3B30'
                }}
              >
                <div className="profile-gradient-overlay">
                  {(!profile.photos || profile.photos.length === 0) && (
                    <div className="no-photo-placeholder">
                      <span>💪</span>
                      <p>No photo yet</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="profile-info-bottom">
                <h3 className="profile-name">{profile.username}, {profile.age || '??'}</h3>
                <p className="profile-location">{profile.location || 'Location not set'}</p>

                <button 
                  className={`crush-btn ${sentCrushes.has(profile.id) ? 'crush-sent' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSendCrush(profile.id);
                  }}
                  disabled={crushesRemaining === 0 || sentCrushes.has(profile.id)}
                >
                  {sentCrushes.has(profile.id) ? (
                    <><span className="btn-icon">✓</span><span>Crush Sent</span></>
                  ) : (
                    <><span className="btn-icon">🔥</span><span>Send Crush</span></>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {crushesRemaining === 0 && (
          <div className="out-of-crushes-overlay">
            <p>You're out of crushes!</p>
            <button className="cta-btn" onClick={() => navigate('/profile')}>Get More Crushes</button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Browsing;