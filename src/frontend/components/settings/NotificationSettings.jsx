// Notification Settings Component
// Path: src/frontend/components/settings/NotificationSettings.jsx
// Purpose: Allow users to manage their email notification preferences

import React, { useState, useEffect } from 'react';
import './NotificationSettings.css';

const NotificationSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notifications, setNotifications] = useState({
    emailEnabled: true,
    crushReceived: true,
    newMessage: true,
    newMatch: true,
    lowCrushBalance: true,
    marketing: false
  });
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    loadNotificationSettings();
  }, []);

  const loadNotificationSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success && data.profile?.profile?.notifications) {
        setNotifications(data.profile.profile.notifications);
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (setting) => {
    setNotifications(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
    setSaveMessage(''); // Clear any previous save message
  };

  const handleMasterToggle = () => {
    const newEmailEnabled = !notifications.emailEnabled;
    setNotifications(prev => ({
      ...prev,
      emailEnabled: newEmailEnabled,
      // If turning off all emails, keep individual preferences but they won't be used
      // If turning on, keep existing individual preferences
    }));
    setSaveMessage('');
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMessage('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/profile/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ notifications })
      });

      const data = await response.json();
      
      if (data.success) {
        setSaveMessage('Settings saved successfully!');
        setTimeout(() => setSaveMessage(''), 3000);
      } else {
        setSaveMessage('Failed to save settings. Please try again.');
      }
    } catch (error) {
      console.error('Error saving notification settings:', error);
      setSaveMessage('Error saving settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="notification-settings">
        <div className="loading-message">Loading notification settings...</div>
      </div>
    );
  }

  return (
    <div className="notification-settings">
      <h2>Email Notification Preferences</h2>
      <p className="settings-subtitle">
        Choose which email notifications you'd like to receive from GymCrush
      </p>

      {/* Master Toggle */}
      <div className="master-toggle-section">
        <div className="setting-item master-toggle">
          <div className="setting-info">
            <h3>Email Notifications</h3>
            <p>Master switch for all email notifications</p>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={notifications.emailEnabled}
              onChange={handleMasterToggle}
            />
            <span className="toggle-slider-master"></span>
          </label>
        </div>
      </div>

      {/* Individual Settings */}
      <div className={`individual-settings ${!notifications.emailEnabled ? 'disabled' : ''}`}>
        <h3>Notification Types</h3>
        
        <div className="setting-item">
          <div className="setting-info">
            <h4>New Crushes Received</h4>
            <p>Get notified when someone sends you a crush</p>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={notifications.crushReceived}
              onChange={() => handleToggle('crushReceived')}
              disabled={!notifications.emailEnabled}
            />
            <span className="toggle-slider-crush"></span>
          </label>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <h4>New Messages</h4>
            <p>Get notified when you receive a message from a match</p>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={notifications.newMessage}
              onChange={() => handleToggle('newMessage')}
              disabled={!notifications.emailEnabled}
            />
            <span className="toggle-slider-message"></span>
          </label>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <h4>New Matches</h4>
            <p>Get notified when you and another user exchange crushes</p>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={notifications.newMatch}
              onChange={() => handleToggle('newMatch')}
              disabled={!notifications.emailEnabled}
            />
            <span className="toggle-slider-match"></span>
          </label>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <h4>Low Crush Balance</h4>
            <p>Get notified when your crush balance drops below 5</p>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={notifications.lowCrushBalance}
              onChange={() => handleToggle('lowCrushBalance')}
              disabled={!notifications.emailEnabled}
            />
            <span className="toggle-slider-balance"></span>
          </label>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <h4>Fitness Tips & Updates</h4>
            <p>Receive workout tips, feature updates, and special offers</p>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={notifications.marketing}
              onChange={() => handleToggle('marketing')}
              disabled={!notifications.emailEnabled}
            />
            <span className="toggle-slider-marketing"></span>
          </label>
        </div>
      </div>

      {/* Save Button and Message */}
      <div className="settings-actions">
        {saveMessage && (
          <div className={`save-message ${saveMessage.includes('success') ? 'success' : 'error'}`}>
            {saveMessage}
          </div>
        )}
        <button 
          className="btn btn-primary save-button"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      <div className="settings-note">
        <p>
          <strong>Note:</strong> You can unsubscribe from emails at any time by clicking 
          the unsubscribe link in any email we send you.
        </p>
      </div>
    </div>
  );
};

export default NotificationSettings;