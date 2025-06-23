// SignupModal Component
// Path: src/frontend/components/SignupModal.jsx
// Purpose: Multi-step registration modal for new users

import React, { useState, useEffect } from 'react';
import './SignupModal.css';

const SignupModal = ({ isOpen, onClose, onSwitchToLogin }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    dateOfBirth: '',
    agreeToTerms: false
  });

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        setIsVisible(true);
      }, 10);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleNext = () => {
    const newErrors = {};
    
    if (step === 1) {
      if (!formData.email) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Email is invalid';
      }
      
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      }
      
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    } else if (step === 2) {
      if (!formData.username) {
        newErrors.username = 'Username is required';
      } else if (formData.username.length < 3) {
        newErrors.username = 'Username must be at least 3 characters';
      }
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
      setStep(1);
      setFormData({
        email: '',
        password: '',
        confirmPassword: '',
        username: '',
        dateOfBirth: '',
        agreeToTerms: false
      });
      setErrors({});
    }, 300);
  };

  const handleSwitchToLogin = (e) => {
    e.preventDefault();
    handleClose();
    // Wait for close animation to complete
    setTimeout(() => {
      onSwitchToLogin();
    }, 350);
  };

  const handleSubmit = async () => {
    const newErrors = {};
    
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    } else {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (age < 18 || (age === 18 && monthDiff < 0)) {
        newErrors.dateOfBirth = 'You must be 18 or older';
      }
    }
    
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms';
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,  // Include confirmPassword
          username: formData.username,
          dateOfBirth: formData.dateOfBirth,
        }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        alert(`Welcome to GymCrush, ${data.user.username}! Let's set up your profile and start crushing it!`);
        
        handleClose();
        // Redirect to profile page instead of reloading
        window.location.href = '/profile';
      } else {
        setErrors({ general: data.message || 'Registration failed' });
      }
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ general: 'Something went wrong. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`modal-overlay ${isVisible ? 'active' : ''}`} onClick={handleClose}>
      <div className={`modal-content ${isVisible ? 'active' : ''}`} onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={handleClose}>×</button>
        
        <div className="modal-header">
          <h2 className="modal-title">
            {step === 1 && "Welcome to GymCrush 💪"}
            {step === 2 && "Choose Your Username 🏋️"}
            {step === 3 && "Almost There! 🔥"}
          </h2>
          <p className="modal-subtitle">
            {step === 1 && "Where strength meets chemistry"}
            {step === 2 && "Pick a name that shows your fitness vibe"}
            {step === 3 && "Just a few more reps"}
          </p>
        </div>

        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${(step / 3) * 100}%` }}></div>
        </div>

        <div className="signup-form">
          {errors.general && (
            <div className="error-message general-error">
              {errors.general}
            </div>
          )}
          
          {step === 1 && (
            <div className="form-step">
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your@email.com"
                  className={errors.email ? 'error' : ''}
                />
                <small className="form-hint">We'll never share your email</small>
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="password">Create Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Choose a secure password"
                  className={errors.password ? 'error' : ''}
                />
                <small className="form-hint">At least 8 characters</small>
                {errors.password && <span className="error-message">{errors.password}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Type your password again"
                  className={errors.confirmPassword ? 'error' : ''}
                />
                {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="form-step">
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="e.g., FitWarrior, IronMike, YogaQueen"
                  className={errors.username ? 'error' : ''}
                />
                <small className="form-hint">This is how others will see you</small>
                {errors.username && <span className="error-message">{errors.username}</span>}
              </div>

              <div className="username-suggestions">
                <p className="suggestions-title">Need inspiration?</p>
                <div className="suggestion-chips">
                  <button type="button" className="suggestion-chip" onClick={() => setFormData({...formData, username: 'GymLegend'})}>
                    GymLegend
                  </button>
                  <button type="button" className="suggestion-chip" onClick={() => setFormData({...formData, username: 'FlexMaster'})}>
                    FlexMaster
                  </button>
                  <button type="button" className="suggestion-chip" onClick={() => setFormData({...formData, username: 'FitVibes'})}>
                    FitVibes
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="form-step">
              <div className="form-group">
                <label htmlFor="dateOfBirth">Date of Birth</label>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  className={errors.dateOfBirth ? 'error' : ''}
                />
                <small className="form-hint">You must be 18 or older</small>
                {errors.dateOfBirth && <span className="error-message">{errors.dateOfBirth}</span>}
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleInputChange}
                  />
                  <span>I agree to the Terms of Service and Privacy Policy</span>
                </label>
                {errors.agreeToTerms && <span className="error-message">{errors.agreeToTerms}</span>}
              </div>

              <div className="welcome-message">
                <p>💪 You'll receive <strong>5 free crushes</strong> to start connecting!</p>
                <p>🔥 Get ready to find your perfect workout partner</p>
              </div>
            </div>
          )}

          <div className="form-actions">
            {step > 1 && (
              <button type="button" className="btn-secondary" onClick={handleBack}>
                Back
              </button>
            )}
            
            {step < 3 ? (
              <button type="button" className="btn-primary" onClick={handleNext}>
                Continue
              </button>
            ) : (
              <button 
                type="button" 
                className="btn-primary" 
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? 'Setting up your gym...' : 'Start Crushing'}
              </button>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <p>Already have an account? <a href="#login" className="login-link" onClick={handleSwitchToLogin}>Sign in</a></p>
        </div>
      </div>
    </div>
  );
};

export default SignupModal;