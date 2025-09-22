import React from 'react';
import { useNavigate } from 'react-router-dom';

export type QAItem = {
  label: string;
  to: string;
  icon?: React.ReactNode;
  onClick?: () => void;
};

interface QuickActionsListProps {
  items: QAItem[];
}

export function QuickActionsList({ items }: QuickActionsListProps) {
  const navigate = useNavigate();

  const handleItemClick = (item: QAItem) => {
    if (item.onClick) {
      item.onClick();
    } else {
      navigate(item.to);
    }
  };

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <button
          key={index}
          onClick={() => handleItemClick(item)}
          className="w-full flex items-center space-x-3 p-3 text-left rounded-lg border bg-card hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          {item.icon && (
            <div className="flex-shrink-0 text-brand-blue">
              {item.icon}
            </div>
          )}
          <span className="text-sm font-medium">{item.label}</span>
          <div className="flex-1" />
          <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      ))}
    </div>
  );
}