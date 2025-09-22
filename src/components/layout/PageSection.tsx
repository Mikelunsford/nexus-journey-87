import React from 'react';

interface PageSectionProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export default function PageSection({ title, subtitle, actions, children }: PageSectionProps) {
  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl md:text-3xl font-semibold text-text-light dark:text-text-onDark">{title}</h1>
        {subtitle && <p className="text-dim mt-1">{subtitle}</p>}
      </header>
      {actions}
      <div className="card-surface rounded-2xl shadow-soft p-5">{children}</div>
    </section>
  );
}