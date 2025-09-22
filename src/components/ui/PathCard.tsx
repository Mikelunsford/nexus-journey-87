import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface PathCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  to: string;
  className?: string;
}

export function PathCard({ title, description, icon, to, className }: PathCardProps) {
  return (
    <Link
      to={to}
      className={cn(
        "group block p-6 bg-white dark:bg-surface-dark-1 rounded-xl border border-surface-2 dark:border-surface-dark-2 shadow-soft hover:shadow-strong transition-all duration-200 hover:scale-105 hover:border-brand-blue/20",
        className
      )}
    >
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 p-3 bg-brand-blue/10 dark:bg-brand-blue/20 rounded-lg group-hover:bg-brand-blue/20 dark:group-hover:bg-brand-blue/30 transition-colors">
          <div className="text-brand-blue w-6 h-6">
            {icon}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-brand-ink dark:text-brand-paper group-hover:text-brand-blue transition-colors">
            {title}
          </h3>
          <p className="mt-2 text-sm text-brand-gray dark:text-gray-400">
            {description}
          </p>
        </div>
        <div className="flex-shrink-0">
          <svg 
            className="w-5 h-5 text-brand-gray group-hover:text-brand-blue group-hover:translate-x-1 transition-all" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}