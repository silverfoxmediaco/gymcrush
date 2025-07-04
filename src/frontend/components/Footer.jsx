// Footer Component
// Path: src/frontend/components/Footer.jsx
// Purpose: Site footer with links and information

import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';
import gymcrushLogo from '../assets/images/gymcrushtran192.png';
import facebookIcon from '../assets/images/facebook (1).png';
import tiktokIcon from '../assets/images/tiktok.png';
import instagramIcon from '../assets/images/instagram.png';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <div className="footer-logo">
          <img 
              src={gymcrushLogo} 
              alt="GymCrush" 
              className="footer-logo-image"
            />
            <p className="footer-tagline">
              Where Strength Meets Chemistry
            </p>
          </div>
        </div>

        <div className="footer-section">
          <h4 className="footer-heading">Company</h4>
          <ul className="footer-links">
            
            <li><Link to="/how-it-works">How It Works</Link></li>
            
          </ul>
        </div>

        <div className="footer-section">
          <h4 className="footer-heading">Support</h4>
          <ul className="footer-links">
            <li><Link to="/help">Help Center</Link></li>
            <li><Link to="/safety">Safety Tips</Link></li>
            <li><Link to="/community-guidelines">Community Guidelines</Link></li>
            <li><Link to="/contact">Contact Us</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4 className="footer-heading">Legal</h4>
          <ul className="footer-links">
            <li><Link to="/privacy">Privacy Policy</Link></li>
            <li><Link to="/terms">Terms of Use</Link></li>
            <li><Link to="/cookie-policy">Cookie Policy</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4 className="footer-heading">Connect</h4>
          <div className="social-links">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <img src={instagramIcon} alt="Instagram" className="social-icon-img" />
            </a>
            <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
              <img src={tiktokIcon} alt="TikTok" className="social-icon-img" />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <img src={facebookIcon} alt="Facebook" className="social-icon-img" />
            </a>
          </div>
          <div className="newsletter">
            <p className="newsletter-text">Get fitness & dating tips</p>
            <form className="newsletter-form">
              <input 
                type="email" 
                placeholder="Your email" 
                className="newsletter-input"
                aria-label="Email for newsletter"
              />
              <button type="submit" className="newsletter-btn">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p className="copyright">
          © {currentYear} GymCrush. All rights reserved. Made with 💪 for fitness enthusiasts everywhere.
        </p>
      </div>
    </footer>
  );
};

export default Footer;