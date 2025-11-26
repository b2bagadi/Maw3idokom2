"use client";

import React, { useEffect, useState } from 'react';

const BackgroundAnimation = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleMotionChange);

    // Check for mobile device
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      mediaQuery.removeEventListener('change', handleMotionChange);
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  if (prefersReducedMotion) return null;

  // Configuration for clock and calendar elements
  const elements = [
    // Clocks
    { type: 'clock', size: 120, top: '15%', left: '10%', delay: '0s', duration: '35s', blur: true, color: '#4A90E2' },
    { type: 'clock', size: 180, top: '60%', left: '85%', delay: '5s', duration: '42s', blur: false, color: '#50C878' },
    { type: 'clock', size: 90, top: '80%', left: '20%', delay: '12s', duration: '38s', blur: false, color: '#FFD700' },
    { type: 'clock', size: 150, top: '25%', left: '90%', delay: '8s', duration: '45s', blur: true, color: '#4A90E2' },

    // Calendars
    { type: 'calendar', size: 140, top: '40%', left: '5%', delay: '2s', duration: '40s', blur: false, color: '#50C878' },
    { type: 'calendar', size: 100, top: '70%', left: '75%', delay: '15s', duration: '32s', blur: true, color: '#FFD700' },
    { type: 'calendar', size: 160, top: '10%', left: '70%', delay: '7s', duration: '36s', blur: false, color: '#4A90E2' },
    { type: 'calendar', size: 110, top: '50%', left: '95%', delay: '20s', duration: '30s', blur: true, color: '#50C878' },
  ];

  // Time/Date fragments configuration
  const timeFragments = [
    { text: '10:30', size: '3rem', top: '18%', left: '25%', delay: '1s', duration: '6s', color: '#4A90E2' },
    { text: '14:15', size: '2.5rem', top: '55%', right: '15%', delay: '3s', duration: '7s', color: '#50C878' },
    { text: '09:00', size: '3.5rem', bottom: '25%', left: '12%', delay: '2s', duration: '5s', color: '#FFD700' },
    { text: '18:45', size: '2.8rem', top: '72%', left: '40%', delay: '4s', duration: '6.5s', color: '#4A90E2' },
    { text: 'MON', size: '2rem', top: '30%', right: '8%', delay: '2.5s', duration: '7.5s', color: '#50C878' },
    { text: '26', size: '4rem', bottom: '35%', right: '25%', delay: '3.5s', duration: '6s', color: '#FFD700' },
    { text: 'NOV', size: '2.2rem', top: '45%', left: '45%', delay: '5s', duration: '8s', color: '#4A90E2' },
    { text: '2024', size: '2.5rem', bottom: '15%', left: '50%', delay: '1.5s', duration: '7s', color: '#50C878' },
  ];

  // Filter elements for mobile (show fewer but not zero)
  const activeElements = isMobile ? elements.slice(0, 4) : elements;
  const activeFragments = isMobile ? timeFragments.slice(0, 4) : timeFragments;

  return (
    <>
      <div className="background-animation-container">
        {/* Clocks and Calendars */}
        {activeElements.map((el, index) => (
          <div
            key={index}
            className={`floating-element ${el.type} ${el.blur ? 'blurred' : ''}`}
            style={{
              width: `${el.size}px`,
              height: `${el.size}px`,
              top: el.top,
              left: el.left,
              animationDelay: el.delay,
              animationDuration: el.duration,
              color: el.color,
            }}
          >
            {el.type === 'clock' ? (
              <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="50" cy="50" r="45" />
                <line x1="50" y1="50" x2="50" y2="25" className="clock-hand-hour" />
                <line x1="50" y1="50" x2="70" y2="50" className="clock-hand-minute" />
                <line x1="50" y1="10" x2="50" y2="15" />
                <line x1="90" y1="50" x2="85" y2="50" />
                <line x1="50" y1="90" x2="50" y2="85" />
                <line x1="10" y1="50" x2="15" y2="50" />
              </svg>
            ) : (
              <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="10" y="10" width="80" height="80" rx="5" />
                <line x1="10" y1="30" x2="90" y2="30" />
                <line x1="30" y1="10" x2="30" y2="90" />
                <line x1="50" y1="10" x2="50" y2="90" />
                <line x1="70" y1="10" x2="70" y2="90" />
                <line x1="10" y1="50" x2="90" y2="50" />
                <line x1="10" y1="70" x2="90" y2="70" />
              </svg>
            )}
          </div>
        ))}

        {/* Time/Date Fragments */}
        {activeFragments.map((fragment, index) => (
          <div
            key={`fragment-${index}`}
            className="time-fragment"
            style={{
              fontSize: fragment.size,
              top: fragment.top,
              bottom: fragment.bottom,
              left: fragment.left,
              right: fragment.right,
              color: fragment.color,
              animationDelay: fragment.delay,
              animationDuration: fragment.duration,
            }}
          >
            {fragment.text}
          </div>
        ))}
      </div>

      <style jsx global>{`
        .background-animation-container {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          overflow: hidden;
        }

        .floating-element {
          position: absolute;
          opacity: 0.18;
          animation-name: float, breathe;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
          transform-origin: center;
          will-change: transform, opacity;
        }

        .floating-element.blurred {
          filter: blur(2px);
        }

        .time-fragment {
          position: absolute;
          font-weight: bold;
          opacity: 0.15;
          animation: fade-pulse ease-in-out infinite;
          will-change: opacity;
          user-select: none;
        }

        .clock-hand-hour {
          animation: rotate 60s linear infinite;
          transform-origin: 50px 50px;
        }

        .clock-hand-minute {
          animation: rotate 10s linear infinite;
          transform-origin: 50px 50px;
        }

        @keyframes float {
          0% {
            transform: translate3d(0, 0, 0) rotate(0deg);
          }
          25% {
            transform: translate3d(20px, 20px, 0) rotate(5deg);
          }
          50% {
            transform: translate3d(0, 40px, 0) rotate(0deg);
          }
          75% {
            transform: translate3d(-20px, 20px, 0) rotate(-5deg);
          }
          100% {
            transform: translate3d(0, 0, 0) rotate(0deg);
          }
        }

        @keyframes breathe {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        @keyframes rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes fade-pulse {
          0%, 100% {
            opacity: 0.12;
          }
          50% {
            opacity: 0.28;
          }
        }

        /* Pause animations on hover over interactive elements */
        button:hover ~ .background-animation-container .floating-element,
        button:hover ~ .background-animation-container .time-fragment,
        a:hover ~ .background-animation-container .floating-element,
        a:hover ~ .background-animation-container .time-fragment {
          animation-play-state: paused;
        }

        @media (max-width: 768px) {
          .floating-element {
            opacity: 0.12;
          }
          .time-fragment {
            opacity: 0.10;
            font-size: 0.8em !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .floating-element,
          .time-fragment,
          .clock-hand-hour,
          .clock-hand-minute {
            animation: none !important;
          }
        }
      `}</style>
    </>
  );
};

export default BackgroundAnimation;

