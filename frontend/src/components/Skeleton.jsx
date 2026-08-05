import React from 'react';

export function SkeletonDetailCard() {
  return (
    <div className="premium-card flex flex-col gap-4 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-sm bg-theme-hover flex-shrink-0"></div>
        <div className="flex-1 flex flex-col gap-2">
          <div className="h-4 bg-theme-hover rounded w-1/3"></div>
          <div className="h-3 bg-theme-hover rounded w-1/4"></div>
        </div>
      </div>
      <div className="h-3 bg-theme-hover rounded w-full"></div>
      <div className="h-3 bg-theme-hover rounded w-2/3"></div>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="w-full flex flex-col sm:flex-row gap-5 animate-pulse">
      <div className="w-14 h-14 rounded-sm bg-theme-hover flex-shrink-0"></div>
      <div className="flex-1 flex flex-col gap-3">
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-2 w-1/2">
            <div className="h-5 bg-theme-hover rounded w-3/4"></div>
            <div className="h-4 bg-theme-hover rounded w-1/2"></div>
          </div>
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <div className="w-16 h-6 bg-theme-hover rounded-full"></div>
            <div className="h-3 bg-theme-hover rounded w-12"></div>
          </div>
        </div>
        <div className="h-3 bg-theme-hover rounded w-1/3 mt-2"></div>
        <div className="flex items-center gap-2 mt-2">
          <div className="w-16 h-6 bg-theme-hover rounded-sm"></div>
          <div className="w-16 h-6 bg-theme-hover rounded-sm"></div>
          <div className="w-16 h-6 bg-theme-hover rounded-sm"></div>
        </div>
      </div>
    </div>
  );
}

export function SkeletonCompanyCard() {
  return (
    <div className="w-full flex items-center gap-4 animate-pulse">
      <div className="w-12 h-12 rounded-sm bg-theme-hover flex-shrink-0"></div>
      <div className="flex-1 flex flex-col gap-2 min-w-0">
        <div className="h-4 bg-theme-hover rounded w-3/4"></div>
        <div className="h-3 bg-theme-hover rounded w-1/2"></div>
      </div>
      <div className="w-4 h-4 bg-theme-hover rounded flex-shrink-0"></div>
    </div>
  );
}

export default SkeletonCard;
