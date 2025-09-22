import React from 'react';
import { Button } from './button';
import { Badge } from './badge';
import { cn } from '@/lib/utils';

export interface SavedView {
  id: string;
  name: string;
  description?: string;
  filters: Record<string, any>;
  count?: number;
}

interface SavedViewsProps {
  views: SavedView[];
  activeViewId?: string;
  onViewSelect: (view: SavedView) => void;
  className?: string;
}

export function SavedViews({
  views,
  activeViewId,
  onViewSelect,
  className
}: SavedViewsProps) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {views.map((view) => (
        <Button
          key={view.id}
          variant={activeViewId === view.id ? 'primary' : 'outline'}
          size="sm"
          onClick={() => onViewSelect(view)}
          className="flex items-center gap-2"
        >
          <span>{view.name}</span>
          {view.count !== undefined && (
            <Badge 
              variant="secondary" 
              className={cn(
                'px-1.5 py-0.5 text-xs',
                activeViewId === view.id 
                  ? 'bg-white/20 text-white' 
                  : 'bg-muted'
              )}
            >
              {view.count}
            </Badge>
          )}
        </Button>
      ))}
    </div>
  );
}