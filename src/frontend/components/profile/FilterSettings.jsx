// FilterSettings Component
// Path: src/frontend/components/profile/FilterSettings.jsx
// Purpose: Allow users to set their matching preferences

import React, { useState, useEffect } from 'react';
import './FilterSettings.css';

const FilterSettings = ({ onSave, initialFilters = {} }) => {
  const [filters, setFilters] = useState({
    ageMin: 18,
    ageMax: 99,
    distance: 50,
    gender: [],
    lookingFor: [],
    heightMin: '',
    heightMax: '',
    interests: [],
    ...initialFilters
  });

  const genderOptions = [
    'Men',
    'Women',
  ];

  const lookingForOptions = [
    'Long-term relationship',
    'Workout partner',
    'Something casual',
    'Not sure yet',
    'New gym buddies'
  ];

  const heightOptions = [];
  for (let feet = 4; feet <= 7; feet++) {
    for (let inches = 0; inches < 12; inches++) {
      if (feet === 7 && inches > 0) break;
      heightOptions.push(`${feet}'${inches}"`);
    }
  }

  const interestOptions = [
    'Weightlifting', 'CrossFit', 'Running', 'Cycling', 'Swimming', 'Yoga',
    'Pilates', 'Boxing', 'MMA', 'Rock Climbing', 'Hiking', 'Dance',
    'Bodybuilding', 'Powerlifting', 'Olympic Lifting', 'Calisthenics',
    'HIIT', 'Spin Classes', 'Martial Arts', 'Tennis', 'Basketball',
    'Soccer', 'Volleyball', 'Nutrition', 'Meal Prep', 'Meditation',
    'Outdoor Activities', 'Adventure Sports', 'Functional Fitness',
    'Group Classes', 'Personal Training'
  ];

  const handleChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMultiSelect = (field, value) => {
    setFilters(prev => {
      // Special handling for gender - only allow one selection
      if (field === 'gender') {
        return {
          ...prev,
          [field]: [value] // Always replace with single value in array
        };
      }
      
      // Rest of the fields work as multi-select
      const currentValues = prev[field] || [];
      const index = currentValues.indexOf(value);
      
      if (index > -1) {
        // Remove if already selected
        return {
          ...prev,
          [field]: currentValues.filter(item => item !== value)
        };
      } else {
        // Add if not selected
        return {
          ...prev,
          [field]: [...currentValues, value]
        };
      }
    });
  };

  const handleSaveFilters = () => {
    if (onSave) {
      onSave(filters);
    }
  };

  const handleResetFilters = () => {
    setFilters({
      ageMin: 18,
      ageMax: 99,
      distance: 50,
      gender: [],
      lookingFor: [],
      heightMin: '',
      heightMax: '',
      interests: []
    });
  };

  return (
    <div className="filter-settings">
      <h3 className="filter-title">Your Match Preferences</h3>
      <p className="filter-subtitle">Tell us who you'd like to meet at GymCrush</p>

      {/* Age Range */}
      <div className="filter-group">
        <label className="filter-label">Age Range</label>
        <div className="range-inputs">
          <input
            type="number"
            min="18"
            max="99"
            value={filters.ageMin}
            onChange={(e) => handleChange('ageMin', parseInt(e.target.value))}
            className="range-input"
          />
          <span className="range-separator">to</span>
          <input
            type="number"
            min="18"
            max="99"
            value={filters.ageMax}
            onChange={(e) => handleChange('ageMax', parseInt(e.target.value))}
            className="range-input"
          />
        </div>
        <div className="range-display">
          {filters.ageMin} - {filters.ageMax} years old
        </div>
      </div>

      {/* Distance */}
      <div className="filter-group">
        <label className="filter-label">Maximum Distance</label>
        <div className="distance-slider">
          <input
            type="range"
            min="5"
            max="200"
            value={filters.distance}
            onChange={(e) => handleChange('distance', parseInt(e.target.value))}
            className="distance-range-slider"
          />
          <div className="distance-display">{filters.distance} miles</div>
        </div>
      </div>

      {/* Gender Preferences */}
      <div className="filter-group">
        <label className="filter-label">Show Me</label>
        <div className="multi-select-grid">
          {genderOptions.map(option => (
            <button
              key={option}
              className={`filter-chip ${filters.gender.includes(option) ? 'selected' : ''}`}
              onClick={() => handleMultiSelect('gender', option)}
            >
              {option}
            </button>
          ))}
        </div>
        {filters.gender.length === 0 && (
          <p className="filter-hint">Please select at least one option</p>
        )}
      </div>

      {/* Looking For */}
      <div className="filter-group">
        <label className="filter-label">Looking For</label>
        <div className="multi-select-grid">
          {lookingForOptions.map(option => (
            <button
              key={option}
              className={`filter-chip ${filters.lookingFor.includes(option) ? 'selected' : ''}`}
              onClick={() => handleMultiSelect('lookingFor', option)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* Height Range */}
      <div className="filter-group">
        <label className="filter-label">Height Range (Optional)</label>
        <div className="range-selects">
          <select
            value={filters.heightMin}
            onChange={(e) => handleChange('heightMin', e.target.value)}
            className="height-select"
          >
            <option value="">No minimum</option>
            {heightOptions.map(height => (
              <option key={height} value={height}>{height}</option>
            ))}
          </select>
          <span className="range-separator">to</span>
          <select
            value={filters.heightMax}
            onChange={(e) => handleChange('heightMax', e.target.value)}
            className="height-select"
          >
            <option value="">No maximum</option>
            {heightOptions.map(height => (
              <option key={height} value={height}>{height}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="filter-actions">
        <button 
          className="preferencesbtn"
          onClick={handleResetFilters}
        >
          Reset to Defaults
        </button>
        <button 
          className="btn-primary"
          onClick={handleSaveFilters}
        >
          Save Preferences
        </button>
      </div>
    </div>
  );
};

export default FilterSettings;