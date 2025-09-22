import React from 'react';
import { cn } from '@/lib/utils';

interface StatusPillProps {
  tone: 'ok' | 'warn' | 'info' | 'err';
  children: React.ReactNode;
  showDot?: boolean;
  className?: string;
}

export function StatusPill({ tone, children, showDot = false, className }: StatusPillProps) {
  const colorClasses = {
    ok: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    warn: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
    err: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
  };

  const dotClasses = {
    ok: 'bg-status-ok',
    warn: 'bg-status-warn',
    info: 'bg-status-info',
    err: 'bg-status-err',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-pill text-xs font-medium',
        colorClasses[tone],
        className
      )}
    >
      {showDot && (
        <span className={cn('w-2 h-2 rounded-full mr-1.5', dotClasses[tone])} />
      )}
      {children}
    </span>
  );
}