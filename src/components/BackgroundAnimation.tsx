"use client";

import React, { useEffect, useState } from 'react';
import { Calendar, Clock, CheckCircle } from 'lucide-react';

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

  return (
    <>
      <div className="background-animation-container">
        {/* Gradient Orbs */}
        <div className="gradient-orb orb-1" />
        <div className="gradient-orb orb-2" />
        <div className="gradient-orb orb-3" />

        {/* Floating Icons */}
        {!prefersReducedMotion && !isMobile && (
          <>
            {/* Calendars */}
            <div className="floating-icon icon-calendar-1">
              <Calendar className="w-24 h-24 text-indigo-400/30" strokeWidth={1} />
            </div>
            <div className="floating-icon icon-calendar-2">
              <Calendar className="w-32 h-32 text-purple-400/25" strokeWidth={1} />
            </div>
            <div className="floating-icon icon-calendar-3">
              <Calendar className="w-28 h-28 text-pink-400/20" strokeWidth={1} />
            </div>

            {/* Clocks */}
            <div className="floating-icon icon-clock-1">
              <Clock className="w-20 h-20 text-blue-400/30" strokeWidth={1} />
            </div>
            <div className="floating-icon icon-clock-2">
              <Clock className="w-24 h-24 text-cyan-400/25" strokeWidth={1} />
            </div>

            {/* Checkmarks */}
            <div className="floating-icon icon-check-1">
              <CheckCircle className="w-22 h-22 text-emerald-400/35" strokeWidth={1.5} />
            </div>
            <div className="floating-icon icon-check-2">
              <CheckCircle className="w-26 h-26 text-green-400/30" strokeWidth={1.5} />
            </div>
          </>
        )}
      </div>

      <style jsx global>{`
        .background-animation-container {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          overflow: hidden;
          background: linear-gradient(135deg, #f5f7fa 0%, #e8eaf6 25%, #fce4ec 50%, #f3e5f5 75%, #e8f5e9 100%);
        }

        /* Gradient Orbs */
        .gradient-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.4;
          animation: pulse-orb 8s ease-in-out infinite;
        }

        .orb-1 {
          width: 500px;
          height: 500px;
          top: -100px;
          left: -100px;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, transparent 70%);
          animation-delay: 0s;
        }

        .orb-2 {
          width: 600px;
          height: 600px;
          bottom: -150px;
          right: -150px;
          background: radial-gradient(circle, rgba(236, 72, 153, 0.4) 0%, transparent 70%);
          animation-delay: 2s;
        }

        .orb-3 {
          width: 450px;
          height: 450px;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%);
          animation-delay: 4s;
        }

        /* Floating Icons */}
        .floating-icon {
          position: absolute;
          animation: float-gentle 6s ease-in-out infinite;
        }

        .icon-calendar-1 {
          top: 15%;
          left: 8%;
          animation-delay: 0s;
          animation-duration: 7s;
        }

        .icon-calendar-2 {
          top: 35%;
          right: 12%;
          animation-delay: 1.5s;
          animation-duration: 8s;
        }

        .icon-calendar-3 {
          bottom: 25%;
          left: 20%;
          animation-delay: 3s;
          animation-duration: 6.5s;
        }

        .icon-clock-1 {
          top: 60%;
          right: 8%;
          animation: spin-slow 20s linear infinite;
        }

        .icon-clock-2 {
          bottom: 15%;
          right: 35%;
          animation: spin-slow 25s linear infinite reverse;
        }

        .icon-check-1 {
          top: 45%;
          left: 10%;
          animation: bounce-gentle 4s ease-in-out infinite;
          animation-delay: 0.5s;
        }

        .icon-check-2 {
          bottom: 35%;
          right: 25%;
          animation: bounce-gentle 5s ease-in-out infinite;
          animation-delay: 1.5s;
        }

        /* Animations */
        @keyframes float-gentle {
          0%, 100% {
            transform: translateY(0px) translateX(0px) rotate(0deg);
          }
          25% {
            transform: translateY(-20px) translateX(10px) rotate(3deg);
          }
          50% {
            transform: translateY(-10px) translateX(-10px) rotate(-2deg);
          }
          75% {
            transform: translateY(-25px) translateX(5px) rotate(2deg);
          }
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes bounce-gentle {
          0%, 100% {
            transform: translateY(0px) scale(1);
          }
          50% {
            transform: translateY(-15px) scale(1.05);
          }
        }

        @keyframes pulse-orb {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.1);
          }
        }

        @media (max-width: 768px) {
          .gradient-orb {
            opacity: 0.25;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .floating-icon,
          .gradient-orb {
            animation: none !important;
          }
        }
      `}</style>
    </>
  );
};

export default BackgroundAnimation;
