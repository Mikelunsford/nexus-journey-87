import React from 'react';
import { cn } from '@/lib/utils';

interface StatusBarProps {
  tone: 'brand' | 'ok' | 'warn' | 'err';
  className?: string;
}

export function StatusBar({ tone, className }: StatusBarProps) {
  return (
    <div className={cn('status-track w-full', className)}>
      <div
        className={cn(
          'status-fill transition-all duration-200',
          tone === 'brand' && 'status-brand',
          tone === 'ok' && 'status-ok',
          tone === 'warn' && 'status-warn', 
          tone === 'err' && 'status-err'
        )}
        style={{ width: '100%' }}
        role="status"
        aria-label={`Status: ${tone}`}
      />
    </div>
  );
}