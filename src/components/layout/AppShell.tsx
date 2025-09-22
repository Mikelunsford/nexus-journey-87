import React from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from './Sidebar';
import { Topbar } from './Topbar';

// Development-only route checking
if (process.env.NODE_ENV === 'development') {
  import('@/dev/routeCheck').then(({ checkRoutes }) => {
    checkRoutes([
      "/dashboard/projects/new-internal","/dashboard/projects/new-project","/dashboard/projects/new",
      "/dashboard/projects/templates","/dashboard/projects/team","/dashboard/projects/calendar",
      "/dashboard/messages/compose","/dashboard/messages/team","/dashboard/messages/announcements","/dashboard/messages/archive",
      "/dashboard/analytics/reports","/dashboard/analytics/export","/dashboard/analytics/settings","/dashboard/analytics/schedule",
      "/dashboard/settings/backup","/dashboard/settings/security","/dashboard/settings/themes","/dashboard/settings/api",
      "/dashboard/production/new","/dashboard/production/capacity","/dashboard/production/quality","/dashboard/production/maintenance",
      "/dashboard/shipping/new","/dashboard/shipping/tracking","/dashboard/shipping/routes",
      "/dashboard/documents/upload","/dashboard/documents/folders/new","/dashboard/documents/search","/dashboard/documents/archive",
      "/dashboard/customers/reports",
      "/dashboard/carriers/new","/dashboard/carriers/rates","/dashboard/carriers/coverage","/dashboard/carriers/reports",
      "/dashboard/accounting/invoices/new","/dashboard/accounting/payments/new","/dashboard/accounting/reports","/dashboard/accounting/tax",
      "/dashboard/admin/users/roles","/dashboard/admin/users/reports","/dashboard/admin/users/deactivate",
      "/dashboard/admin/organizations/new","/dashboard/admin/organizations/settings","/dashboard/admin/organizations/analytics","/dashboard/admin/organizations/export"
    ], (window as any).__APP_ROUTES__ || []);
  });
}

export function AppShell() {
  return (
    <SidebarProvider>
      <div className="app-surface min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <Topbar />
          <main className="flex-1 p-6 app-bg">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}