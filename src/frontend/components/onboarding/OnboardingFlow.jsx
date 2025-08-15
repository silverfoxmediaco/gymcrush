// OnboardingFlow.jsx
// Path: src/frontend/components/onboarding/OnboardingFlow.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './OnboardingFlow.css';

const OnboardingFlow = () => {
  const [currentScreen, setCurrentScreen] = useState(0);
  const navigate = useNavigate();

  const screens = [
    {
      id: 'welcome',
      type: 'welcome',
      title: 'Ready to Find Your GymCrush?',
      subtitle: 'Join thousands of fitness enthusiasts finding love and workout partners',
      showButtons: true
    },
    {
      id: 'branding',
      type: 'branding',
      logo: true,
      title: 'Where Strength Meets Chemistry',
      showSkip: true
    },
    {
      id: 'features',
      type: 'features',
      title: 'Find Your GymCrush',
      features: [
        {
          icon: '💪',
          text: 'Connect with fitness enthusiasts nearby'
        },
        {
          icon: '❤️',
          text: 'Send each other a Crush and get instantly matched'
        },
        {
          icon: '🏆',
          text: 'Plan a workout and build on every rep'
        },
        {
          icon: '📍',
          text: 'Get Started on Finding your GymCrush'
        }
      ],
      showSkip: true
    }
  ];

  const handleCreateAccount = () => {
    localStorage.setItem('onboardingComplete', 'true');
    // Open signup modal or navigate to signup
    navigate('/?signup=true');
  };

  const handleLogin = () => {
    localStorage.setItem('onboardingComplete', 'true');
    // Open login modal or navigate to login
    navigate('/?login=true');
  };

  const handleSkip = () => {
    if (currentScreen < screens.length - 1) {
      setCurrentScreen(currentScreen + 1);
    } else {
      localStorage.setItem('onboardingComplete', 'true');
      navigate('/');
    }
  };

  const handleNext = () => {
    if (currentScreen < screens.length - 1) {
      setCurrentScreen(currentScreen + 1);
    }
  };

  // Handle swipe gestures for mobile
  useEffect(() => {
    let touchStartX = 0;
    let touchEndX = 0;

    const handleTouchStart = (e) => {
      touchStartX = e.changedTouches[0].screenX;
    };

    const handleTouchEnd = (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    };

    const handleSwipe = () => {
      if (touchEndX < touchStartX - 50) {
        // Swiped left - next screen
        handleNext();
      }
      if (touchEndX > touchStartX + 50 && currentScreen > 0) {
        // Swiped right - previous screen
        setCurrentScreen(currentScreen - 1);
      }
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [currentScreen]);

  const renderScreen = () => {
    const screen = screens[currentScreen];

    switch (screen.type) {
      case 'welcome':
        return (
          <div className="onboarding-screen welcome-screen">
            <div className="content-wrapper">
              <h1 className="title">{screen.title}</h1>
              <p className="subtitle">{screen.subtitle}</p>
            </div>
            <div className="button-container">
              <button className="btn-primary" onClick={handleCreateAccount}>
                CREATE ACCOUNT
              </button>
              <button className="btn-secondary" onClick={handleLogin}>
                I ALREADY HAVE AN ACCOUNT
              </button>
            </div>
          </div>
        );

      case 'branding':
        return (
          <div className="onboarding-screen branding-screen">
            {screen.showSkip && (
              <button className="skip-btn" onClick={handleSkip}>Skip</button>
            )}
            <div className="logo-container">
              <img 
                src="/src/frontend/assets/images/gymcrushlogotrans300.png" 
                alt="GymCrush Logo" 
                className="logo"
              />
            </div>
            <h1 className="title">{screen.title}</h1>
          </div>
        );

      case 'features':
        return (
          <div className="onboarding-screen features-screen">
            {screen.showSkip && (
              <button className="skip-btn" onClick={handleSkip}>Skip</button>
            )}
            <div className="content-wrapper">
              <h1 className="title">{screen.title}</h1>
              <div className="features-list">
                {screen.features.map((feature, index) => (
                  <div key={index} className="feature-item">
                    <div className="feature-icon">{feature.icon}</div>
                    <p className="feature-text">{feature.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="onboarding-container">
      <div className="onboarding-background">
        <div className="overlay"></div>
      </div>
      
      {renderScreen()}
      
      <div className="progress-dots">
        {screens.map((_, index) => (
          <span
            key={index}
            className={`dot ${index === currentScreen ? 'active' : ''}`}
            onClick={() => setCurrentScreen(index)}
          />
        ))}
      </div>

      <div className="bottom-bar"></div>
    </div>
  );
};

export default OnboardingFlow;