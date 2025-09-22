import React, { Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ProtectedRoute } from './guards/ProtectedRoute';
import { RoleGate } from './guards/RoleGate';
import { AppShell } from '@/components/layout/AppShell';

// Lazy load pages
const AuthPage = React.lazy(() => import('@/pages/AuthPage'));
const Dashboard = React.lazy(() => import('@/pages/Dashboard'));
const NotFoundPage = React.lazy(() => import('@/pages/NotFoundPage'));

// Lazy load additional pages
const CustomersPage = React.lazy(() => import('@/pages/customers/CustomersPage'));
const CustomerLabelsPage = React.lazy(() => import('@/pages/customers/CustomerLabelsPage'));
const UserLabelsPage = React.lazy(() => import('@/pages/admin/UserLabelsPage'));
const OrgLabelsPage = React.lazy(() => import('@/pages/admin/OrgLabelsPage'));
const BridgePanel = React.lazy(() => import('@/pages/dev/BridgePanel'));

// Phase 1: High Priority Pages
const ProjectsPage = React.lazy(() => import('@/pages/ProjectsPage'));
const AnalyticsPage = React.lazy(() => import('@/pages/AnalyticsPage'));
const MessagesPage = React.lazy(() => import('@/pages/MessagesPage'));
const SettingsPage = React.lazy(() => import('@/pages/SettingsPage'));

// Additional pages
const ProductionPage = React.lazy(() => import('@/pages/ProductionPage'));
const ShippingPage = React.lazy(() => import('@/pages/ShippingPage'));
const DocumentsPage = React.lazy(() => import('@/pages/DocumentsPage'));
const CarriersPage = React.lazy(() => import('@/pages/CarriersPage'));
const AccountingPage = React.lazy(() => import('@/pages/AccountingPage'));
const UsersPage = React.lazy(() => import('@/pages/admin/UsersPage'));
const OrganizationsPage = React.lazy(() => import('@/pages/admin/OrganizationsPage'));
const CustomersNewPage = React.lazy(() => import('@/pages/customers/CustomersNewPage'));

// Placeholder components for remaining pages
const CustomerDetailPage = () => <div className="p-8">Customer Detail - Coming Soon</div>;
const UsersInvitePage = () => <div className="p-8">Invite User - Coming Soon</div>;

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-96">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-red mx-auto mb-4"></div>
      <p className="text-brand-gray">Loading...</p>
    </div>
  </div>
);

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Suspense fallback={<PageLoader />}>
        <AuthPage />
      </Suspense>
    ),
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: (
          <RoleGate>
            <Suspense fallback={<PageLoader />}>
              <Dashboard />
            </Suspense>
          </RoleGate>
        ),
      },
      {
        path: 'projects',
        element: (
          <RoleGate>
            <Suspense fallback={<PageLoader />}>
              <ProjectsPage />
            </Suspense>
          </RoleGate>
        ),
      },
      {
        path: 'messages',
        element: (
          <RoleGate>
            <Suspense fallback={<PageLoader />}>
              <MessagesPage />
            </Suspense>
          </RoleGate>
        ),
      },
      {
        path: 'production',
        element: (
          <RoleGate>
            <ProductionPage />
          </RoleGate>
        ),
      },
      {
        path: 'shipping',
        element: (
          <RoleGate>
            <ShippingPage />
          </RoleGate>
        ),
      },
      {
        path: 'documents',
        element: (
          <RoleGate>
            <DocumentsPage />
          </RoleGate>
        ),
      },
      {
        path: 'customers',
        element: (
          <RoleGate>
            <Suspense fallback={<PageLoader />}>
              <CustomersPage />
            </Suspense>
          </RoleGate>
        ),
      },
      {
        path: 'customers/new',
        element: (
          <RoleGate>
            <CustomersNewPage />
          </RoleGate>
        ),
      },
      {
        path: 'customers/labels',
        element: (
          <RoleGate>
            <Suspense fallback={<PageLoader />}>
              <CustomerLabelsPage />
            </Suspense>
          </RoleGate>
        ),
      },
      {
        path: 'customers/:id',
        element: (
          <RoleGate>
            <CustomerDetailPage />
          </RoleGate>
        ),
      },
      {
        path: 'carriers',
        element: (
          <RoleGate>
            <CarriersPage />
          </RoleGate>
        ),
      },
      {
        path: 'accounting',
        element: (
          <RoleGate>
            <AccountingPage />
          </RoleGate>
        ),
      },
      {
        path: 'analytics',
        element: (
          <RoleGate>
            <Suspense fallback={<PageLoader />}>
              <AnalyticsPage />
            </Suspense>
          </RoleGate>
        ),
      },
      {
        path: 'admin/users',
        element: (
          <RoleGate>
            <UsersPage />
          </RoleGate>
        ),
      },
      {
        path: 'admin/users/invite',
        element: (
          <RoleGate>
            <UsersInvitePage />
          </RoleGate>
        ),
      },
      {
        path: 'admin/users/labels',
        element: (
          <RoleGate>
            <Suspense fallback={<PageLoader />}>
              <UserLabelsPage />
            </Suspense>
          </RoleGate>
        ),
      },
      {
        path: 'admin/organizations',
        element: (
          <RoleGate>
            <OrganizationsPage />
          </RoleGate>
        ),
      },
      {
        path: 'admin/organizations/labels',
        element: (
          <RoleGate>
            <Suspense fallback={<PageLoader />}>
              <OrgLabelsPage />
            </Suspense>
          </RoleGate>
        ),
      },
      {
        path: 'settings',
        element: (
          <RoleGate>
            <Suspense fallback={<PageLoader />}>
              <SettingsPage />
            </Suspense>
          </RoleGate>
        ),
      },
    ],
  },
  {
    path: '/dev/bridge',
    element: (
      <ProtectedRoute>
        <RoleGate>
          <AppShell />
        </RoleGate>
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<PageLoader />}>
            <BridgePanel />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: '*',
    element: (
      <Suspense fallback={<PageLoader />}>
        <NotFoundPage />
      </Suspense>
    ),
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}