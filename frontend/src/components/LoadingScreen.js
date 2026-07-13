// ============================================================
// src/components/LoadingScreen.js
// Full-screen loading overlay with cybersecurity animations
// Props: message (string), duration (ms), onComplete (fn)
// ============================================================

import React, { useEffect } from 'react';

function LoadingScreen({ message = 'Verifying Media Integrity...', duration = 2500, onComplete }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onComplete) onComplete();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  return (
    <div className="loading-screen">
      <div className="loading-content">

        {/* Shield SVG icon */}
        <div className="loading-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="60" height="60">
            <path
              d="M12 2L3 6V12C3 16.97 7.02 21.63 12 23C16.98 21.63 21 16.97 21 12V6L12 2Z"
              stroke="#00d4ff" strokeWidth="1.5" fill="rgba(0,212,255,0.08)" strokeLinejoin="round"
            />
            <path
              d="M8 12L11 15L16 9"
              stroke="#00d4ff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Brand Name */}
        <div className="loading-logo">DEEPGUARD</div>

        {/* Scanning bar track */}
        <div className="loading-scan-track">
          <div className="loading-scan-bar"></div>
        </div>

        {/* Status message */}
        <p className="loading-message">{message}</p>

        {/* Blinking dots */}
        <div className="loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>

      </div>
    </div>
  );
}

export default LoadingScreen;
