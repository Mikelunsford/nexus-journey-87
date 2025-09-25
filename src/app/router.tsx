import React, { Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ProtectedRoute } from './guards/ProtectedRoute';
import { RoleGate } from './guards/RoleGate';
import { AppShell } from '@/components/layout/AppShell';

// Lazy load pages
const AuthPage = React.lazy(() => import('@/pages/AuthPage'));
const Dashboard = React.lazy(() => import('@/pages/Dashboard'));
const TasksPage = React.lazy(() => import('@/pages/TasksPage'));
const EmployeesPage = React.lazy(() => import('@/pages/EmployeesPage'));
const NotFoundPage = React.lazy(() => import('@/pages/NotFoundPage'));

// Lazy load additional pages
const CustomersPage = React.lazy(() => import('@/pages/customers/CustomersPage'));
const QuotesPage = React.lazy(() => import('@/pages/QuotesPage'));
const QuotesNewPage = React.lazy(() => import('@/pages/quotes/QuotesNewPage'));
const ShipmentsPage = React.lazy(() => import('@/pages/ShipmentsPage'));
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

// Customer stub pages
const CustomerDetailPage = React.lazy(() => import('@/pages/customers/CustomerDetailPage'));
const CustomerEditPage = React.lazy(() => import('@/pages/customers/CustomerEditPage'));
const CustomerDeletePage = React.lazy(() => import('@/pages/customers/CustomerDeletePage'));

// Admin stub pages
const UsersInvitePage = React.lazy(() => import('@/pages/admin/UsersInvitePage'));
const UserDetailPage = React.lazy(() => import('@/pages/admin/UserDetailPage'));
const UserEditPage = React.lazy(() => import('@/pages/admin/UserEditPage'));
const UserDeletePage = React.lazy(() => import('@/pages/admin/UserDeletePage'));
const OrganizationDetailPage = React.lazy(() => import('@/pages/admin/OrganizationDetailPage'));
const OrganizationEditPage = React.lazy(() => import('@/pages/admin/OrganizationEditPage'));
const OrganizationDeletePage = React.lazy(() => import('@/pages/admin/OrganizationDeletePage'));

// Production stub pages
const WorkOrderDetailPage = React.lazy(() => import('@/pages/production/WorkOrderDetailPage'));
const WorkOrderNewPage = React.lazy(() => import('@/pages/production/WorkOrderNewPage'));
const CapacityViewPage = React.lazy(() => import('@/pages/production/CapacityViewPage'));
const QualityReportPage = React.lazy(() => import('@/pages/production/QualityReportPage'));
const MaintenanceSchedulePage = React.lazy(() => import('@/pages/production/MaintenanceSchedulePage'));

// Shipping stub pages
const ShipmentDetailPage = React.lazy(() => import('@/pages/shipping/ShipmentDetailPage'));
const ShipmentNewPage = React.lazy(() => import('@/pages/shipping/ShipmentNewPage'));
const RouteManagementPage = React.lazy(() => import('@/pages/shipping/RouteManagementPage'));
const CarrierRatesPage = React.lazy(() => import('@/pages/shipping/CarrierRatesPage'));

// Documents stub pages
const DocumentDetailPage = React.lazy(() => import('@/pages/documents/DocumentDetailPage'));
const DocumentUploadPage = React.lazy(() => import('@/pages/documents/DocumentUploadPage'));
const FolderCreatePage = React.lazy(() => import('@/pages/documents/FolderCreatePage'));
const DocumentSearchPage = React.lazy(() => import('@/pages/documents/DocumentSearchPage'));
const ArchiveViewPage = React.lazy(() => import('@/pages/documents/ArchiveViewPage'));

// Carriers stub pages
const CarrierDetailPage = React.lazy(() => import('@/pages/carriers/CarrierDetailPage'));
const CarrierNewPage = React.lazy(() => import('@/pages/carriers/CarrierNewPage'));
const ServiceAreasPage = React.lazy(() => import('@/pages/carriers/ServiceAreasPage'));
const PerformanceReportsPage = React.lazy(() => import('@/pages/carriers/PerformanceReportsPage'));

