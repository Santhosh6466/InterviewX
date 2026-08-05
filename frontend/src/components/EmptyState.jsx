import React from 'react';

export default function EmptyState({ icon, title, description, children, className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-4 text-center border border-dashed border-theme-border rounded-sm gap-3 ${className}`}>
      <iconify-icon icon={icon} className="text-4xl text-theme-muted mb-2 opacity-80"></iconify-icon>
      <h3 className="h3-card-title">{title}</h3>
      <p className="text-sm text-theme-muted max-w-md mx-auto">{description}</p>
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}
