import React from 'react';
import DashboardLayout from '../layouts/DashboardLayout';

export default function NotFound({
  code = '404',
  title = 'Page Not Found',
  description = "Oops! The page you're looking for doesn't exist, has been moved, or an error occurred.",
  activeTab = '',
  onRetry = null,
  showHome = true,
  withLayout = true
}) {
  const is500 = String(code).startsWith('5') || code === '500';

  const content = (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-180px)] text-center px-4 py-12 fade-in-up">
      
      {/* Visual Themed Icon */}
      <div className="text-7xl sm:text-8xl mb-6 text-theme-text transition-transform duration-300 hover:scale-105">
        {is500 ? (
          <iconify-icon icon="lucide:server-crash" className="text-amber-500 animate-pulse"></iconify-icon>
        ) : (
          <iconify-icon icon="lucide:rocket" className="animate-[bounce_3s_infinite]"></iconify-icon>
        )}
      </div>

      <h1 className="text-7xl sm:text-9xl font-black tracking-tighter mb-2 text-theme-text opacity-90 select-none">
        {code}
      </h1>
      
      <h2 className="text-2xl md:text-3xl font-bold mb-3 text-theme-text">
        {title}
      </h2>
      
      <p className="text-theme-muted text-sm sm:text-base max-w-md mx-auto mb-8 leading-relaxed">
        {description}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="px-6 py-2.5 bg-theme-hover border border-theme-border text-theme-text font-bold rounded-sm hover:border-theme-border-inverted transition-all text-sm cursor-pointer flex items-center gap-2"
          >
            <iconify-icon icon="lucide:refresh-cw" className="text-base"></iconify-icon>
            Try Again
          </button>
        )}

        {showHome && (
          <a
            href="#/dashboard"
            className="px-7 py-2.5 bg-theme-inverted text-theme-inverted-text font-bold rounded-sm hover:opacity-85 transition-opacity text-sm inline-flex items-center gap-2 shadow-sm"
          >
            <iconify-icon icon="lucide:home" className="text-base"></iconify-icon>
            Go Back Home
          </a>
        )}

        <a
          href="#/companies"
          className="px-5 py-2.5 text-sm font-bold text-theme-muted hover:text-theme-text transition-colors inline-flex items-center gap-1.5"
        >
          <iconify-icon icon="lucide:compass" className="text-base"></iconify-icon>
          Explore Companies
        </a>
      </div>
    </div>
  );

  if (!withLayout) {
    return (
      <div className="min-h-screen bg-theme-main text-theme-text flex items-center justify-center p-4">
        {content}
      </div>
    );
  }

  return (
    <DashboardLayout activeTab={activeTab}>
      {content}
    </DashboardLayout>
  );
}
