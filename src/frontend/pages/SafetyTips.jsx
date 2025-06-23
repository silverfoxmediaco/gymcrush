// Safety Tips Page
// Path: src/frontend/pages/SafetyTips.jsx
// Purpose: Display safety tips for Wallflower.me users

import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './SafetyTips.css';

const SafetyTips = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const currentDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="safety-page">
      <div className="safety-container">
        <div className="safety-header">
          <h1 className="safety-title">Wallflower.me Safety Tips</h1>
          <p className="safety-effective-date">Effective Date: {currentDate}</p>
        </div>

        <div className="safety-body">
          <p className="safety-intro">
            At Wallflower, we're committed to helping you build real, lasting connections — 
            gently and safely. While we work hard to keep this community secure, your safety 
            is always in your hands. Please take a moment to review these important tips:
          </p>

          <section className="safety-tip">
            <div className="tip-header">
              <span className="tip-number">1</span>
              <h2 className="tip-title">Protect Your Privacy</h2>
            </div>
            <ul className="tip-list">
              <li>
                Never share sensitive personal information like your home address, workplace, 
                financial details, or government ID.
              </li>
              <li>
                Use caution before sharing contact info like phone numbers or social media 
                handles — build trust first.
              </li>
            </ul>
          </section>

          <section className="safety-tip">
            <div className="tip-header">
              <span className="tip-number">2</span>
              <h2 className="tip-title">Take Your Time</h2>
            </div>
            <ul className="tip-list">
              <li>
                Move at your own pace. There's no pressure to meet up or respond quickly.
              </li>
              <li>
                Real connections take time to grow. Don't feel rushed into conversations 
                or decisions.
              </li>
            </ul>
          </section>

          <section className="safety-tip">
            <div className="tip-header">
              <span className="tip-number">3</span>
              <h2 className="tip-title">Communicate Within the App</h2>
            </div>
            <ul className="tip-list">
              <li>
                Keep chats within Wallflower until you're comfortable. This helps us better 
                protect you and address any safety concerns.
              </li>
              <li>
                Be cautious if someone quickly asks to move to another platform — it can 
                be a red flag.
              </li>
            </ul>
          </section>

          <section className="safety-tip">
            <div className="tip-header">
              <span className="tip-number">4</span>
              <h2 className="tip-title">Be Alert to Red Flags</h2>
            </div>
            <p className="tip-text">Watch for signs like:</p>
            <ul className="tip-list">
              <li>Inconsistent stories or evasiveness</li>
              <li>Requests for money or gifts</li>
              <li>Attempts to guilt, manipulate, or pressure you</li>
            </ul>
            <p className="tip-emphasis">If something feels off, it probably is. Trust your gut.</p>
          </section>

          <section className="safety-tip">
            <div className="tip-header">
              <span className="tip-number">5</span>
              <h2 className="tip-title">Meeting in Person</h2>
            </div>
            <p className="tip-text">If and when you decide to meet:</p>
            <ul className="tip-list">
              <li>Choose a public place for your first few meetups.</li>
              <li>Let a friend or family member know where you're going and who you're meeting.</li>
              <li>Arrange your own transportation so you can leave at any time.</li>
            </ul>
          </section>

          <section className="safety-tip">
            <div className="tip-header">
              <span className="tip-number">6</span>
              <h2 className="tip-title">Report Suspicious Behavior</h2>
            </div>
            <p className="tip-text">
              We rely on our community to help keep Wallflower safe. If you see something 
              inappropriate, harmful, or suspicious:
            </p>
            <ul className="tip-list">
              <li>Use the in-app <strong>report</strong> feature</li>
              <li>
                Or email our team at{' '}
                <a href="mailto:safety@wallflower.me" className="safety-email">
                  safety@wallflower.me
                </a>
              </li>
            </ul>
          </section>

          <div className="safety-reminder">
            <p className="reminder-text">
              <strong>Remember:</strong> A healthy connection respects your comfort level, 
              your pace, and your boundaries.
            </p>
          </div>

          <div className="safety-closing">
            <p className="closing-quote">
              <strong>Safety grows from self-awareness and mutual respect.</strong>
            </p>
          </div>
        </div>

        <div className="safety-footer">
          <Link to="/" className="btn btn-secondary">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SafetyTips;