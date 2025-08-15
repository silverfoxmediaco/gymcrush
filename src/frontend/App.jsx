// App Component
// Path: src/frontend/App.jsx
// Purpose: Main application component with routing

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';
import HowItWorks from './components/HowItWorks';
import CurrentMembers from './components/MeetSomeMembers';
import SignupModal from './components/SignupModal';
import LoginModal from './components/LoginModal';
import Profile from './components/profile/profile';
import ProfileView from './components/profile/ProfileView';
import Browsing from './components/browse/Browsing';
import Crushes from './components/crushes/Crushes';
import Messages from './components/messages/Messages';
import Contact from './components/Contact';
import ResetPassword from './components/ResetPassword';
import HelpCenter from './pages/HelpCenter';
import Settings from './pages/Settings';
import OnboardingFlow from './components/onboarding/OnboardingFlow';

// Import new pages
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';
import CommunityGuidelines from './pages/CommunityGuidelines';
import SafetyTips from './pages/SafetyTips';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/" />;
};

// Landing Page component
const LandingPage = ({ onSignupClick }) => (
  <>
    <section className="hero" id="hero">
      <div className="hero-overlay"></div>
      <div className="container hero-content">
        <h2 className="hero-title">
         Your Gym Bae is<br />
          Just a Crush Away
        </h2>
        <p className="hero-subtitle">
          Connect with fitness enthusiasts who share your passion for health and wellness
        </p>
        <button 
          className="btn btn-primary hero-cta" 
          onClick={onSignupClick}
        >
          Find Your Crush
        </button>
      </div>
    </section>
    
    <div id="how-it-works">
      <HowItWorks onStartPlanting={onSignupClick} />
    </div>
    
    {/* Temporarily disabling the CurrentMembers section
    
    <div id="current-members">
      <CurrentMembers onSignupClick={onSignupClick} />
    </div>*/}
  </>
);

// Main App content that needs access to useLocation
function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Check if we're on the browse page
  const isBrowsePage = location.pathname === '/browse';

  // PWA Service Worker Registration
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then(reg => console.log('Service Worker registered:', reg))
          .catch(err => console.log('Service Worker registration failed:', err));
      });
    }
  }, []);

  // Check for onboarding and authentication
  useEffect(() => {
    const token = localStorage.getItem('token');
    const hasCompletedOnboarding = localStorage.getItem('onboardingComplete');
    const isReturningUser = localStorage.getItem('returningUser');
    
    setIsLoggedIn(!!token);
    
    // Show onboarding for first-time visitors (not logged in, haven't seen onboarding, not returning)
    if (!hasCompletedOnboarding && !isReturningUser && !token) {
      setShowOnboarding(true);
    }

    // Check URL params for signup/login triggers from onboarding
    const params = new URLSearchParams(location.search);
    if (params.get('signup') === 'true') {
      setShowSignupModal(true);
      setShowOnboarding(false);
      localStorage.setItem('onboardingComplete', 'true');
      navigate('/', { replace: true });
    }
    if (params.get('login') === 'true') {
      setShowLoginModal(true);
      setShowOnboarding(false);
      localStorage.setItem('onboardingComplete', 'true');
      navigate('/', { replace: true });
    }
  }, [location, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.setItem('returningUser', 'true'); // Mark as returning user
    setIsLoggedIn(false);
    window.location.href = '/';
  };

  // Handle switching from Login to Signup
  const handleSwitchToSignup = () => {
    setShowLoginModal(false);
    setShowSignupModal(true);
  };

  // Handle switching from Signup to Login
  const handleSwitchToLogin = () => {
    setShowSignupModal(false);
    setShowLoginModal(true);
  };

  // Handle signup button click
  const handleSignupClick = () => {
    if (showOnboarding) {
      setShowOnboarding(false);
      localStorage.setItem('onboardingComplete', 'true');
    }
    setShowSignupModal(true);
  };

  // Handle login button click
  const handleLoginClick = () => {
    if (showOnboarding) {
      setShowOnboarding(false);
      localStorage.setItem('onboardingComplete', 'true');
    }
    setShowLoginModal(true);
  };

  // Show onboarding flow if needed
  if (showOnboarding) {
    return <OnboardingFlow />;
  }

  return (
    <div className="App">
      <Header 
        onSignupClick={handleSignupClick}
        onLoginClick={handleLoginClick}
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
      />
      
      <main className="main-content">
        <Routes>
          <Route path="/" element={
            <LandingPage onSignupClick={handleSignupClick} />
          } />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          
          <Route path="/profile/:userId" element={
            <ProtectedRoute>
              <ProfileView />
            </ProtectedRoute>
          } />
          
          <Route path="/browse" element={
            <ProtectedRoute>
              <Browsing />
            </ProtectedRoute>
          } />
          
          <Route path="/crushes" element={
            <ProtectedRoute>
              <Crushes />
            </ProtectedRoute>
          } />
          
          <Route path="/messages" element={
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          } />
          
          <Route path="/messages/:userId" element={
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          } />
          
          {/* Settings Route */}
          <Route path="/settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />
          
          <Route path="/settings/notifications" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />
          
          {/* Contact Page Route */}
          <Route path="/contact" element={<Contact />} />
          
          {/* Help Center Route */}
          <Route path="/help" element={<HelpCenter />} />
          
          {/* Password Reset Route */}
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          
          {/* Footer Pages Routes */}
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/community-guidelines" element={<CommunityGuidelines />} />
          <Route path="/safety" element={<SafetyTips />} />
        </Routes>
      </main>
      
      {/* Conditionally render Footer - hide on browse page */}
      {!isBrowsePage && <Footer />}
      
      <SignupModal 
        isOpen={showSignupModal} 
        onClose={() => setShowSignupModal(false)}
        onSwitchToLogin={handleSwitchToLogin}
      />
      
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)}
        onSwitchToSignup={handleSwitchToSignup}
      />
    </div>
  );
}

// Main App wrapper
function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;