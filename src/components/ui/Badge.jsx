import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  className = '',
}) {
  const baseStyles = 'inline-flex items-center font-medium rounded-full';

  const variants = {
    active: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    pending: 'bg-amber-50 text-amber-700 border border-amber-200',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200',
    lapsed: 'bg-rose-50 text-rose-700 border border-rose-200',
    danger: 'bg-rose-50 text-rose-700 border border-rose-200',
    rejected: 'bg-rose-50 text-rose-700 border border-rose-200',
    info: 'bg-blue-50 text-blue-700 border border-blue-200',
    primary: 'bg-blue-900 text-white border border-blue-900',
    survey: 'bg-purple-50 text-purple-700 border border-purple-200',
    neutral: 'bg-slate-100 text-slate-700 border border-slate-200',
  };

  const dotColors = {
    active: 'bg-emerald-500',
    success: 'bg-emerald-500',
    pending: 'bg-amber-500',
    warning: 'bg-amber-500',
    lapsed: 'bg-rose-500',
    danger: 'bg-rose-500',
    rejected: 'bg-rose-500',
    info: 'bg-blue-500',
    primary: 'bg-white',
    survey: 'bg-purple-500',
    neutral: 'bg-slate-400',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-0.5 gap-1.5',
    lg: 'text-sm px-3 py-1 gap-2',
  };

  return (
    <span className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}>
      {dot && (
        <span className={clsx('w-1.5 h-1.5 rounded-full shrink-0', dotColors[variant] || 'bg-slate-400')} />
      )}
      {children}
    </span>
  );
}

export default Badge;
