// Updated LoginModal Component
// Path: src/frontend/components/LoginModal.jsx
// Purpose: Modal for user authentication with forgot password link

import React, { useState, useEffect } from 'react';
import ForgotPasswordModal from './ForgotPasswordModal';
import './SignupModal.css';

const LoginModal = ({ isOpen, onClose, onSwitchToSignup }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
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
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
      setFormData({
        email: '',
        password: ''
      });
      setErrors({});
    }, 300);
  };

  const handleSwitchToSignup = (e) => {
    e.preventDefault();
    handleClose();
    // Wait for close animation to complete
    setTimeout(() => {
      onSwitchToSignup();
    }, 350);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        handleClose();
        // Redirect to dashboard or reload
        window.location.href = '/browse';
      } else {
        setErrors({ general: data.message || 'Login failed' });
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ general: 'Something went wrong. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen && !showForgotPassword) return null;

  return (
    <>
      {!showForgotPassword && (
        <div className={`modal-overlay ${isVisible ? 'active' : ''}`} onClick={handleClose}>
          <div className={`modal-content ${isVisible ? 'active' : ''}`} onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={handleClose}>×</button>
            
            <div className="modal-header">
              <h2 className="modal-title">Welcome Back</h2>
              <p className="modal-subtitle">Ready to crush your fitness goals?</p>
            </div>

            <form onSubmit={handleSubmit} className="signup-form">
              {errors.general && (
                <div className="error-message general-error">
                  {errors.general}
                </div>
              )}
              
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
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  className={errors.password ? 'error' : ''}
                />
                {errors.password && <span className="error-message">{errors.password}</span>}
                
                {/* Forgot Password Link */}
                <a 
                  href="#forgot" 
                  className="forgot-password-link"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowForgotPassword(true);
                  }}
                >
                  Forgot your password?
                </a>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={handleClose}>
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Crushing it...' : 'Let\'s Go!'}
                </button>
              </div>
            </form>

            <div className="modal-footer">
              <p>New to GymCrush? <a href="#signup" className="login-link" onClick={handleSwitchToSignup}>Join the movement</a></p>
            </div>
          </div>
        </div>
      )}

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
        onBackToLogin={() => {
          setShowForgotPassword(false);
          setIsVisible(true);
        }}
      />
    </>
  );
};

export default LoginModal;