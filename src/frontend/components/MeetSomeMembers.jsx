// MeetSomeMembers Component
// Path: src/frontend/components/MeetSomeMembers.jsx
// Purpose: Display member statistics and actual member profiles on landing page

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './MeetSomeMembers.css';

const MeetSomeMembers = ({ onSignupClick }) => {
  const navigate = useNavigate();
  
  // Manual stats configuration
  const MANUAL_STATS = {
    total: 2847,
    newThisWeek: 124,
    successStories: 186,
    activeMembers: 1892
  };
  
  // Initialize with 0 for animation
  const [memberStats, setMemberStats] = useState({
    total: 0,
    newThisWeek: 0,
    successStories: 0,
    activeMembers: 0
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
    // Animate the stats numbers
    const animateStats = () => {
      const duration = 2000; // 2 seconds
      const steps = 60;
      const interval = duration / steps;
      let currentStep = 0;

      const timer = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;
        
        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        
        setMemberStats({
          total: Math.floor(MANUAL_STATS.total * easeOutQuart),
          newThisWeek: Math.floor(MANUAL_STATS.newThisWeek * easeOutQuart),
          successStories: Math.floor(MANUAL_STATS.successStories * easeOutQuart),
          activeMembers: Math.floor(MANUAL_STATS.activeMembers * easeOutQuart)
        });

        if (currentStep >= steps) {
          clearInterval(timer);
          setMemberStats(MANUAL_STATS); // Ensure exact final values
          setLoading(false); // Remove loading state after animation
        }
      }, interval);

      return () => clearInterval(timer);
    };

    // Start animation after a short delay
    const animationTimeout = setTimeout(() => {
      animateStats();
    }, 300);

    // Fetch actual member profiles
    fetch('/api/members/featured')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          // Shuffle the members array to show in random order
          const shuffledMembers = [...data.members].sort(() => Math.random() - 0.5);
          setMembers(shuffledMembers);
        }
      })
      .catch(err => {
        console.error('Failed to fetch members:', err);
      });

    return () => clearTimeout(animationTimeout);
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
              {memberStats.total.toLocaleString()}
            </div>
            <div className="stat-label">Gym Crushers</div>
          </div>
          <div className="stat-card">
            <div className={`stat-number ${loading ? 'loading' : ''}`}>
              {memberStats.newThisWeek.toLocaleString()}
            </div>
            <div className="stat-label">New This Week</div>
          </div>
          <div className="stat-card">
            <div className={`stat-number ${loading ? 'loading' : ''}`}>
              {memberStats.successStories.toLocaleString()}
            </div>
            <div className="stat-label">Success Stories</div>
          </div>
          <div className="stat-card">
            <div className={`stat-number ${loading ? 'loading' : ''}`}>
              {memberStats.activeMembers.toLocaleString()}
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