import React from 'react';
import { cn } from '@/lib/utils';

interface StatusBarProps {
  tone: 'brand' | 'ok' | 'warn' | 'err';
  className?: string;
}

export function StatusBar({ tone, className }: StatusBarProps) {
  const colorClasses = {
    brand: 'status-bar',
    ok: 'bg-green-600',
    warn: 'bg-amber-500',
    err: 'bg-brand-red',
  };

  return (
    <div className={cn('status-track h-4 rounded-pill w-full overflow-hidden', className)}>
      <div
        className={cn(
          'h-4 rounded-pill transition-all duration-200',
          colorClasses[tone]
        )}
        style={{ width: '100%' }}
        role="status"
        aria-label={`Status: ${tone}`}
      />
    </div>
  );
}