import React, { Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ProtectedRoute } from './guards/ProtectedRoute';
import { RoleGate } from './guards/RoleGate';
import { AppShell } from '@/components/layout/AppShell';

// Lazy load pages
const AuthPage = React.lazy(() => import('@/pages/AuthPage'));
const Dashboard = React.lazy(() => import('@/pages/Dashboard'));
const NotFoundPage = React.lazy(() => import('@/pages/NotFoundPage'));

// Placeholder components for now
const ProjectsPage = () => <div className="p-8">Projects Page - Coming Soon</div>;
const MessagesPage = () => <div className="p-8">Messages Page - Coming Soon</div>;
const ProductionPage = () => <div className="p-8">Production Page - Coming Soon</div>;
const ShippingPage = () => <div className="p-8">Shipping Page - Coming Soon</div>;
const DocumentsPage = () => <div className="p-8">Documents Page - Coming Soon</div>;
const CustomersPage = () => <div className="p-8">Customers Page - Coming Soon</div>;
const CarriersPage = () => <div className="p-8">Carriers Page - Coming Soon</div>;
const AccountingPage = () => <div className="p-8">Accounting Page - Coming Soon</div>;
const AnalyticsPage = () => <div className="p-8">Analytics Page - Coming Soon</div>;
const UsersPage = () => <div className="p-8">Users Page - Coming Soon</div>;
const OrganizationsPage = () => <div className="p-8">Organizations Page - Coming Soon</div>;
const SettingsPage = () => <div className="p-8">Settings Page - Coming Soon</div>;
const BridgePage = () => <div className="p-8">Bridge Panel - Coming Soon</div>;

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
            <ProjectsPage />
          </RoleGate>
        ),
      },
      {
        path: 'messages',
        element: (
          <RoleGate>
            <MessagesPage />
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
            <CustomersPage />
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
            <AnalyticsPage />
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
        path: 'admin/organizations',
        element: (
          <RoleGate>
            <OrganizationsPage />
          </RoleGate>
        ),
      },
      {
        path: 'settings',
        element: (
          <RoleGate>
            <SettingsPage />
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
        element: <BridgePage />,
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