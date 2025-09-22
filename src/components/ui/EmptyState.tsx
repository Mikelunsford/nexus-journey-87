import React from 'react';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  icon?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  action,
  secondaryAction,
  icon,
  className
}: EmptyStateProps) {
  return (
    <div className={cn('text-center py-12 px-4', className)}>
      {icon && (
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-surface-2 dark:bg-white/5 rounded-full flex items-center justify-center">
            <div className="w-8 h-8 t-dim">
              {icon}
            </div>
          </div>
        </div>
      )}
      
      <h3 className="text-lg font-semibold t-primary mb-2">
        {title}
      </h3>
      
      <p className="t-dim text-sm max-w-md mx-auto mb-6">
        {description}
      </p>
      
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {action && (
          <Button
            onClick={action.onClick}
            variant={action.variant || 'primary'}
            size="md"
          >
            {action.label}
          </Button>
        )}
        
        {secondaryAction && (
          <Button
            onClick={secondaryAction.onClick}
            variant="link"
            size="md"
          >
            {secondaryAction.label}
          </Button>
        )}
      </div>
    </div>
  );
}