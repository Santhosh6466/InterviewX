import React from 'react';

export default function AttributePill({ icon, label, children, className = '', variant = 'default' }) {
  const content = label || children;

  const variantStyles = {
    default: 'bg-theme-hover/60 hover:bg-theme-hover border-theme-border text-theme-text',
    subtle: 'bg-theme-card border-theme-border/60 text-theme-muted hover:text-theme-text',
    accent: 'bg-terracotta-500/10 border-terracotta-500/30 text-terracotta-700 dark:text-terracotta-400'
  };

  const styleClass = variantStyles[variant] || variantStyles.default;

  return (
    <span 
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm border text-[10px] font-bold uppercase tracking-wider transition-colors duration-150 ${styleClass} ${className}`}
    >
      {icon && <iconify-icon icon={icon} className="text-[14px] text-theme-muted shrink-0"></iconify-icon>}
      <span>{content}</span>
    </span>
  );
}
