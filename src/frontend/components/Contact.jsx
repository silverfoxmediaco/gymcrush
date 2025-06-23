// Contact Component
// Path: src/frontend/components/Contact.jsx
// Purpose: Contact form for user inquiries and support

import React, { useState } from 'react';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const subjectOptions = [
    'General Inquiry',
    'Technical Support',
    'Account Issue',
    'Safety Concern',
    'Feature Request',
    'Bug Report',
    'Other'
  ];

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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.subject) {
      newErrors.subject = 'Please select a subject';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        setSubmitStatus('success');
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: ''
        });
      } else {
        setSubmitStatus('error');
        setErrors({ general: data.message || 'Failed to send message' });
      }
    } catch (error) {
      console.error('Contact form error:', error);
      setSubmitStatus('error');
      setErrors({ general: 'Something went wrong. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-container">
      <div className="contact-header">
        <h1>Get in Touch</h1>
        <p className="contact-subtitle">
          We're here to help make your Wallflower experience bloom
        </p>
      </div>

      <div className="contact-content">
        <div className="contact-info">
          <div className="info-section">
            <h2>How can we help?</h2>
            <p>
              Whether you have a question, need support, or just want to share 
              your thoughts, we'd love to hear from you. Our team typically 
              responds within 24-48 hours.
            </p>
          </div>

          <div className="info-section">
            <h3>Common Topics</h3>
            <div className="topic-list">
              <div className="topic-item">
                <span className="topic-icon">🔐</span>
                <div>
                  <h4>Account & Security</h4>
                  <p>Help with login, password resets, or account settings</p>
                </div>
              </div>
              <div className="topic-item">
                <span className="topic-icon">🌱</span>
                <div>
                  <h4>Seeds & Matching</h4>
                  <p>Questions about how seeds work or matching issues</p>
                </div>
              </div>
              <div className="topic-item">
                <span className="topic-icon">🛡️</span>
                <div>
                  <h4>Safety & Privacy</h4>
                  <p>Report concerns or learn about our safety features</p>
                </div>
              </div>
              <div className="topic-item">
                <span className="topic-icon">💡</span>
                <div>
                  <h4>Suggestions</h4>
                  <p>Share ideas to help Wallflower grow better</p>
                </div>
              </div>
            </div>
          </div>

          <div className="info-section">
            <h3>Before you contact us</h3>
            <p>You might find quick answers in our:</p>
            <ul className="resource-list">
              <li><a href="/faq">Frequently Asked Questions</a></li>
              <li><a href="/community-guidelines">Community Guidelines</a></li>
              <li><a href="/safety">Safety Tips</a></li>
            </ul>
          </div>
        </div>

        <div className="contact-form-section">
          <form onSubmit={handleSubmit} className="contact-form">
            {submitStatus === 'success' && (
              <div className="success-message">
                <span className="success-icon">✓</span>
                <div>
                  <h4>Message sent successfully!</h4>
                  <p>We'll get back to you as soon as possible.</p>
                </div>
              </div>
            )}

            {submitStatus === 'error' && errors.general && (
              <div className="error-message general-error">
                {errors.general}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="name">Your Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter your name"
                className={errors.name ? 'error' : ''}
              />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>

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
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="subject">Subject</label>
              <select
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                className={errors.subject ? 'error' : ''}
              >
                <option value="">Select a topic</option>
                {subjectOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              {errors.subject && <span className="error-text">{errors.subject}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                placeholder="Tell us how we can help..."
                rows="6"
                className={errors.message ? 'error' : ''}
              />
              <span className="char-count">{formData.message.length}/1000</span>
              {errors.message && <span className="error-text">{errors.message}</span>}
            </div>

            <button 
              type="submit" 
              className="submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;