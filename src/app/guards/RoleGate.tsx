import React from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { canView } from '@/lib/rbac';
import { useLocation } from 'react-router-dom';

interface RoleGateProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RoleGate({ children, fallback }: RoleGateProps) {
  const { effectiveRole, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !canView(location.pathname, effectiveRole)) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Access Restricted
            </h2>
            <p className="text-muted-foreground">
              You don't have permission to view this page.
            </p>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
}