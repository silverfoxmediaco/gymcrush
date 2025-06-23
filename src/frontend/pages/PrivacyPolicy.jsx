// Privacy Policy Page
// Path: src/frontend/pages/PrivacyPolicy.jsx
// Purpose: Display privacy policy for Wallflower.me

import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './PrivacyPolicy.css';

const PrivacyPolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const currentDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="privacy-page">
      <div className="privacy-container">
        <div className="privacy-header">
          <h1 className="privacy-title">Privacy Policy</h1>
          <p className="privacy-effective-date">Effective Date: {currentDate}</p>
        </div>

        <div className="privacy-body">
          <p className="privacy-intro">
            Wallflower.me ("Wallflower", "we", "our", or "us") respects your privacy. 
            This Privacy Policy explains how we collect, use, and protect your information 
            when you use our website, app, or services (collectively, the "Service").
          </p>

          <section className="privacy-section">
            <h2 className="privacy-section-title">1. Information We Collect</h2>
            
            <div className="privacy-subsection">
              <h3 className="privacy-subsection-title">a. Information You Provide</h3>
              <ul className="privacy-list">
                <li>Name, email, date of birth, gender, preferences, and profile information.</li>
                <li>Messages, photos, or other content you submit.</li>
                <li>Payment information (if using paid features).</li>
              </ul>
            </div>

            <div className="privacy-subsection">
              <h3 className="privacy-subsection-title">b. Automatically Collected Information</h3>
              <ul className="privacy-list">
                <li>IP address, device type, browser information.</li>
                <li>Usage data such as page visits and interactions.</li>
                <li>Location (if enabled).</li>
              </ul>
            </div>

            <div className="privacy-subsection">
              <h3 className="privacy-subsection-title">c. Cookies and Tracking</h3>
              <p className="privacy-text">
                We use cookies and similar technologies to enhance your experience, 
                remember preferences, and analyze site usage.
              </p>
            </div>
          </section>

          <section className="privacy-section">
            <h2 className="privacy-section-title">2. How We Use Your Information</h2>
            <p className="privacy-text">We use your information to:</p>
            <ul className="privacy-list">
              <li>Create and manage your account.</li>
              <li>Match you with compatible users.</li>
              <li>Personalize your experience.</li>
              <li>Communicate updates, offers, or support messages.</li>
              <li>Improve our Service and develop new features.</li>
              <li>Comply with legal obligations.</li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2 className="privacy-section-title">3. Sharing Your Information</h2>
            <p className="privacy-text">
              We do <strong>not sell</strong> your personal information. We may share data with:
            </p>
            <ul className="privacy-list">
              <li>Service providers (e.g., hosting, analytics, payment processors).</li>
              <li>Law enforcement or regulators when required by law.</li>
              <li>Other users, <strong>only</strong> to the extent you voluntarily share information in your profile or messages.</li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2 className="privacy-section-title">4. Data Retention</h2>
            <p className="privacy-text">
              We retain your data as long as your account is active or as needed for 
              legitimate purposes (e.g., legal compliance, security, account recovery). 
              You may request deletion at any time.
            </p>
          </section>

          <section className="privacy-section">
            <h2 className="privacy-section-title">5. Your Rights and Choices</h2>
            <p className="privacy-text">
              Depending on your location, you may have rights to:
            </p>
            <ul className="privacy-list">
              <li>Access, correct, or delete your personal data.</li>
              <li>Object to or restrict certain data uses.</li>
              <li>Withdraw consent (e.g., for marketing emails).</li>
              <li>Export your data in a portable format.</li>
            </ul>
            <p className="privacy-text">
              To exercise any of these rights, contact us at:{' '}
              <a href="mailto:privacy@wallflower.me" className="privacy-link">
                privacy@wallflower.me
              </a>
            </p>
          </section>

          <section className="privacy-section">
            <h2 className="privacy-section-title">6. Children's Privacy</h2>
            <p className="privacy-text">
              Wallflower is not intended for users under the age of 18. 
              We do not knowingly collect data from minors.
            </p>
          </section>

          <section className="privacy-section">
            <h2 className="privacy-section-title">7. Data Security</h2>
            <p className="privacy-text">
              We use industry-standard security measures to protect your information. 
              However, no system is 100% secure, so we encourage you to take precautions 
              (like using a strong password).
            </p>
          </section>

          <section className="privacy-section">
            <h2 className="privacy-section-title">8. International Users</h2>
            <p className="privacy-text">
              If you are outside the United States, you consent to processing your data 
              in the U.S., where privacy laws may differ.
            </p>
          </section>

          <section className="privacy-section">
            <h2 className="privacy-section-title">9. Changes to This Policy</h2>
            <p className="privacy-text">
              We may update this Privacy Policy from time to time. If changes are material, 
              we'll notify you through the app or website.
            </p>
          </section>

          <section className="privacy-section">
            <h2 className="privacy-section-title">10. Contact Us</h2>
            <p className="privacy-text">
              For any questions or privacy concerns, please contact:
            </p>
            <p className="privacy-contact">
              <a href="mailto:privacy@wallflower.me">privacy@wallflower.me</a>
            </p>
          </section>
        </div>

        <div className="privacy-footer">
          <Link to="/" className="btn btn-secondary">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;