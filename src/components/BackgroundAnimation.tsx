"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

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

  // Configuration for floating particles
  const particles = [
    { size: 8, top: '15%', left: '10%', delay: '0s', duration: '25s', color: 'rgba(74, 144, 226, 0.4)' },
    { size: 12, top: '60%', left: '85%', delay: '3s', duration: '30s', color: 'rgba(80, 200, 120, 0.4)' },
    { size: 6, top: '80%', left: '20%', delay: '6s', duration: '22s', color: 'rgba(255, 215, 0, 0.4)' },
    { size: 10, top: '25%', left: '90%', delay: '4s', duration: '28s', color: 'rgba(74, 144, 226, 0.4)' },
    { size: 14, top: '40%', left: '5%', delay: '2s', duration: '32s', color: 'rgba(80, 200, 120, 0.4)' },
    { size: 7, top: '70%', left: '75%', delay: '8s', duration: '20s', color: 'rgba(255, 215, 0, 0.4)' },
    { size: 9, top: '10%', left: '70%', delay: '5s', duration: '26s', color: 'rgba(74, 144, 226, 0.4)' },
    { size: 11, top: '50%', left: '95%', delay: '7s', duration: '24s', color: 'rgba(80, 200, 120, 0.4)' },
  ];

  // Filter particles for mobile
  const activeParticles = isMobile ? particles.slice(0, 4) : particles;

  return (
    <>
      <div className="background-animation-container">
        {/* Cinematic Hero Background */}
        <div className="hero-bg-layer">
          <Image
            src="/images/landing/hero-bg.png"
            alt=""
            fill
            priority
            className="object-cover opacity-30"
            style={{ objectPosition: 'center' }}
          />
        </div>

        {/* Animated Gradient Overlay */}
        <div className="gradient-overlay" />

        {/* Floating Particles */}
        {!prefersReducedMotion && activeParticles.map((particle, index) => (
          <div
            key={index}
            className="floating-particle"
            style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              top: particle.top,
              left: particle.left,
              animationDelay: particle.delay,
              animationDuration: particle.duration,
              backgroundColor: particle.color,
            }}
          />
        ))}

        {/* Light Rays */}
        {!prefersReducedMotion && (
          <>
            <div className="light-ray ray-1" />
            <div className="light-ray ray-2" />
            <div className="light-ray ray-3" />
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
        }

        .hero-bg-layer {
          position: absolute;
          inset: 0;
          z-index: 1;
        }

        .gradient-overlay {
          position: absolute;
          inset: 0;
          z-index: 2;
          background: linear-gradient(
            135deg,
            rgba(74, 144, 226, 0.05) 0%,
            rgba(80, 200, 120, 0.08) 25%,
            rgba(255, 215, 0, 0.05) 50%,
            rgba(74, 144, 226, 0.08) 75%,
            rgba(80, 200, 120, 0.05) 100%
          );
          animation: gradient-shift 15s ease-in-out infinite;
        }

        .floating-particle {
          position: absolute;
          border-radius: 50%;
          opacity: 0.6;
          animation: float-particle ease-in-out infinite;
          box-shadow: 0 0 20px currentColor;
          z-index: 3;
          will-change: transform;
        }

        .light-ray {
          position: absolute;
          width: 2px;
          height: 100%;
          background: linear-gradient(
            to bottom,
            transparent 0%,
            rgba(255, 255, 255, 0.1) 50%,
            transparent 100%
          );
          opacity: 0.15;
          animation: light-sweep 10s ease-in-out infinite;
          z-index: 2;
        }

        .ray-1 {
          left: 20%;
          animation-delay: 0s;
        }

        .ray-2 {
          left: 50%;
          animation-delay: 3s;
        }

        .ray-3 {
          left: 80%;
          animation-delay: 6s;
        }

        @keyframes float-particle {
          0% {
            transform: translate3d(0, 0, 0) scale(1);
          }
          25% {
            transform: translate3d(30px, 30px, 0) scale(1.1);
          }
          50% {
            transform: translate3d(0, 60px, 0) scale(1);
          }
          75% {
            transform: translate3d(-30px, 30px, 0) scale(0.9);
          }
          100% {
            transform: translate3d(0, 0, 0) scale(1);
          }
        }

        @keyframes gradient-shift {
          0%, 100% {
            opacity: 1;
            transform: scale(1) rotate(0deg);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.05) rotate(2deg);
          }
        }

        @keyframes light-sweep {
          0% {
            transform: translateY(-100%);
            opacity: 0;
          }
          50% {
            opacity: 0.15;
          }
          100% {
            transform: translateY(100%);
            opacity: 0;
          }
        }

        @media (max-width: 768px) {
          .floating-particle {
            opacity: 0.4;
          }
          .light-ray {
            opacity: 0.08;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .floating-particle,
          .light-ray,
          .gradient-overlay {
            animation: none !important;
          }
        }
      `}</style>
    </>
  );
};

export default BackgroundAnimation;
