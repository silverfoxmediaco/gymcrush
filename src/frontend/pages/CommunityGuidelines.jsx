// Community Guidelines Page
// Path: src/frontend/pages/CommunityGuidelines.jsx
// Purpose: Display community guidelines for GymCrush.io

import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './CommunityGuidelines.css';

const CommunityGuidelines = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const currentDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="guidelines-page">
      <div className="guidelines-container">
        <div className="guidelines-header">
          <h1 className="guidelines-title">GymCrush Community Guidelines</h1>
          <p className="guidelines-effective-date">Effective Date: {currentDate}</p>
        </div>

        <div className="guidelines-body">
          <p className="guidelines-intro">
            At GymCrush, we believe that the best connections are built on mutual respect, 
            shared fitness goals, and genuine chemistry. These Community Guidelines exist to 
            ensure that every member feels safe, motivated, and empowered to find their perfect match.
          </p>

          <p className="guidelines-agreement">
            By using GymCrush.io, you agree to follow these principles:
          </p>

          <section className="guideline-item">
            <h2 className="guideline-number">1.</h2>
            <div className="guideline-content">
              <h3 className="guideline-title">Respect Everyone's Journey</h3>
              <p className="guideline-text">
                Whether someone's a gym newbie or a fitness pro, treat everyone with respect. 
                Body shaming, harassment, hate speech, or discrimination of any kind will result 
                in immediate removal from the platform.
              </p>
            </div>
          </section>

          <section className="guideline-item">
            <h2 className="guideline-number">2.</h2>
            <div className="guideline-content">
              <h3 className="guideline-title">Keep It Real</h3>
              <p className="guideline-text">
                Use recent, authentic photos and honest information about your fitness interests. 
                Don't create fake profiles or impersonate others. Real connections start with 
                real people.
              </p>
            </div>
          </section>

          <section className="guideline-item">
            <h2 className="guideline-number">3.</h2>
            <div className="guideline-content">
              <h3 className="guideline-title">Consent is Key</h3>
              <p className="guideline-text">
                Don't send unsolicited explicit content or pressure anyone into conversations, 
                dates, or workouts. A crush must be mutual before the connection can grow.
              </p>
            </div>
          </section>

          <section className="guideline-item">
            <h2 className="guideline-number">4.</h2>
            <div className="guideline-content">
              <h3 className="guideline-title">Keep Content Appropriate</h3>
              <p className="guideline-text">
                While we celebrate fitness, GymCrush isn't for explicit material or overly 
                sexual content. Show off your gains respectfully. If you wouldn't post it 
                at your gym, don't post it here.
              </p>
            </div>
          </section>

          <section className="guideline-item">
            <h2 className="guideline-number">5.</h2>
            <div className="guideline-content">
              <h3 className="guideline-title">Respect Boundaries</h3>
              <p className="guideline-text">
                If someone doesn't crush back, doesn't respond, or unmatches - respect their 
                decision. There are plenty of other gym buddies in the sea. Keep it moving.
              </p>
            </div>
          </section>

          <section className="guideline-item">
            <h2 className="guideline-number">6.</h2>
            <div className="guideline-content">
              <h3 className="guideline-title">Help Keep Our Gym Clean</h3>
              <p className="guideline-text">
                Report inappropriate behavior, fake profiles, or anything that feels unsafe. 
                Just like wiping down equipment after use, we all need to do our part to 
                keep GymCrush a great place.
              </p>
            </div>
          </section>

          <section className="guideline-item">
            <h2 className="guideline-number">7.</h2>
            <div className="guideline-content">
              <h3 className="guideline-title">One Profile Per Person</h3>
              <p className="guideline-text">
                GymCrush is for individual connections. Each user should maintain a single 
                account, and each account must represent a real person - no gym buddy 
                group accounts or business profiles.
              </p>
            </div>
          </section>

          <section className="guideline-item">
            <h2 className="guideline-number">8.</h2>
            <div className="guideline-content">
              <h3 className="guideline-title">No Commercial Use</h3>
              <p className="guideline-text">
                Don't use GymCrush to promote your personal training business, supplements, 
                or OnlyFans. This platform is for finding genuine connections, not clients 
                or customers.
              </p>
            </div>
          </section>

          <div className="guidelines-consequences">
            <h2 className="consequences-title">Consequences of Violating These Guidelines</h2>
            <p className="consequences-text">
              Violating these guidelines may result in a warning, suspension, or permanent 
              ban from GymCrush.io without refund. We take your safety and the integrity 
              of our community seriously - no exceptions, no excuses.
            </p>
          </div>

          <div className="guidelines-closing">
            <p className="closing-message">
              <strong>Let's build something strong, together.</strong>
            </p>
            <p className="closing-text">
              If you see or experience behavior that violates these guidelines, please 
              report it directly through the app or contact us at:{' '}
              <a href="mailto:safety@gymcrush.io" className="safety-link">
                safety@gymcrush.io
              </a>
            </p>
          </div>
        </div>

        <div className="guidelines-footer">
          <Link to="/" className="btn btn-secondary">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CommunityGuidelines;