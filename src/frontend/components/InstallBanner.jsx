// InstallBanner.jsx
// Path: src/frontend/components/InstallBanner.jsx

import React, { useState, useEffect } from 'react';
import './InstallBanner.css';

const InstallBanner = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches 
      || window.navigator.standalone 
      || localStorage.getItem('pwaInstalled');

    // Check if iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(isIOSDevice);

    // Check if user dismissed banner
    const bannerDismissed = localStorage.getItem('installBannerDismissed');
    
    // Only show banner on mobile devices, not installed, and not dismissed
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile && !isInstalled && !bannerDismissed) {
      if (isIOSDevice) {
        // Show iOS instructions banner
        setShowBanner(true);
      } else {
        // Listen for Android/Chrome install prompt
        const handleBeforeInstallPrompt = (e) => {
          e.preventDefault();
          setDeferredPrompt(e);
          setShowBanner(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
          window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
      }
    }
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      // Show iOS install instructions
      alert('To install GymCrush:\n1. Tap the Share button\n2. Select "Add to Home Screen"\n3. Tap "Add"');
    } else if (deferredPrompt) {
      // Show Chrome install prompt
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        localStorage.setItem('pwaInstalled', 'true');
      }
      
      setDeferredPrompt(null);
      setShowBanner(false);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('installBannerDismissed', 'true');
  };

  if (!showBanner) return null;

  return (
    <div className="install-banner">
      <div className="install-banner-content">
        <div className="install-banner-icon">
          <img src="/assets/images/gymcrushlogotrans300.png" alt="GymCrush" />
        </div>
        <div className="install-banner-text">
          <strong>Install GymCrush App</strong>
          <span>Add to home screen for the best experience</span>
        </div>
        <div className="install-banner-actions">
          <button className="install-btn" onClick={handleInstallClick}>
            Install
          </button>
          <button className="dismiss-btn" onClick={handleDismiss}>
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallBanner;