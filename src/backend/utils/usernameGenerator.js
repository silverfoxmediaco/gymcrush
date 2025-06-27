// Username Generator Utility
// Path: src/backend/utils/usernameGenerator.js

const User = require('../models/User');

// Fitness-themed username components
const adjectives = [
  'Strong', 'Fit', 'Swift', 'Power', 'Iron', 'Steel', 'Mighty', 'Athletic',
  'Dynamic', 'Active', 'Muscle', 'Flex', 'Beast', 'Alpha', 'Elite', 'Prime',
  'Ultra', 'Super', 'Turbo', 'Max', 'Peak', 'Core', 'Ripped', 'Shredded',
  'Bulk', 'Lean', 'Agile', 'Fierce', 'Bold', 'Pump', 'Grind', 'Hustle'
];

const nouns = [
  'Warrior', 'Athlete', 'Runner', 'Lifter', 'Crusher', 'Builder', 'Fighter',
  'Champion', 'Legend', 'Beast', 'Wolf', 'Lion', 'Tiger', 'Eagle', 'Hawk',
  'Phoenix', 'Titan', 'Viking', 'Spartan', 'Ninja', 'Samurai', 'Knight',
  'Machine', 'Force', 'Storm', 'Thunder', 'Blaze', 'Volt', 'Surge', 'Flash'
];

const activities = [
  'Lift', 'Run', 'Jump', 'Climb', 'Sprint', 'Train', 'Pump', 'Press',
  'Squat', 'Flex', 'Push', 'Pull', 'Crush', 'Grind', 'Burn', 'Sweat'
];

// Generate a random username
const generateRandomUsername = () => {
  const random = Math.random();
  
  // Different patterns for variety
  if (random < 0.33) {
    // Pattern 1: Adjective + Noun + Number
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const num = Math.floor(Math.random() * 999) + 1;
    return `${adj}${noun}${num}`;
  } else if (random < 0.66) {
    // Pattern 2: Activity + Noun + Number
    const activity = activities[Math.floor(Math.random() * activities.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const num = Math.floor(Math.random() * 99) + 1;
    return `${activity}${noun}${num}`;
  } else {
    // Pattern 3: Gym + Adjective + Number
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const num = Math.floor(Math.random() * 9999) + 1;
    return `Gym${adj}${num}`;
  }
};

// Check if username is available
const isUsernameAvailable = async (username) => {
  const existingUser = await User.findOne({ 
    username: { $regex: new RegExp(`^${username}$`, 'i') } 
  });
  return !existingUser;
};

// Generate multiple unique username suggestions
const generateUsernameSuggestions = async (count = 5, baseUsername = null) => {
  const suggestions = [];
  const maxAttempts = 50; // Prevent infinite loops
  let attempts = 0;
  
  // If baseUsername provided, create variations
  if (baseUsername && baseUsername.length >= 3) {
    const cleanBase = baseUsername.replace(/[^a-zA-Z0-9]/g, '');
    
    // Try base username first
    if (await isUsernameAvailable(cleanBase)) {
      suggestions.push(cleanBase);
    }
    
    // Try variations
    const variations = [
      `${cleanBase}${Math.floor(Math.random() * 999) + 1}`,
      `${cleanBase}_${Math.floor(Math.random() * 99) + 1}`,
      `The${cleanBase}`,
      `${cleanBase}Fit`,
      `Gym${cleanBase}`
    ];
    
    for (const variation of variations) {
      if (suggestions.length >= count) break;
      if (await isUsernameAvailable(variation)) {
        suggestions.push(variation);
      }
    }
  }
  
  // Fill remaining slots with random usernames
  while (suggestions.length < count && attempts < maxAttempts) {
    attempts++;
    const username = generateRandomUsername();
    
    // Check if available and not already in suggestions
    if (!suggestions.includes(username) && await isUsernameAvailable(username)) {
      suggestions.push(username);
    }
  }
  
  return suggestions;
};

module.exports = {
  generateUsernameSuggestions,
  isUsernameAvailable
};

// Auth Controller Addition - Check username availability endpoint
// Path: src/backend/controllers/authController.js

exports.checkUsername = async (req, res) => {
  try {
    const { username } = req.query;
    
    if (!username || username.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Username must be at least 3 characters'
      });
    }
    
    const available = await isUsernameAvailable(username);
    
    res.json({
      success: true,
      available,
      username
    });
  } catch (error) {
    console.error('Check username error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking username'
    });
  }
};

// Get username suggestions endpoint
exports.getUsernameSuggestions = async (req, res) => {
  try {
    const { base } = req.query;
    const suggestions = await generateUsernameSuggestions(5, base);
    
    res.json({
      success: true,
      suggestions
    });
  } catch (error) {
    console.error('Get suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating suggestions'
    });
  }
};

// Auth Routes Addition
// Path: src/backend/routes/authRoutes.js

router.get('/check-username', checkUsername);
router.get('/username-suggestions', getUsernameSuggestions);

// Frontend Component - Username Input with Suggestions
// Path: src/frontend/components/auth/UsernameInput.jsx

import React, { useState, useEffect, useCallback } from 'react';
import debounce from 'lodash/debounce';
import './UsernameInput.css';

const UsernameInput = ({ value, onChange, onValidation }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Debounced username check
  const checkUsername = useCallback(
    debounce(async (username) => {
      if (username.length < 3) {
        setIsAvailable(null);
        return;
      }
      
      setIsChecking(true);
      try {
        const response = await fetch(`/api/auth/check-username?username=${username}`);
        const data = await response.json();
        
        setIsAvailable(data.available);
        onValidation && onValidation(data.available);
        
        // If not available, get suggestions
        if (!data.available) {
          getSuggestions(username);
        }
      } catch (error) {
        console.error('Username check error:', error);
      } finally {
        setIsChecking(false);
      }
    }, 500),
    []
  );

  // Get username suggestions
  const getSuggestions = async (base = '') => {
    try {
      const response = await fetch(`/api/auth/username-suggestions?base=${base}`);
      const data = await response.json();
      
      if (data.success) {
        setSuggestions(data.suggestions);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Get suggestions error:', error);
    }
  };

  useEffect(() => {
    if (value) {
      checkUsername(value);
    }
  }, [value]);

  const handleSelectSuggestion = (username) => {
    onChange(username);
    setShowSuggestions(false);
    setIsAvailable(true);
    onValidation && onValidation(true);
  };

  const handleRefreshSuggestions = () => {
    getSuggestions(value);
  };

  return (
    <div className="username-input-container">
      <div className="username-input-wrapper">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Choose a username"
          className={`username-input ${isAvailable === false ? 'error' : ''} ${isAvailable === true ? 'success' : ''}`}
        />
        {isChecking && <span className="checking-spinner">⟳</span>}
        {!isChecking && isAvailable === true && <span className="check-mark">✓</span>}
        {!isChecking && isAvailable === false && <span className="x-mark">✗</span>}
      </div>
      
      {isAvailable === false && (
        <p className="username-taken">Username is taken. Try one of these:</p>
      )}
      
      {!value && (
        <button 
          type="button"
          className="suggest-btn"
          onClick={() => getSuggestions()}
        >
          Need ideas? Get suggestions
        </button>
      )}
      
      {showSuggestions && suggestions.length > 0 && (
        <div className="suggestions-container">
          <div className="suggestions-header">
            <span>Suggested usernames:</span>
            <button 
              type="button"
              className="refresh-btn"
              onClick={handleRefreshSuggestions}
            >
              🔄
            </button>
          </div>
          <div className="suggestions-list">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                className="suggestion-chip"
                onClick={() => handleSelectSuggestion(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UsernameInput;