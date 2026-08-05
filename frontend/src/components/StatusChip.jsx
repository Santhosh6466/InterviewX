import React from 'react';

const STATUS_CONFIG = {
  SELECTED: {
    label: 'Selected',
    icon: 'lucide:check-circle-2',
    style: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25 shadow-sm shadow-emerald-500/5'
  },
  REJECTED: {
    label: 'Rejected',
    icon: 'lucide:x-circle',
    style: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/25 shadow-sm shadow-rose-500/5'
  },
  WAITLISTED: {
    label: 'Waitlisted',
    icon: 'lucide:clock',
    style: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/25 shadow-sm shadow-amber-500/5'
  },
  NO_RESPONSE: {
    label: 'No Response',
    icon: 'lucide:help-circle',
    style: 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20'
  }
};

export default function StatusChip({ result, label, className = '' }) {
  const rawKey = String(result || label || 'SELECTED').toUpperCase();
  const config = STATUS_CONFIG[rawKey] || {
    label: label || result || 'Selected',
    icon: 'lucide:info',
    style: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25'
  };

  const displayLabel = label || config.label;

  return (
    <span 
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-[10px] font-bold uppercase tracking-wider border transition-all duration-150 ${config.style} ${className}`}
    >
      <iconify-icon icon={config.icon} className="text-[14px] shrink-0"></iconify-icon>
      <span>{displayLabel}</span>
    </span>
  );
}
