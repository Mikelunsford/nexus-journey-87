import React from 'react';
import { cn } from '@/lib/utils';

interface StatusBarProps {
  tone: 'brand' | 'ok' | 'warn' | 'err';
  className?: string;
}

export function StatusBar({ tone, className }: StatusBarProps) {
  const colorClasses = {
    brand: 'bg-brand-blue',
    ok: 'bg-green-600',
    warn: 'bg-amber-500',
    err: 'bg-brand-red',
  };

  return (
    <div className={cn('relative w-full h-4 bg-neutral-light dark:bg-neutral-mid rounded-pill overflow-hidden', className)}>
      <div
        className={cn(
          'h-full rounded-pill transition-all duration-200',
          colorClasses[tone]
        )}
        style={{ width: '100%' }}
        role="status"
        aria-label={`Status: ${tone}`}
      />
    </div>
  );
}