// Accounting stub pages
const InvoiceDetailPage = React.lazy(() => import('@/pages/accounting/InvoiceDetailPage'));
const InvoiceNewPage = React.lazy(() => import('@/pages/accounting/InvoiceNewPage'));
const PaymentRecordPage = React.lazy(() => import('@/pages/accounting/PaymentRecordPage'));
const FinancialReportsPage = React.lazy(() => import('@/pages/accounting/FinancialReportsPage'));
const TaxDocumentsPage = React.lazy(() => import('@/pages/accounting/TaxDocumentsPage'));

// Settings stub pages
const ProfilePage = React.lazy(() => import('@/pages/settings/ProfilePage'));
const SecurityPage = React.lazy(() => import('@/pages/settings/SecurityPage'));
const NotificationsPage = React.lazy(() => import('@/pages/settings/NotificationsPage'));
const BillingPage = React.lazy(() => import('@/pages/settings/BillingPage'));

// Analytics stub pages
const ReportsPage = React.lazy(() => import('@/pages/analytics/ReportsPage'));
const AnalyticsDashboardPage = React.lazy(() => import('@/pages/analytics/DashboardPage'));
const AnalyticsSettingsPage = React.lazy(() => import('@/pages/analytics/Settings'));
const SchedulePage = React.lazy(() => import('@/pages/analytics/Schedule'));

// Projects pages
const ProjectDetailPage = React.lazy(() => import('@/pages/projects/ProjectDetailPage'));
const NewInternalQuotePage = React.lazy(() => import('@/pages/projects/NewInternalQuote'));
const NewProjectPage = React.lazy(() => import('@/pages/projects/NewProject'));
const ProjectsNewPage = React.lazy(() => import('@/pages/projects/New'));
const TemplatesPage = React.lazy(() => import('@/pages/projects/Templates'));
const ProjectsTeamPage = React.lazy(() => import('@/pages/projects/Team'));
const ProjectsCalendarPage = React.lazy(() => import('@/pages/projects/Calendar'));
const ProjectChatPage = React.lazy(() => import('@/pages/projects/Chat'));

// Messages pages
const ComposePage = React.lazy(() => import('@/pages/messages/Compose'));
const MessagesTeamPage = React.lazy(() => import('@/pages/messages/Team'));
const AnnouncementsPage = React.lazy(() => import('@/pages/messages/Announcements'));
const MessagesArchivePage = React.lazy(() => import('@/pages/messages/Archive'));

// Settings pages (additional)
const BackupPage = React.lazy(() => import('@/pages/settings/Backup'));
const ThemesPage = React.lazy(() => import('@/pages/settings/Themes'));
const ApiKeysPage = React.lazy(() => import('@/pages/settings/ApiKeys'));

// Production pages (additional)
const NewWOPage = React.lazy(() => import('@/pages/production/NewWO'));
const QualityPage = React.lazy(() => import('@/pages/production/Quality'));
const MaintenancePage = React.lazy(() => import('@/pages/production/Maintenance'));

// Shipping pages (additional)
const TrackingPage = React.lazy(() => import('@/pages/shipping/Tracking'));

// Documents pages (additional)
const NewFolderPage = React.lazy(() => import('@/pages/documents/NewFolder'));

// Customers pages (additional)
const CustomerReportsPage = React.lazy(() => import('@/pages/customers/Reports'));

// Carriers pages (additional)
const RatesPage = React.lazy(() => import('@/pages/carriers/Rates'));
const CoveragePage = React.lazy(() => import('@/pages/carriers/Coverage'));
const CarrierReportsPage = React.lazy(() => import('@/pages/carriers/Reports'));

// Accounting pages (additional)
const NewPaymentPage = React.lazy(() => import('@/pages/accounting/NewPayment'));
const TaxPage = React.lazy(() => import('@/pages/accounting/Tax'));

// Admin Users pages
const UserRolesPage = React.lazy(() => import('@/pages/admin/users/Roles'));
const UserReportsPage = React.lazy(() => import('@/pages/admin/users/Reports'));
const DeactivatePage = React.lazy(() => import('@/pages/admin/users/Deactivate'));

