import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';

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
  const [brandV1Enabled] = useFeatureFlag('ui.brand_v1');

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
          className="flex items-center justify-between rounded-xl px-4 py-2.5 bg-surface-0 dark:bg-white/5 dark:hover:bg-white/10 border border-black/5 dark:border-white/10 transition w-full text-left"
        >
          <div className="flex items-center space-x-3">
            {item.icon && (
              <div className={`flex-shrink-0 ${brandV1Enabled ? 'text-brand-blue' : 'text-brand-blue'}`}>
                {item.icon}
              </div>
            )}
            <span className="text-sm font-medium text-text-light dark:text-text-onDark">{item.label}</span>
          </div>
          <svg className="w-4 h-4 text-dim" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      ))}
    </div>
  );
}