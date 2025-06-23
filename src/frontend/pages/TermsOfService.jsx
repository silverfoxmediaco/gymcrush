// Terms of Service Page
// Path: src/frontend/pages/TermsOfService.jsx
// Purpose: Display terms of use for Wallflower.me

import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './TermsOfService.css';

const TermsOfService = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const currentDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="terms-page">
      <div className="terms-container">
        <div className="terms-header">
          <h1 className="terms-title">Terms of Use</h1>
          <p className="terms-effective-date">Effective Date: {currentDate}</p>
        </div>

        <div className="terms-body">
          <p className="terms-intro">
            Welcome to <strong>Wallflower.me</strong> ("Wallflower", "we", "our", or "us"). 
            By accessing or using our website, mobile application, or any related services 
            (collectively, the "Service"), you agree to be bound by these Terms of Use ("Terms"). 
            Please read them carefully.
          </p>

          <section className="terms-section">
            <h2 className="terms-section-title">1. Eligibility</h2>
            <p className="terms-text">
              You must be at least 18 years old to use Wallflower. By using the Service, 
              you represent and warrant that:
            </p>
            <ul className="terms-list">
              <li>You are 18 or older.</li>
              <li>You have the authority to enter into these Terms.</li>
              <li>You are not prohibited by law from using our Service.</li>
            </ul>
          </section>

          <section className="terms-section">
            <h2 className="terms-section-title">2. Account Registration</h2>
            <p className="terms-text">
              You agree to provide accurate, current, and complete information when creating 
              an account. You are responsible for maintaining the confidentiality of your 
              login credentials and for all activity under your account.
            </p>
          </section>

          <section className="terms-section">
            <h2 className="terms-section-title">3. Community Guidelines</h2>
            <p className="terms-text">
              Wallflower is a space for respectful and intentional connection. You agree not to:
            </p>
            <ul className="terms-list">
              <li>Harass, abuse, threaten, or intimidate others.</li>
              <li>Impersonate any person or entity.</li>
              <li>Post false, misleading, or inappropriate content.</li>
              <li>Violate any applicable laws or regulations.</li>
            </ul>
            <p className="terms-text">
              We reserve the right to remove content and/or suspend or terminate accounts 
              that violate our guidelines or these Terms.
            </p>
          </section>

          <section className="terms-section">
            <h2 className="terms-section-title">4. User Content</h2>
            <p className="terms-text">
              You retain ownership of any content you post, upload, or submit ("User Content"). 
              By sharing User Content, you grant Wallflower a non-exclusive, royalty-free, 
              worldwide license to use, display, and distribute your content in connection 
              with the Service.
            </p>
          </section>

          <section className="terms-section">
            <h2 className="terms-section-title">5. Paid Features</h2>
            <p className="terms-text">
              Some features may require payment (e.g., sending premium flowers/seeds). 
              All purchases are final and non-refundable except as required by law. 
              We reserve the right to change pricing or features at any time.
            </p>
          </section>

          <section className="terms-section">
            <h2 className="terms-section-title">6. Intellectual Property</h2>
            <p className="terms-text">
              All trademarks, logos, and content (excluding User Content) are the property 
              of Wallflower or its licensors. You may not copy, modify, or distribute any 
              part of our Service without prior written consent.
            </p>
          </section>

          <section className="terms-section">
            <h2 className="terms-section-title">7. Termination</h2>
            <p className="terms-text">
              We may suspend or terminate your access to the Service at any time, for any 
              reason, including violation of these Terms. You may also delete your account 
              at any time from your account settings.
            </p>
          </section>

          <section className="terms-section">
            <h2 className="terms-section-title">8. Disclaimer and Limitation of Liability</h2>
            <p className="terms-text">
              The Service is provided "as is" and "as available." We make no warranties of 
              any kind, express or implied. To the fullest extent permitted by law, Wallflower 
              disclaims all liability for any damages resulting from your use of the Service.
            </p>
          </section>

          <section className="terms-section">
            <h2 className="terms-section-title">9. Modifications to Terms</h2>
            <p className="terms-text">
              We may revise these Terms from time to time. If changes are material, we will 
              notify you. Continued use of the Service after changes constitutes your 
              acceptance of the updated Terms.
            </p>
          </section>

          <section className="terms-section">
            <h2 className="terms-section-title">10. Governing Law</h2>
            <p className="terms-text">
              These Terms are governed by the laws of the State of Texas, without regard 
              to its conflict of law principles.
            </p>
          </section>

          <section className="terms-section">
            <h2 className="terms-section-title">11. Contact Us</h2>
            <p className="terms-text">
              If you have any questions about these Terms, please contact us at:
            </p>
            <p className="terms-contact">
              <a href="mailto:support@wallflower.me">support@wallflower.me</a>
            </p>
          </section>
        </div>

        <div className="terms-footer">
          <Link to="/" className="btn btn-secondary">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;