// Admin Organizations pages
const OrganizationsNewPage = React.lazy(() => import('@/pages/admin/organizations/New'));
const OrganizationSettingsPage = React.lazy(() => import('@/pages/admin/organizations/Settings'));
const OrganizationAnalyticsPage = React.lazy(() => import('@/pages/admin/organizations/Analytics'));
const OrganizationExportPage = React.lazy(() => import('@/pages/admin/organizations/Export'));

// Note: Placeholder components have been replaced with proper stub pages

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
        path: 'projects/:id',
        element: (
          <RoleGate>
            <Suspense fallback={<PageLoader />}>
              <ProjectDetailPage />
            </Suspense>
          </RoleGate>
        ),
      },
      {
        path: 'tasks',
        element: (
          <RoleGate>
            <Suspense fallback={<PageLoader />}>
              <TasksPage />
            </Suspense>
          </RoleGate>
        ),
      },
      {
        path: 'employees',
        element: (
          <RoleGate>
            <Suspense fallback={<PageLoader />}>
              <EmployeesPage />
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
            <Suspense fallback={<PageLoader />}>
              <ProductionPage />
            </Suspense>
          </RoleGate>
        ),
      },
      {
        path: 'shipping',
        element: (
          <RoleGate>
            <Suspense fallback={<PageLoader />}>
              <ShippingPage />
            </Suspense>
          </RoleGate>
        ),
      },
      {
        path: 'documents',
        element: (
          <RoleGate>
            <Suspense fallback={<PageLoader />}>
              <DocumentsPage />
            </Suspense>
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
        path: 'quotes',
        element: (
          <RoleGate>
            <Suspense fallback={<PageLoader />}>
              <QuotesPage />
            </Suspense>
          </RoleGate>
        ),
      },
      {
        path: 'quotes/new',
        element: (
          <RoleGate>
            <Suspense fallback={<PageLoader />}>
              <QuotesNewPage />
            </Suspense>
          </RoleGate>
        ),
      },
      {
        path: 'shipments',
        element: (
          <RoleGate>
            <Suspense fallback={<PageLoader />}>
              <ShipmentsPage />
            </Suspense>
          </RoleGate>
        ),
      },
      {
        path: 'customers/new',
        element: (
          <RoleGate>
            <Suspense fallback={<PageLoader />}>
              <CustomersNewPage />
            </Suspense>
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
            <Suspense fallback={<PageLoader />}>
              <CustomerDetailPage />
            </Suspense>
          </RoleGate>
        ),
      },
      {
        path: 'customers/:id/edit',
        element: (
          <RoleGate>
            <Suspense fallback={<PageLoader />}>
              <CustomerEditPage />
            </Suspense>
          </RoleGate>
        ),
      },
      {
        path: 'customers/:id/delete',
        element: (
          <RoleGate>
            <Suspense fallback={<PageLoader />}>
              <CustomerDeletePage />
            </Suspense>
          </RoleGate>
        ),
      },
      {
        path: 'carriers',
        element: (
          <RoleGate>
            <Suspense fallback={<PageLoader />}>
              <CarriersPage />
            </Suspense>
          </RoleGate>
        ),
      },
      {
        path: 'accounting',
        element: (
          <RoleGate>
            <Suspense fallback={<PageLoader />}>
              <AccountingPage />
            </Suspense>
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
            <Suspense fallback={<PageLoader />}>
              <UsersPage />
            </Suspense>
          </RoleGate>
        ),
      },
      {
        path: 'admin/users/invite',
        element: (
          <RoleGate>
            <Suspense fallback={<PageLoader />}>
              <UsersInvitePage />
            </Suspense>
          </RoleGate>
        ),
      },
      {
        path: 'admin/users/:id',
        element: (
          <RoleGate>
            <Suspense fallback={<PageLoader />}>
              <UserDetailPage />
            </Suspense>
          </RoleGate>
        ),
      },
      {
        path: 'admin/users/:id/edit',
        element: (
          <RoleGate>
            <Suspense fallback={<PageLoader />}>
              <UserEditPage />
            </Suspense>
          </RoleGate>
        ),
      },
      {
        path: 'admin/users/:id/delete',
        element: (
          <RoleGate>
            <Suspense fallback={<PageLoader />}>
              <UserDeletePage />
            </Suspense>
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
            <Suspense fallback={<PageLoader />}>
              <OrganizationsPage />
            </Suspense>
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
        path: 'admin/organizations/:id',
        element: (
          <RoleGate>
            <Suspense fallback={<PageLoader />}>
              <OrganizationDetailPage />
            </Suspense>
          </RoleGate>
        ),
      },
      {
        path: 'admin/organizations/:id/edit',
        element: (
          <RoleGate>
            <Suspense fallback={<PageLoader />}>
              <OrganizationEditPage />
            </Suspense>
          </RoleGate>
        ),
      },
      {
        path: 'admin/organizations/:id/delete',
        element: (
          <RoleGate>
            <Suspense fallback={<PageLoader />}>
              <OrganizationDeletePage />
            </Suspense>
          </RoleGate>
        ),
      },
      // Production routes
      {
        path: 'production/work-orders/new',
        element: (
          <RoleGate>
            <Suspense fallback={<PageLoader />}>
              <WorkOrderNewPage />
            </Suspense>
          </RoleGate>
        ),
      },
      {
        path: 'production/work-orders/:id',
        element: (
          <RoleGate>
            <Suspense fallback={<PageLoader />}>
              <WorkOrderDetailPage />
            </Suspense>
          </RoleGate>
        ),
      },
      {
        path: 'production/capacity',
        element: (
          <RoleGate>
            <Suspense fallback={<PageLoader />}>
              <CapacityViewPage />
            </Suspense>
          </RoleGate>
        ),
      },
      {
        path: 'production/quality-reports',
        element: (
          <RoleGate>
            <Suspense fallback={<PageLoader />}>
              <QualityReportPage />
            </Suspense>
          </RoleGate>
        ),
      },
      {
        path: 'production/maintenance',
        element: (
          <RoleGate>
            <Suspense fallback={<PageLoader />}>
              <MaintenanceSchedulePage />
            </Suspense>
          </RoleGate>
        ),
      },
      // Shipping routes
      {
        path: 'shipping/new',
        element: (
          <RoleGate>
            <Suspense fallback={<PageLoader />}>
              <ShipmentNewPage />
            </Suspense>
          </RoleGate>
        ),
      },
      {
        path: 'shipping/:id',
        element: (
          <RoleGate>
            <Suspense fallback={<PageLoader />}>
              <ShipmentDetailPage />
            </Suspense>
          </RoleGate>
        ),
      },
      {
        path: 'shipping/routes',
        element: (
          <RoleGate>
            <Suspense fallback={<PageLoader />}>
              <RouteManagementPage />
            </Suspense>
          </RoleGate>
        ),
      },
      {
        path: 'shipping/rates',
        element: (
          <RoleGate>
            <Suspense fallback={<PageLoader />}>
              <CarrierRatesPage />
            </Suspense>
          </RoleGate>
        ),
      },
      // Documents routes
      {
        path: 'documents/upload',
        element: (
          <RoleGate>
            <Suspense fallback={<PageLoader />}>
              <DocumentUploadPage />
            </Suspense>
          </RoleGate>
        ),
      },
      {
        path: 'documents/folder/new',
        element: (
          <RoleGate>
            <Suspense fallback={<PageLoader />}>
              <FolderCreatePage />
            </Suspense>
          </RoleGate>
        ),
      },
      {
        path: 'documents/search',
        element: (
          <RoleGate>
            <Suspense fallback={<PageLoader />}>
              <DocumentSearchPage />
            </Suspense>
          </RoleGate>
        ),
      },
      {
        path: 'documents/archive',
        element: (
          <RoleGate>
            <Suspense fallback={<PageLoader />}>
              <ArchiveViewPage />
            </Suspense>
          </RoleGate>
        ),
      },
      {
        path: 'documents/:id',
        element: (
          <RoleGate>
            <Suspense fallback={<PageLoader />}>
              <DocumentDetailPage />
            </Suspense>
          </RoleGate>
        ),
      },
      // Carriers routes
      {
        path: 'carriers/new',
        element: (
          <RoleGate>
            <Suspense fallback={<PageLoader />}>
              <CarrierNewPage />
            </Suspense>
          </RoleGate>
        ),
      },
      {
        path: 'carriers/:id',
        element: (
          <RoleGate>
            <Suspense fallback={<PageLoader />}>
              <CarrierDetailPage />
            </Suspense>
          </RoleGate>
        ),
      },
      {
        path: 'carriers/service-areas',
        element: (
          <RoleGate>
            <Suspense fallback={<PageLoader />}>
              <ServiceAreasPage />
            </Suspense>
          </RoleGate>
        ),
      },
      {
        path: 'carriers/performance',
        element: (
          <RoleGate>
            <Suspense fallback={<PageLoader />}>
              <PerformanceReportsPage />
            </Suspense>
          </RoleGate>
        ),
      },
      // Accounting routes
      {
        path: 'accounting/invoices/new',
        element: (
          <RoleGate>
            <Suspense fallback={<PageLoader />}>
              <InvoiceNewPage />
            </Suspense>
          </RoleGate>
        ),
      },
      {
        path: 'accounting/invoices/:id',
        element: (
          <RoleGate>
            <Suspense fallback={<PageLoader />}>
              <InvoiceDetailPage />
            </Suspense>
          </RoleGate>
        ),
      },
      {
        path: 'accounting/payments/record',
        element: (
          <RoleGate>
            <Suspense fallback={<PageLoader />}>
              <PaymentRecordPage />
            </Suspense>
          </RoleGate>
        ),
      },
      {
        path: 'accounting/reports',
        element: (
          <RoleGate>
            <Suspense fallback={<PageLoader />}>
              <FinancialReportsPage />
            </Suspense>
          </RoleGate>
        ),
      },
      {
        path: 'accounting/tax-documents',
        element: (
          <RoleGate>
            <Suspense fallback={<PageLoader />}>
              <TaxDocumentsPage />
            </Suspense>
          </RoleGate>
        ),
      },
      // Settings routes
      {
        path: 'settings/profile',
        element: (
          <RoleGate>
            <Suspense fallback={<PageLoader />}>
              <ProfilePage />
            </Suspense>
          </RoleGate>
        ),
      },
      {
        path: 'settings/security',
        element: (
          <RoleGate>
            <Suspense fallback={<PageLoader />}>
              <SecurityPage />
            </Suspense>
          </RoleGate>
        ),
      },
      {
        path: 'settings/notifications',
        element: (
          <RoleGate>
            <Suspense fallback={<PageLoader />}>
              <NotificationsPage />
            </Suspense>
          </RoleGate>
        ),
      },
      {
        path: 'settings/billing',
        element: (
          <RoleGate>
            <Suspense fallback={<PageLoader />}>
              <BillingPage />
            </Suspense>
          </RoleGate>
        ),
      },
      // Projects routes
      {
        path: 'projects/new-internal',
        element: (
          <RoleGate>
            <Suspense fallback={<PageLoader />}>
              <NewInternalQuotePage />
            </Suspense>
          </RoleGate>
        ),
      },
      {
        path: 'projects/new-project',
        element: (
          <RoleGate>
            <Suspense fallback={<PageLoader />}>
              <NewProjectPage />
            </Suspense>
          </RoleGate>
        ),
      },
      {
        path: 'projects/new',
        element: (
          <RoleGate>
            <Suspense fallback={<PageLoader />}>
              <ProjectsNewPage />
            </Suspense>
          </RoleGate>
        ),
      },
      {
        path: 'projects/templates',
        element: (
          <RoleGate>
            <Suspense fallback={<PageLoader />}>
              <TemplatesPage />
            </Suspense>
          </RoleGate>
        ),
      },
      {
        path: 'projects/team',
        element: (
          <RoleGate>
            <Suspense fallback={<PageLoader />}>
              <ProjectsTeamPage />
            </Suspense>
          </RoleGate>
        ),
      },
      {
        path: 'projects/calendar',
        element: (
          <RoleGate>
            <Suspense fallback={<PageLoader />}>
              <ProjectsCalendarPage />
            </Suspense>
          </RoleGate>
        ),
      },
      {
        path: 'projects/:id/chat',
        element: (
          <RoleGate>
            <Suspense fallback={<PageLoader />}>
              <ProjectChatPage />
            </Suspense>
          </RoleGate>
        ),
      },
      // Messages routes
      {
        path: 'messages/compose',
        element: (
          <RoleGate>
            <Suspense fallback={<PageLoader />}>
              <ComposePage />
            </Suspense>
          </RoleGate>
        ),
      },
      {
        path: 'messages/team',
        element: (
          <RoleGate>
            <Suspense fallback={<PageLoader />}>
              <MessagesTeamPage />
            </Suspense>
          </RoleGate>
        ),
      },
      {
        path: 'messages/announcements',
        element: (
          <RoleGate>
            <Suspense fallback={<PageLoader />}>
              <AnnouncementsPage />
            </Suspense>
          </RoleGate>
        ),
      },
      {
        path: 'messages/archive',
        element: (
          <RoleGate>
            <Suspense fallback={<PageLoader />}>
              <MessagesArchivePage />
            </Suspense>
          </RoleGate>
        ),
      },
      // Analytics routes
      {
        path: 'analytics/reports',
        element: (
          <RoleGate>
            <Suspense fallback={<PageLoader />}>
              <ReportsPage />
            </Suspense>
          </RoleGate>
        ),
      },
      {
        path: 'analytics/settings',
        element: (
          <RoleGate>
            <Suspense fallback={<PageLoader />}>
              <AnalyticsSettingsPage />
            </Suspense>
          </RoleGate>
        ),
      },
      {
        path: 'analytics/schedule',
        element: (
          <RoleGate>
            <Suspense fallback={<PageLoader />}>
              <SchedulePage />
            </Suspense>
          </RoleGate>
        ),
      },
      {
        path: 'analytics/export',
        element: (
          <RoleGate>
            <Suspense fallback={<PageLoader />}>
              <AnalyticsDashboardPage />
            </Suspense>
          </RoleGate>
        ),
      },
      // Settings routes (additional)
      {
        path: 'settings/backup',
        element: (
          <RoleGate>
            <Suspense fallback={<PageLoader />}>
              <BackupPage />
            </Suspense>
          </RoleGate>
        ),
      },
      {
        path: 'settings/themes',
        element: (
          <RoleGate>
            <Suspense fallback={<PageLoader />}>
              <ThemesPage />
            </Suspense>
          </RoleGate>
        ),
      },
      {
        path: 'settings/api',
        element: (
          <RoleGate>
            <Suspense fallback={<PageLoader />}>
              <ApiKeysPage />
            </Suspense>
          </RoleGate>
        ),
      },
      // Additional production routes
      {
        path: 'production/new',
        element: (
          <RoleGate>
            <Suspense fallback={<PageLoader />}>
              <NewWOPage />
            </Suspense>
          </RoleGate>
        ),
      },
      {
        path: 'production/quality',
        element: (
          <RoleGate>
            <Suspense fallback={<PageLoader />}>
              <QualityPage />
            </Suspense>
          </RoleGate>
        ),
      },
      {
        path: 'production/maintenance-schedule',
        element: (
          <RoleGate>
            <Suspense fallback={<PageLoader />}>
              <MaintenancePage />
            </Suspense>
          </RoleGate>
        ),
      },
      // Additional shipping routes
      {
        path: 'shipping/tracking',
        element: (
          <RoleGate>
            <Suspense fallback={<PageLoader />}>
              <TrackingPage />
            </Suspense>
          </RoleGate>
        ),
      },
      // Additional documents routes
      {
        path: 'documents/folders/new',
        element: (
          <RoleGate>
            <Suspense fallback={<PageLoader />}>
              <NewFolderPage />
            </Suspense>
          </RoleGate>
        ),
      },
      // Customers routes (additional)
      {
        path: 'customers/reports',
        element: (
          <RoleGate>
            <Suspense fallback={<PageLoader />}>
              <CustomerReportsPage />
            </Suspense>
          </RoleGate>
        ),
      },
      // Additional carriers routes
      {
        path: 'carriers/rates',
        element: (
          <RoleGate>
            <Suspense fallback={<PageLoader />}>
              <RatesPage />
            </Suspense>
          </RoleGate>
        ),
      },
      {
        path: 'carriers/coverage',
        element: (
          <RoleGate>
            <Suspense fallback={<PageLoader />}>
              <CoveragePage />
            </Suspense>
          </RoleGate>
        ),
      },
      {
        path: 'carriers/reports',
        element: (
          <RoleGate>
            <Suspense fallback={<PageLoader />}>
              <CarrierReportsPage />
            </Suspense>
          </RoleGate>
        ),
      },
      // Additional accounting routes
      {
        path: 'accounting/payments/new',
        element: (
          <RoleGate>
            <Suspense fallback={<PageLoader />}>
              <NewPaymentPage />
            </Suspense>
          </RoleGate>
        ),
      },
      {
        path: 'accounting/tax',
        element: (
          <RoleGate>
            <Suspense fallback={<PageLoader />}>
              <TaxPage />
            </Suspense>
          </RoleGate>
        ),
      },
      // Admin Users routes
      {
        path: 'admin/users/roles',
        element: (
          <RoleGate>
            <Suspense fallback={<PageLoader />}>
              <UserRolesPage />
            </Suspense>
          </RoleGate>
        ),
      },
      {
        path: 'admin/users/reports',
        element: (
          <RoleGate>
            <Suspense fallback={<PageLoader />}>
              <UserReportsPage />
            </Suspense>
          </RoleGate>
        ),
      },
      {
        path: 'admin/users/deactivate',
        element: (
          <RoleGate>
            <Suspense fallback={<PageLoader />}>
              <DeactivatePage />
            </Suspense>
          </RoleGate>
        ),
      },
      // Admin Organizations routes
      {
        path: 'admin/organizations/new',
        element: (
          <RoleGate>
            <Suspense fallback={<PageLoader />}>
              <OrganizationsNewPage />
            </Suspense>
          </RoleGate>
        ),
      },
      {
        path: 'admin/organizations/settings',
        element: (
          <RoleGate>
            <Suspense fallback={<PageLoader />}>
              <OrganizationSettingsPage />
            </Suspense>
          </RoleGate>
        ),
      },
      {
        path: 'admin/organizations/analytics',
        element: (
          <RoleGate>
            <Suspense fallback={<PageLoader />}>
              <OrganizationAnalyticsPage />
            </Suspense>
          </RoleGate>
        ),
      },
      {
        path: 'admin/organizations/export',
        element: (
          <RoleGate>
            <Suspense fallback={<PageLoader />}>
              <OrganizationExportPage />
            </Suspense>
          </RoleGate>
        ),
      },
      {
        path: 'analytics/dashboard',
        element: (
          <RoleGate>
            <Suspense fallback={<PageLoader />}>
              <AnalyticsDashboardPage />
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

// Extract all route paths for development route checking
if (process.env.NODE_ENV === 'development') {
  interface RouteConfig {
    path?: string;
    children?: RouteConfig[];
  }
  
  const extractPaths = (routes: RouteConfig[], basePath = ''): string[] => {
    const paths: string[] = [];
    routes.forEach(route => {
      const currentPath = basePath + (route.path === '*' ? '' : route.path || '');
      if (currentPath && route.path !== '*') {
        paths.push(currentPath === '/' ? '/' : currentPath.replace(/\/$/, ''));
      }
      if (route.children) {
        paths.push(...extractPaths(route.children, currentPath === '/' ? '' : currentPath));
      }
    });
    return paths;
  };
  
  const allRoutePaths = extractPaths(router.routes as RouteConfig[]);
  (window as unknown as { __APP_ROUTES__?: string[] }).__APP_ROUTES__ = allRoutePaths;
  
  // Check for duplicate routes
  const duplicateRoutes = allRoutePaths.filter((path, index) => allRoutePaths.indexOf(path) !== index);
  if (duplicateRoutes.length > 0) {
    console.warn('Duplicate routes detected:', duplicateRoutes);
  }
}

export function AppRouter() {
  return <RouterProvider router={router} />;
}