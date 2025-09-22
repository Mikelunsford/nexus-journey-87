import React from 'react';
import { cn } from '@/lib/utils';

interface StatusBarProps {
  tone: 'ok' | 'warn' | 'info' | 'err';
  className?: string;
}

export function StatusBar({ tone, className }: StatusBarProps) {
  const colorClasses = {
    ok: 'bg-status-ok',
    warn: 'bg-status-warn',
    info: 'bg-status-info',
    err: 'bg-status-err',
  };

  return (
    <div
      className={cn(
        'h-4 rounded-sm transition-all duration-200',
        colorClasses[tone],
        className
      )}
      role="status"
      aria-label={`Status: ${tone}`}
    />
  );
}