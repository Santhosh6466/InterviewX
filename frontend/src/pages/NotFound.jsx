import React from 'react';
import DashboardLayout from '../layouts/DashboardLayout';

export default function NotFound() {
  return (
    <DashboardLayout activeTab="">
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] text-center fade-in-up">
        
        {/* Astronaut Icon (Using iconify space/planet icon) */}
        <div className="text-8xl mb-6 animate-[bounce_3s_infinite] text-theme-text">
          <iconify-icon icon="lucide:rocket"></iconify-icon>
        </div>

        <h1 className="text-8xl font-black tracking-tighter mb-2">404</h1>
        <h2 className="text-2xl md:text-3xl font-bold mb-4">Page Not Found</h2>
        <p className="text-theme-muted max-w-md mx-auto mb-8">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="flex flex-col items-center gap-4">
          <a href="#/dashboard" className="px-8 py-3 bg-theme-inverted text-theme-inverted-text font-bold rounded-sm hover:opacity-80 transition-colors">
            Go Back Home
          </a>
          <a href="#/companies" className="text-sm font-bold text-theme-muted hover:text-theme-text transition-colors">
            Explore Experiences
          </a>
        </div>

      </div>
    </DashboardLayout>
  );
}
