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
        <h1 className="t-primary text-2xl md:text-3xl font-semibold">{title}</h1>
        {subtitle && <p className="t-dim mt-1">{subtitle}</p>}
      </header>
      {actions}
      <div className="card-surface panel panel-body">{children}</div>
    </section>
  );
}