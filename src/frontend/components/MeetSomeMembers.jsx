// MeetSomeMembers Component
// Path: src/frontend/components/MeetSomeMembers.jsx
// Purpose: Display member statistics and actual member profiles on landing page

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './MeetSomeMembers.css';

const MeetSomeMembers = ({ onSignupClick }) => {
  const navigate = useNavigate();
  
  // Real data from API
  const [memberStats, setMemberStats] = useState({
    total: '...',
    newThisWeek: '...',
    successStories: '...',
    activeMembers: '...'
  });
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Handle view profile click
  const handleViewProfile = (memberId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      // If not logged in, trigger signup modal
      if (onSignupClick) {
        onSignupClick();
      } else {
        alert('Please sign up or log in to view full profiles! 💪');
      }
    } else {
      // If logged in, navigate to the specific user's profile using React Router
      navigate(`/profile/${memberId}`);
    }
  };

  useEffect(() => {
    // Fetch real member statistics
    fetch('/api/stats/members')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setMemberStats(data.stats);
        }
      })
      .catch(err => {
        console.error('Failed to fetch member stats:', err);
      });

    // Fetch actual member profiles
    fetch('/api/members/featured')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          // Shuffle the members array to show in random order
          const shuffledMembers = [...data.members].sort(() => Math.random() - 0.5);
          setMembers(shuffledMembers);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch members:', err);
        setLoading(false);
      });
  }, []);

  return (
    <section className="current-members" id="current-members">
      <div className="container">
        <div className="members-header">
          <h2 className="section-title">Join The Movement</h2>
          <p className="section-subtitle">
            A community of fitness enthusiasts crushing their goals together
          </p>
        </div>

        {/* Member Statistics */}
        <div className="member-stats">
          <div className="stat-card">
            <div className={`stat-number ${loading ? 'loading' : ''}`}>
              {memberStats.total}
            </div>
            <div className="stat-label">Gym Crushers</div>
          </div>
          <div className="stat-card">
            <div className={`stat-number ${loading ? 'loading' : ''}`}>
              {memberStats.newThisWeek}
            </div>
            <div className="stat-label">New This Week</div>
          </div>
          <div className="stat-card">
            <div className={`stat-number ${loading ? 'loading' : ''}`}>
              {memberStats.successStories}
            </div>
            <div className="stat-label">Success Stories</div>
          </div>
          <div className="stat-card">
            <div className={`stat-number ${loading ? 'loading' : ''}`}>
              {memberStats.activeMembers}
            </div>
            <div className="stat-label">Active Members</div>
          </div>
        </div>

        {/* Featured Members Section */}
        <div className="featured-members-section">
          <h3 className="section-subtitle">Meet Your Future Gym Partners</h3>
          <div className="members-grid">
            {loading ? (
              <div className="loading-message">Loading members...</div>
            ) : members.length > 0 ? (
              members.map(member => (
                <div key={member._id} className="member-card">
                  <div className="member-photo">
                    {member.profile?.photos?.[0] ? (
                      <img 
                        src={member.profile.photos[0].thumbnailUrl || member.profile.photos[0].url} 
                        alt={member.username} 
                      />
                    ) : (
                      <div className="no-photo">
                        <span>💪</span>
                      </div>
                    )}
                  </div>
                  <div className="member-info">
                    <h4 className="member-name">
                      {member.username}, {member.profile?.age || '??'}
                    </h4>
                    <p className="member-location">
                      {member.profile?.location || 'Location not set'}
                    </p>
                    {/* {member.profile?.personalityType && (
                      <span className="personality-badge">
                        {member.profile.personalityType}
                      </span>
                    )}
                    <p className="member-bio">
                      {member.profile?.bio ? 
                        (member.profile.bio.length > 100 ? 
                          member.profile.bio.substring(0, 100) + '...' : 
                          member.profile.bio
                        ) : 
                        'No bio yet'
                      }
                    </p>
                    {member.profile?.interests && member.profile.interests.length > 0 && (
                      <div className="member-interests">
                        {member.profile.interests.slice(0, 3).map((interest, idx) => (
                          <span key={idx} className="interest-tag">{interest}</span>
                        ))}
                        {member.profile.interests.length > 3 && (
                          <span className="more-interests">+{member.profile.interests.length - 3}</span>
                        )}
                      </div>
                    )} */}
                    <button className="view-profile-btn" onClick={() => handleViewProfile(member._id)}>
                      View Profile
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-members-message">
                <p>Be one of the first to join our fitness community! 🔥</p>
              </div>
            )}
          </div>
        </div>

        {/* Community Features section removed */}
      </div>
    </section>
  );
};

export default MeetSomeMembers;