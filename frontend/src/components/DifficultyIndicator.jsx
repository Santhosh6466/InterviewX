import React from 'react';

const DIFFICULTY_CONFIG = {
  EASY: {
    label: 'Easy',
    color: 'bg-emerald-500',
    text: 'text-emerald-700 dark:text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
    dots: 1
  },
  1: {
    label: 'Easy',
    color: 'bg-emerald-500',
    text: 'text-emerald-700 dark:text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
    dots: 1
  },
  2: {
    label: 'Easy',
    color: 'bg-emerald-500',
    text: 'text-emerald-700 dark:text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
    dots: 1
  },
  MEDIUM: {
    label: 'Medium',
    color: 'bg-amber-500',
    text: 'text-amber-700 dark:text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20',
    dots: 2
  },
  3: {
    label: 'Medium',
    color: 'bg-amber-500',
    text: 'text-amber-700 dark:text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20',
    dots: 2
  },
  HARD: {
    label: 'Hard',
    color: 'bg-rose-500',
    text: 'text-rose-700 dark:text-rose-400',
    bg: 'bg-rose-500/10 border-rose-500/20',
    dots: 3
  },
  4: {
    label: 'Hard',
    color: 'bg-rose-500',
    text: 'text-rose-700 dark:text-rose-400',
    bg: 'bg-rose-500/10 border-rose-500/20',
    dots: 3
  },
  5: {
    label: 'Hard',
    color: 'bg-rose-500',
    text: 'text-rose-700 dark:text-rose-400',
    bg: 'bg-rose-500/10 border-rose-500/20',
    dots: 3
  }
};

export default function DifficultyIndicator({ difficulty, label, showLabel = true, className = '' }) {
  const rawKey = String(difficulty || label || 'MEDIUM').toUpperCase();
  const config = DIFFICULTY_CONFIG[rawKey] || DIFFICULTY_CONFIG.MEDIUM;
  const displayLabel = label || config.label;

  return (
    <span 
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-[10px] font-bold uppercase tracking-wider border ${config.bg} ${className}`}
    >
      <span className="inline-flex items-center gap-1">
        {[1, 2, 3].map((dotIndex) => (
          <span 
            key={dotIndex}
            className={`w-1.5 h-1.5 rounded-full transition-opacity ${
              dotIndex <= config.dots ? `${config.color} opacity-100` : 'bg-zinc-300 dark:bg-zinc-700 opacity-40'
            }`}
          />
        ))}
      </span>
      {showLabel && <span className={`${config.text}`}>{displayLabel}</span>}
    </span>
  );
}
