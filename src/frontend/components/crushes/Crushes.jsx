// Crushes Component
// Path: src/frontend/components/crushes/Crushes.jsx
// Purpose: Display crushes sent/received and matches with clickable stat boxes

import React, { useState, useEffect } from 'react';
import './Crushes.css';

const Crushes = () => {
  const [crushesData, setCrushesData] = useState({
    crushesReceived: [],
    crushesSent: [],
    matches: [],
    activeConnections: []
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('received');

  useEffect(() => {
    fetchCrushesData();
  }, []);

  const fetchCrushesData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/crushes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      console.log('Crushes API response:', data);
      console.log('Crushes Received data:', data.crushes.crushesReceived);
      
      if (data.success && data.crushes) {
        setCrushesData({
          crushesReceived: data.crushes.crushesReceived || [],
          crushesSent: data.crushes.crushesSent || [],
          matches: data.crushes.matches || [],
          activeConnections: data.crushes.activeConnections || []
        });
        console.log('Crushes data set:', {
          crushesReceived: data.crushes.crushesReceived || [],
          crushesSent: data.crushes.crushesSent || [],
          matches: data.crushes.matches || [],
          activeConnections: data.crushes.activeConnections || []
        });
      }
    } catch (error) {
      console.error('Error fetching crushes data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewProfile = (userId) => {
    // Navigate to the user's profile
    window.location.href = `/profile/${userId}`;
  };

  const handleSendCrushBack = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/match/send-crush', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ recipientId: userId })
      });

      const data = await response.json();
      if (data.success) {
        alert('Crush sent! 💪 You have a match!');
        fetchCrushesData(); // Refresh the crushes
      }
    } catch (error) {
      console.error('Error sending crush:', error);
    }
  };

  if (loading) {
    return (
      <div className="crushes-container">
        <div className="loading">Loading your crushes... 💪</div>
      </div>
    );
  }

  return (
    <div className="crushes-container">
      <div className="crushes-header">
        <h1>My Crushes 💪</h1>
        <p className="crushes-subtitle">Track your fitness connections</p>
      </div>

      {/* Clickable Stats Boxes with key to force re-render */}
      <div className="crushes-stats" key={JSON.stringify(crushesData)}>
        <div 
          className={`stat-box clickable ${activeTab === 'received' ? 'active' : ''}`}
          onClick={() => setActiveTab('received')}
        >
          <span className="stat-number">{crushesData.crushesReceived.length}</span>
          <span className="stat-label">Crushes Received</span>
        </div>
        <div 
          className={`stat-box clickable ${activeTab === 'sent' ? 'active' : ''}`}
          onClick={() => setActiveTab('sent')}
        >
          <span className="stat-number">{crushesData.crushesSent.length}</span>
          <span className="stat-label">Crushes Sent</span>
        </div>
        <div 
          className={`stat-box clickable matches ${activeTab === 'matches' ? 'active' : ''}`}
          onClick={() => setActiveTab('matches')}
        >
          <span className="stat-number">{crushesData.matches?.length || 0}</span>
          <span className="stat-label">Matches</span>
        </div>
        <div 
          className={`stat-box clickable connections ${activeTab === 'active' ? 'active' : ''}`}
          onClick={() => setActiveTab('active')}
        >
          <span className="stat-number">{crushesData.activeConnections.length}</span>
          <span className="stat-label">Active Connections</span>
        </div>
      </div>

      {/* Content Area */}
      <div className="crushes-content">
        {activeTab === 'received' && (
          <div className="crushes-grid">
            {crushesData.crushesReceived.length > 0 ? (
              crushesData.crushesReceived.map(crush => {
                // Check if we already sent a crush back to this person
                const alreadySentBack = crushesData.crushesSent.some(
                  sentCrush => sentCrush._id === crush._id
                ) || crushesData.matches.some(
                  match => match._id === crush._id
                );
                
                return (
                  <div key={crush._id} className="crush-card">
                    <div className="crush-photo">
                      {crush.profile?.photos?.[0] ? (
                        <img 
                          src={crush.profile.photos[0].thumbnailUrl || crush.profile.photos[0].url} 
                          alt={crush.username} 
                        />
                      ) : (
                        <div className="no-photo">💪</div>
                      )}
                    </div>
                    <div className="crush-info">
                      <h3>{crush.username}</h3>
                      <p className="crush-details">
                        {crush.profile?.age || '??'} • {crush.profile?.location || 'Location not set'}
                      </p>
                      <button 
                        className="view-profile-btn"
                        onClick={() => handleViewProfile(crush._id)}
                      >
                        View Profile
                      </button>
                      {alreadySentBack ? (
                        <button 
                          className="crush-sent-btn"
                          disabled
                        >
                          Crush Sent ✓
                        </button>
                      ) : (
                        <button 
                          className="send-crush-btn"
                          onClick={() => handleSendCrushBack(crush._id)}
                        >
                          Send Crush Back
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="empty-state">
                <span className="empty-icon">🏋️</span>
                <p>No crushes received yet. Keep building your profile!</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'sent' && (
          <div className="crushes-grid">
            {crushesData.crushesSent.length > 0 ? (
              crushesData.crushesSent.map(crush => (
                <div key={crush._id} className="crush-card">
                  <div className="crush-photo">
                    {crush.profile?.photos?.[0] ? (
                      <img 
                        src={crush.profile.photos[0].thumbnailUrl || crush.profile.photos[0].url} 
                        alt={crush.username} 
                      />
                    ) : (
                      <div className="no-photo">💪</div>
                    )}
                  </div>
                  <div className="crush-info">
                    <h3>{crush.username}</h3>
                    <p className="crush-details">
                      {crush.profile?.age || '??'} • {crush.profile?.location || 'Location not set'}
                    </p>
                    <p className="waiting-text">Waiting for response... 🔥</p>
                    <button 
                      className="view-profile-btn"
                      onClick={() => handleViewProfile(crush._id)}
                    >
                      View Profile
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <span className="empty-icon">🎯</span>
                <p>You haven't sent any crushes yet. Start browsing!</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'matches' && (
          <div className="matches-grid">
            {crushesData.matches.length > 0 ? (
              crushesData.matches.map(match => (
                <div key={match._id} className="match-card">
                  <div className="match-photo">
                    {match.profile?.photos?.[0] ? (
                      <img 
                        src={match.profile.photos[0].thumbnailUrl || match.profile.photos[0].url} 
                        alt={match.username} 
                      />
                    ) : (
                      <div className="no-photo">❤️</div>
                    )}
                  </div>
                  <div className="match-info">
                    <h3>{match.username}</h3>
                    <p className="crush-details">
                      {match.profile?.age || '??'} • {match.profile?.location || 'Location not set'}
                    </p>
                    <p className="match-text">It's a match! 💪❤️</p>
                    <button 
                      className="view-profile-btn"
                      onClick={() => handleViewProfile(match._id)}
                    >
                      View Profile
                    </button>
                    <button 
                      className="message-btn"
                      onClick={() => window.location.href = `/messages/${match._id}`}
                    >
                      Send Message
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <span className="empty-icon">❤️</span>
                <p>No matches yet. When someone you sent a crush to sends one back, you'll match!</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'active' && (
          <div className="connections-grid">
            {crushesData.activeConnections.length > 0 ? (
              crushesData.activeConnections.map(connection => (
                <div key={connection._id} className="connection-card">
                  <div className="connection-photo">
                    {connection.profile?.photos?.[0] ? (
                      <img 
                        src={connection.profile.photos[0].thumbnailUrl || connection.profile.photos[0].url} 
                        alt={connection.username} 
                      />
                    ) : (
                      <div className="no-photo">🔥</div>
                    )}
                  </div>
                  <div className="connection-info">
                    <h3>{connection.username}</h3>
                    <p className="crush-details">
                      {connection.profile?.age || '??'} • {connection.profile?.location || 'Location not set'}
                    </p>
                    <p className="connection-status">🔥 Actively chatting</p>
                    <button 
                      className="view-profile-btn"
                      onClick={() => handleViewProfile(connection._id)}
                    >
                      View Profile
                    </button>
                    <button 
                      className="continue-chat-btn"
                      onClick={() => alert('Opening chat... 💬')}
                    >
                      Continue Chat
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <span className="empty-icon">🔥</span>
                <p>No active conversations yet. Start chatting with your matches!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Crushes;