// ForgotPasswordModal Component
// Path: src/frontend/components/ForgotPasswordModal.jsx
// Purpose: Modal for requesting password reset

import React, { useState, useEffect } from 'react';
import './SignupModal.css'; // Reuse the same styles

const ForgotPasswordModal = ({ isOpen, onClose, onBackToLogin }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        setIsVisible(true);
      }, 10);
    } else {
      setIsVisible(false);
      // Reset state when closing
      setTimeout(() => {
        setEmail('');
        setError('');
        setSuccess(false);
      }, 300);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
      } else {
        setError(data.message || 'Failed to send reset email');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setError('Something went wrong. Please try again.');
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
          <h2 className="modal-title">Reset Your Password 🔥</h2>
          {!success && (
            <p className="modal-subtitle">
              No sweat! We'll help you get back to crushing it
            </p>
          )}
        </div>

        {!success ? (
          <form onSubmit={handleSubmit} className="signup-form">
            {error && (
              <div className="error-message general-error">
                {error}
              </div>
            )}
            
            <div className="form-group">
              <label htmlFor="forgot-email">Email Address</label>
              <input
                type="email"
                id="forgot-email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className={error ? 'error' : ''}
                disabled={loading}
              />
              <small className="form-hint">
                We'll send a password reset link to this email
              </small>
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={() => {
                  handleClose();
                  if (onBackToLogin) onBackToLogin();
                }}
              >
                Back to Login
              </button>
              <button 
                type="submit" 
                className="btn-primary"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </div>
          </form>
        ) : (
          <div className="success-message-container">
            <div className="success-icon">💪</div>
            <h3>Check Your Email!</h3>
            <p className="success-text">
              We've sent a password reset link to <strong>{email}</strong>
            </p>
            <p className="success-hint">
              The link will expire in 1 hour - like your pump if you skip the gym! Don't forget to check your spam folder.
            </p>
            <button 
              className="btn-primary" 
              onClick={() => {
                handleClose();
                if (onBackToLogin) onBackToLogin();
              }}
            >
              Back to Login
            </button>
          </div>
        )}

        <div className="modal-footer">
          <p>
            Remember your password? 
            <a 
              href="#login" 
              className="login-link" 
              onClick={(e) => {
                e.preventDefault();
                handleClose();
                if (onBackToLogin) onBackToLogin();
              }}
            >
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;