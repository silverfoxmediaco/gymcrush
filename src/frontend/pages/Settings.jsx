// Settings Page Component
// Path: src/frontend/pages/Settings.jsx
// Purpose: Main settings page with tabs for different settings sections

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NotificationSettings from '../components/settings/NotificationSettings';
import './Settings.css';

const Settings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('notifications');

  const tabs = [
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'privacy', label: 'Privacy', icon: '🔒' },
    { id: 'account', label: 'Account', icon: '⚙️' },
    { id: 'billing', label: 'Billing', icon: '💳' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'notifications':
        return <NotificationSettings />;
      case 'privacy':
        return (
          <div className="settings-section">
            <h2>Privacy Settings</h2>
            <p>Privacy settings coming soon...</p>
          </div>
        );
      case 'account':
        return (
          <div className="settings-section">
            <h2>Account Settings</h2>
            <div className="account-actions">
              <button 
                className="btn btn-secondary"
                onClick={() => navigate('/reset-password')}
              >
                Change Password
              </button>
              <button className="btn btn-danger">
                Delete Account
              </button>
            </div>
          </div>
        );
      case 'billing':
        return (
          <div className="settings-section">
            <h2>Billing & Subscription</h2>
            <p>Manage your subscription and payment methods...</p>
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/profile#seeds')}
            >
              Manage Seeds & Subscription
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-container">
        <div className="settings-header">
          <h1>Settings</h1>
          <button 
            className="back-button"
            onClick={() => navigate('/profile')}
          >
            ← Back to Profile
          </button>
        </div>

        <div className="settings-content">
          <div className="settings-tabs">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="tab-icon">{tab.icon}</span>
                <span className="tab-label">{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="tab-content">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;