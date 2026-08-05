import React from 'react';

export default function Logo({ className = "h-7 w-auto", strokeColor = "currentColor", strokeWidth = 14 }) {
  return (
    <svg 
      viewBox="20 40 180 140" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path 
        d="M65,50 L30,110 L65,170" 
        fill="none" 
        stroke={strokeColor} 
        strokeWidth={strokeWidth} 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M85,60 L135,160 M135,60 L85,160" 
        fill="none" 
        stroke={strokeColor} 
        strokeWidth={strokeWidth} 
        strokeLinecap="round"
      />
      <path 
        d="M155,50 L190,110 L155,170" 
        fill="none" 
        stroke={strokeColor} 
        strokeWidth={strokeWidth} 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
}
