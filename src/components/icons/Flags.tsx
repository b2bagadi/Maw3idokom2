import React from 'react';

export const FlagGB = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 60 30" className={className} xmlns="http://www.w3.org/2000/svg">
        <clipPath id="t">
            <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
        </clipPath>
        <path d="M0,0 v30 h60 v-30 z" fill="#00247d" />
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
        <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#t)" stroke="#cf142b" strokeWidth="4" />
        <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
        <path d="M30,0 v30 M0,15 h60" stroke="#cf142b" strokeWidth="6" />
    </svg>
);

export const FlagFR = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 3 2" className={className} xmlns="http://www.w3.org/2000/svg">
        <rect width="1" height="2" x="0" fill="#0055A4" />
        <rect width="1" height="2" x="1" fill="#FFFFFF" />
        <rect width="1" height="2" x="2" fill="#EF4135" />
    </svg>
);

export const FlagMA = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 900 600" className={className} xmlns="http://www.w3.org/2000/svg">
        <rect width="900" height="600" fill="#c1272d" />
        <path
            fill="none"
            stroke="#006233"
            strokeWidth="30"
            d="M450,123.6 L538.2,395.1 L307.3,227.4 L592.7,227.4 L361.8,395.1 z"
        />
    </svg>
);
