import React from 'react';
import { useAuth } from '@/state/useAuth';
import { canView } from '@/lib/rbac';
import { useLocation } from 'react-router-dom';

interface RoleGateProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RoleGate({ children, fallback }: RoleGateProps) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user || !canView(location.pathname, user.role)) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-brand-ink dark:text-brand-paper mb-2">
              Access Restricted
            </h2>
            <p className="text-brand-gray">
              You don't have permission to view this page.
            </p>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
}