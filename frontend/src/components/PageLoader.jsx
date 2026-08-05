import React, { useState, useEffect } from 'react';

export default function PageLoader({ isLoading = true, className = '' }) {
  const [shouldRender, setShouldRender] = useState(isLoading);

  useEffect(() => {
    if (isLoading) {
      setShouldRender(true);
    } else {
      // 200ms delay matches the transition duration
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  if (!shouldRender) return null;

  return (
    <div 
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-theme-main transition-opacity duration-200 ${
        isLoading ? 'opacity-100' : 'opacity-0'
      } ${className}`}
    >
      <svg 
        viewBox="20 40 180 140" 
        width="120" 
        height="93" 
        xmlns="http://www.w3.org/2000/svg" 
        role="img" 
        aria-label="Loading"
        className="text-theme-text"
      >
        <style>
          {`
            .page-loader-seg {
              stroke: currentColor;
              transform-origin: center;
              transform-box: fill-box;
              animation: page-loader-pulse 1.2s ease-in-out infinite;
            }
            .page-loader-seg1 { animation-delay: 0s; }
            .page-loader-seg2 { animation-delay: 0.15s; }
            .page-loader-seg3 { animation-delay: 0.3s; }
            @keyframes page-loader-pulse {
              0%, 100% { opacity: 0.25; transform: scale(0.9); }
              50%      { opacity: 1;    transform: scale(1); }
            }
          `}
        </style>
        <path className="page-loader-seg page-loader-seg1" d="M65,50 L30,110 L65,170" fill="none" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round"/>
        <path className="page-loader-seg page-loader-seg2" d="M85,60 L135,160 M135,60 L85,160" fill="none" strokeWidth="14" strokeLinecap="round"/>
        <path className="page-loader-seg page-loader-seg3" d="M155,50 L190,110 L155,170" fill="none" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  );
}
