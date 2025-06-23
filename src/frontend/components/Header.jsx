// Header Component
// Path: src/frontend/components/Header.jsx
// Purpose: Navigation header with authentication state handling

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';
import gymcrushLogo from '../assets/images/gymcrushlogo2.png';

const Header = ({ onSignupClick, onLoginClick, isLoggedIn, onLogout }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e, targetId) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    
    if (targetId === 'login') {
      onLoginClick();
      return;
    }
    
    if (targetId === 'signup') {
      onSignupClick();
      return;
    }
    
    // Smooth scroll to section
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLogoutClick = () => {
    setIsMobileMenuOpen(false);
    onLogout();
  };

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <nav className="nav-container">
        <div className="nav-content">
          {/* Logo */}
          <Link to="/" className="logo-link">
            <img 
              src={gymcrushLogo} 
              alt="GymCrush" 
              className="logo-image"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="nav-menu desktop">
            {!isLoggedIn ? (
              // Logged Out Menu
              <>
                <a 
                  href="#how-it-works" 
                  className="nav-link"
                  onClick={(e) => handleNavClick(e, 'how-it-works')}
                >
                  How it Works
                </a>
                {/* Temp deactivate
                <a 
                  href="#features" 
                  className="nav-link"
                  onClick={(e) => handleNavClick(e, 'features')}
                >
                  Features
                </a>
                <a 
                  href="#about" 
                  className="nav-link"
                  onClick={(e) => handleNavClick(e, 'about')}
                >
                  About
                </a>*/}
                <a 
                  href="#login" 
                  className="nav-link"
                  onClick={(e) => handleNavClick(e, 'login')}
                >
                  Login
                </a>
                <button 
                  className="nav-button"
                  onClick={(e) => handleNavClick(e, 'signup')}
                >
                  Start Crushing
                </button>
              </>
            ) : (
              // Logged In Menu
              <>
                <Link to="/crushes" className="nav-link">
                  My Crushes
                </Link>
                <Link to="/browse" className="nav-link">
                  Browse
                </Link>
                <Link to="/messages" className="nav-link">
                  Messages
                </Link>
                <Link to="/profile" className="nav-link">
                  Profile
                </Link>
                <Link to="/settings" className="nav-link">
                  Settings
                </Link>
                <button 
                  className="nav-button"
                  onClick={handleLogoutClick}
                >
                  Logout
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className={`mobile-menu-btn ${isMobileMenuOpen ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>

        {/* Mobile Navigation */}
        <div className={`nav-menu mobile ${isMobileMenuOpen ? 'active' : ''}`}>
          {!isLoggedIn ? (
            // Logged Out Mobile Menu
            <>
              <a 
                href="#how-it-works" 
                className="nav-link"
                onClick={(e) => handleNavClick(e, 'how-it-works')}
              >
                How it Works
              </a>
              {/* Temp deactivate
              <a 
                href="#features" 
                className="nav-link"
                onClick={(e) => handleNavClick(e, 'features')}
              >
                Features
              </a>
              <a 
                href="#about" 
                className="nav-link"
                onClick={(e) => handleNavClick(e, 'about')}
              >
                About
              </a>*/}
              <a 
                href="#login" 
                className="nav-link"
                onClick={(e) => handleNavClick(e, 'login')}
              >
                Login
              </a>
              <button 
                className="nav-button mobile"
                onClick={(e) => handleNavClick(e, 'signup')}
              >
                Start Crushing
              </button>
            </>
          ) : (
            // Logged In Mobile Menu
            <>
              <Link to="/crushes" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>
                My Crushes
              </Link>
              <Link to="/browse" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>
                Browse
              </Link>
              <Link to="/messages" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>
                Messages
              </Link>
              <Link to="/profile" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>
                Profile
              </Link>
              <Link to="/settings" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>
                Settings
              </Link>
              <button 
                className="nav-button mobile"
                onClick={handleLogoutClick}
              >
                Logout
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;