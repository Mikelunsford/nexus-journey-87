import React from 'react';
import { cn } from '@/lib/utils';

export type StatusType = 'active' | 'inactive' | 'away' | 'busy' | 'online' | 'offline';

interface StatusIndicatorProps {
  status: StatusType;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const STATUS_CONFIG: Record<StatusType, { color: string; label: string; pulse?: boolean }> = {
  active: { color: 'bg-green-500', label: 'Active', pulse: true },
  online: { color: 'bg-green-500', label: 'Online', pulse: true },
  away: { color: 'bg-yellow-500', label: 'Away' },
  busy: { color: 'bg-red-500', label: 'Busy' },
  inactive: { color: 'bg-gray-400', label: 'Inactive' },
  offline: { color: 'bg-gray-400', label: 'Offline' }
};

const SIZE_CONFIG = {
  sm: 'w-2 h-2',
  md: 'w-3 h-3',
  lg: 'w-4 h-4'
};

export function StatusIndicator({
  status,
  size = 'md',
  showLabel = false,
  className
}: StatusIndicatorProps) {
  const config = STATUS_CONFIG[status];
  const sizeClass = SIZE_CONFIG[size];

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="relative">
        <div
          className={cn(
            'rounded-full',
            sizeClass,
            config.color
          )}
        />
        {config.pulse && (
          <div
            className={cn(
              'absolute inset-0 rounded-full animate-ping opacity-75',
              sizeClass,
              config.color
            )}
          />
        )}
      </div>
      {showLabel && (
        <span className="text-sm t-dim">{config.label}</span>
      )}
    </div>
  );
}