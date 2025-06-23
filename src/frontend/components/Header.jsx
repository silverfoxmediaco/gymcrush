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

          {/* Mobile Menu Button with Dumbbell Icon */}
          <button 
            className={`mobile-menu-btn ${isMobileMenuOpen ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="dumbbell-icon"
            >
              <path 
                d="M20.57 14.86L22 13.43L20.57 12L17 15.57L8.43 7L12 3.43L10.57 2L9.14 3.43L7.71 2L5.57 4.14L4.14 2.71L2.71 4.14L4.14 5.57L2 7.71L3.43 9.14L2 10.57L3.43 12L7 8.43L15.57 17L12 20.57L13.43 22L14.86 20.57L16.29 22L18.43 19.86L19.86 21.29L21.29 19.86L19.86 18.43L22 16.29L20.57 14.86Z" 
                fill="currentColor"
              />
            </svg>
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