import { BundleExporter, BundleFile } from "./bundleExporter";

export class GitHubBundleExporter {
  static async exportGitHubBundle(): Promise<void> {
    const files: BundleFile[] = [];
    
    // Generate all repository documentation files
    files.push(await this.generateProjectTree());
    files.push(await this.generatePackageConfig());
    files.push(await this.generateRoutingConfig());
    files.push(await this.generateEnvironmentVars());
    files.push(await this.generateApiIntegrations());
    files.push(await this.generateMigrationsSchema());
    files.push(await this.generateWorkflowsAutomation());
    
    const readme = this.generateReadme();
    
    await BundleExporter.createBundle({
      bundleName: 'repo-bundle',
      files,
      readme,
      includeMetadata: true
    });
  }
  
  private static async generateProjectTree(): Promise<BundleFile> {
    let content = 'TEAM1 PORTAL - PROJECT STRUCTURE\n';
    content += '================================\n\n';
    content += 'Complete file structure with descriptions of key directories\n';
    content += 'and files in the Team1 Portal repository.\n\n';
    
    content += 'ROOT LEVEL:\n';
    content += '-----------\n';
    content += 'README.md - Project overview and setup instructions\n';
    content += 'package.json - Node.js dependencies and npm scripts\n';
    content += 'vite.config.ts - Vite build configuration\n';
    content += 'tailwind.config.ts - Tailwind CSS configuration\n';
    content += 'tsconfig.json - TypeScript compiler configuration\n';
    content += 'postcss.config.js - PostCSS processing configuration\n';
    content += 'components.json - Shadcn/ui component configuration\n';
    content += 'eslint.config.js - ESLint linting rules\n';
    content += '.env - Environment variables (not in repo)\n\n';
    
    content += 'SOURCE STRUCTURE:\n';
    content += '-----------------\n';
    content += 'src/\n';
    content += '├── main.tsx - Application entry point\n';
    content += '├── App.tsx - Root React component\n';
    content += '├── index.css - Global styles and design system\n';
    content += '├── vite-env.d.ts - Vite type definitions\n\n';
    
    content += 'src/app/\n';
    content += '├── router.tsx - React Router configuration\n';
    content += '├── guards/ - Route protection components\n';
    content += '│   ├── ProtectedRoute.tsx - Authentication guard\n';
    content += '│   └── RoleGate.tsx - Role-based access guard\n';
    content += '└── theme/\n';
    content += '    └── ThemeProvider.tsx - Dark/light mode provider\n\n';
    
    content += 'src/components/\n';
    content += '├── ui/ - Reusable UI components (Shadcn/ui based)\n';
    content += '│   ├── button.tsx - Button component with variants\n';
    content += '│   ├── card.tsx - Card layout component\n';
    content += '│   ├── dialog.tsx - Modal dialog component\n';
    content += '│   ├── form.tsx - Form handling components\n';
    content += '│   ├── input.tsx - Input field components\n';
    content += '│   ├── table.tsx - Data table components\n';
    content += '│   └── [40+ other UI components]\n';
    content += '├── layout/ - Layout and navigation components\n';
    content += '│   ├── AppShell.tsx - Main application wrapper\n';
    content += '│   ├── Sidebar.tsx - Left navigation sidebar\n';
    content += '│   ├── Topbar.tsx - Top navigation bar\n';
    content += '│   └── PageSection.tsx - Standard page layout\n';
    content += '├── auth/ - Authentication components\n';
    content += '│   └── AuthProvider.tsx - Supabase auth integration\n';
    content += '├── admin/ - Admin-specific components\n';
    content += '│   ├── CreateUserModal.tsx - User creation form\n';
    content += '│   ├── UserDetailModal.tsx - User details display\n';
    content += '│   └── UserEditModal.tsx - User editing form\n';
    content += '├── charts/ - Data visualization components\n';
    content += '│   └── ThroughputChart.tsx - Performance charts\n';
    content += '└── dev/ - Development tools\n';
    content += '    ├── ApiTester.tsx - API testing interface\n';
    content += '    ├── LogsPanel.tsx - Debug log viewer\n';
    content += '    └── SchemaViewer.tsx - Database schema viewer\n\n';
    
    content += 'src/pages/ - Page components organized by feature\n';
    content += '├── Dashboard.tsx - Main dashboard page\n';
    content += '├── AuthPage.tsx - Login/signup page\n';
    content += '├── ProjectsPage.tsx - Project management\n';
    content += '├── CustomersPage.tsx - Customer management\n';
    content += '├── ProductionPage.tsx - Production management\n';
    content += '├── ShippingPage.tsx - Logistics management\n';
    content += '├── AccountingPage.tsx - Financial management\n';
    content += '├── AnalyticsPage.tsx - Business intelligence\n';
    content += '├── admin/ - Admin pages (30+ files)\n';
    content += '├── customers/ - Customer sub-pages\n';
    content += '├── production/ - Production sub-pages\n';
    content += '├── shipping/ - Shipping sub-pages\n';
    content += '├── accounting/ - Accounting sub-pages\n';
    content += '├── settings/ - Settings sub-pages\n';
    content += '└── dev/ - Development tools pages\n\n';
    
    content += 'src/hooks/ - Custom React hooks\n';
    content += '├── useSupabaseAuth.ts - Authentication hook\n';
    content += '├── useProjects.ts - Project data management\n';
    content += '├── useCustomers.ts - Customer data management\n';
    content += '├── useUsers.ts - User management hook\n';
    content += '├── useProfile.ts - User profile management\n';
    content += '└── useFeatureFlag.ts - Feature flag management\n\n';
    
    content += 'src/lib/ - Utility libraries and business logic\n';
    content += '├── utils.ts - General utility functions\n';
    content += '├── storage.ts - Local storage helpers\n';
    content += '├── rbac.ts - Role-based access control\n';
    content += '├── types.ts - TypeScript type definitions\n';
    content += '├── ids.ts - ID generation utilities\n';
    content += '├── featureFlags.ts - Feature flag definitions\n';
    content += '├── events.ts - Event system types\n';
    content += '├── export/ - Data export functionality\n';
    content += '│   ├── csvExporter.ts - CSV export utilities\n';
    content += '│   ├── appDataExporter.ts - App data export\n';
    content += '│   └── schemaExporter.ts - Schema export\n';
    content += '├── accounting/ - Financial logic\n';
    content += '├── analytics/ - Business intelligence\n';
    content += '├── import/ - Data import functionality\n';
    content += '├── mock/ - Mock data and testing\n';
    content += '└── rbac/ - Role-based access control\n\n';
    
    content += 'src/integrations/\n';
    content += '└── supabase/\n';
    content += '    ├── client.ts - Supabase client configuration\n';
    content += '    └── types.ts - Generated database types\n\n';
    
    content += 'SUPABASE CONFIGURATION:\n';
    content += '-----------------------\n';
    content += 'supabase/\n';
    content += '├── config.toml - Supabase project configuration\n';
    content += '├── functions/ - Edge functions\n';
    content += '│   ├── create-user/index.ts - User creation function\n';
    content += '│   └── invite-user/index.ts - User invitation function\n';
    content += '└── migrations/ - Database migrations (read-only)\n\n';
    
    content += 'BUILD & DEPLOYMENT:\n';
    content += '-------------------\n';
    content += 'scripts/ - Build and utility scripts\n';
    content += '├── export-routes.mjs - Route extraction\n';
    content += '├── export-schema.mjs - Schema extraction\n';
    content += '├── export-rls.mjs - RLS policy extraction\n';
    content += '├── export-buildmeta.mjs - Build metadata\n';
    content += '├── write-index.mjs - Documentation generation\n';
    content += '└── design-guard.js - Design system validation\n\n';
    
    content += '.github/\n';
    content += '└── workflows/\n';
    content += '    └── docs.yml - Documentation generation workflow\n\n';
    
    content += 'PUBLIC ASSETS:\n';
    content += '--------------\n';
    content += 'public/\n';
    content += '├── favicon.ico - Site favicon\n';
    content += '├── robots.txt - Search engine directives\n';
    content += '└── placeholder.svg - Placeholder image\n\n';
    
    content += 'KEY PATTERNS:\n';
    content += '-------------\n';
    content += '- Feature-based organization (pages, components)\n';
    content += '- Reusable UI components in src/components/ui/\n';
    content += '- Custom hooks for data management\n';
    content += '- Utility libraries for business logic\n';
    content += '- Type-safe database integration\n';
    content += '- Comprehensive export/import functionality\n';
    content += '- Role-based access control throughout\n';
    content += '- Development tools and debugging utilities\n';
    
    return {
      name: 'project-tree.txt',
      content,
      description: 'Complete project file structure with descriptions of key directories and files'
    };
  }
  
  private static async generatePackageConfig(): Promise<BundleFile> {
    let content = 'TEAM1 PORTAL - PACKAGE CONFIGURATION\n';
    content += '====================================\n\n';
    content += 'Complete overview of package.json configuration including\n';
    content += 'dependencies, scripts, and build configuration.\n\n';
    
    content += 'PROJECT METADATA:\n';
    content += '-----------------\n';
    content += 'Name: vite_react_shadcn_ts\n';
    content += 'Version: 0.0.0\n';
    content += 'Type: module (ES modules)\n';
    content += 'Private: true (not for npm publication)\n\n';
    
    content += 'BUILD SCRIPTS:\n';
    content += '--------------\n';
    content += 'dev: vite - Start development server\n';
    content += 'build: vite build - Production build\n';
    content += 'build:dev: vite build --mode development - Development build\n';
    content += 'lint: eslint . - Code linting\n';
    content += 'preview: vite preview - Preview production build\n\n';
    
    content += 'DOCUMENTATION SCRIPTS:\n';
    content += '----------------------\n';
    content += 'docs:prepare: rimraf docs && mkdir -p docs/data - Setup docs directory\n';
    content += 'docs:routes: node scripts/export-routes.mjs - Extract route definitions\n';
    content += 'docs:schema: node scripts/export-schema.mjs - Export database schema\n';
    content += 'docs:rls: node scripts/export-rls.mjs - Export RLS policies\n';
    content += 'docs:buildmeta: node scripts/export-buildmeta.mjs - Build metadata\n';
    content += 'docs:index: node scripts/write-index.mjs - Generate documentation index\n';
    content += 'docs:all: npm run docs:prepare && ... - Run all documentation tasks\n\n';
    
    content += 'CORE DEPENDENCIES:\n';
    content += '------------------\n';
    content += 'React Ecosystem:\n';
    content += '  react: ^18.3.1 - Core React library\n';
    content += '  react-dom: ^18.3.1 - React DOM rendering\n';
    content += '  react-router-dom: ^7.9.1 - Client-side routing\n';
    content += '  react-hook-form: ^7.63.0 - Form handling\n\n';
    
    content += 'UI Framework:\n';
    content += '  @radix-ui/* - 20+ Radix UI primitive components\n';
    content += '  class-variance-authority: ^0.7.1 - Component variant system\n';
    content += '  tailwind-merge: ^3.3.1 - Tailwind class merging\n';
    content += '  tailwindcss-animate: ^1.0.7 - CSS animations\n';
    content += '  lucide-react: ^0.544.0 - Icon library\n';
    content += '  next-themes: ^0.4.6 - Theme management\n\n';
    
    content += 'Backend Integration:\n';
    content += '  @supabase/supabase-js: ^2.57.4 - Supabase client\n';
    content += '  @tanstack/react-query: ^5.90.1 - Data fetching/caching\n\n';
    
    content += 'Data Visualization:\n';
    content += '  recharts: ^3.2.1 - Chart components\n';
    content += '  date-fns: ^4.1.0 - Date manipulation\n\n';
    
    content += 'UI Enhancement:\n';
    content += '  sonner: ^2.0.7 - Toast notifications\n';
    content += '  cmdk: ^1.1.1 - Command palette\n';
    content += '  vaul: ^1.1.2 - Drawer component\n';
    content += '  embla-carousel-react: ^8.6.0 - Carousel component\n';
    content += '  input-otp: ^1.4.2 - OTP input component\n';
    content += '  react-day-picker: ^9.11.0 - Date picker\n';
    content += '  react-resizable-panels: ^3.0.6 - Resizable layouts\n\n';
    
    content += 'State Management:\n';
    content += '  zustand: ^5.0.8 - Lightweight state management\n\n';
    
    content += 'Utilities:\n';
    content += '  jszip: ^3.10.1 - ZIP file creation (for exports)\n';
    content += '  react-is: ^18.3.1 - React element type checking\n\n';
    
    content += 'DEVELOPMENT DEPENDENCIES:\n';
    content += '-------------------------\n';
    content += 'Build Tools:\n';
    content += '  vite: ^5.4.19 - Build tool and dev server\n';
    content += '  @vitejs/plugin-react-swc: ^3.11.0 - React SWC plugin\n';
    content += '  typescript: ^5.8.3 - TypeScript compiler\n\n';
    
    content += 'Code Quality:\n';
    content += '  eslint: ^9.32.0 - JavaScript/TypeScript linting\n';
    content += '  @eslint/js: ^9.32.0 - ESLint JavaScript config\n';
    content += '  typescript-eslint: ^8.38.0 - TypeScript ESLint rules\n';
    content += '  eslint-plugin-react-hooks: ^5.2.0 - React hooks linting\n';
    content += '  eslint-plugin-react-refresh: ^0.4.20 - React refresh linting\n';
    content += '  globals: ^15.15.0 - Global variable definitions\n\n';
    
    content += 'Styling:\n';
    content += '  tailwindcss: ^3.4.17 - Utility-first CSS framework\n';
    content += '  @tailwindcss/typography: ^0.5.16 - Typography plugin\n';
    content += '  autoprefixer: ^10.4.21 - CSS autoprefixer\n';
    content += '  postcss: ^8.5.6 - CSS processing\n\n';
    
    content += 'Database Tools:\n';
    content += '  pg: ^8.12.0 - PostgreSQL client for scripts\n\n';
    
    content += 'Utilities:\n';
    content += '  @types/node: ^22.16.5 - Node.js type definitions\n';
    content += '  @types/react: ^18.3.24 - React type definitions\n';
    content += '  @types/react-dom: ^18.3.7 - React DOM type definitions\n';
    content += '  rimraf: ^6.0.0 - Cross-platform rm -rf\n';
    content += '  lovable-tagger: ^1.1.9 - Lovable development tool\n\n';
    
    content += 'BUILD CONFIGURATION:\n';
    content += '--------------------\n';
    content += 'Build Tool: Vite (fast, modern bundler)\n';
    content += 'TypeScript: Strict mode enabled\n';
    content += 'React: SWC compiler for fast builds\n';
    content += 'CSS: PostCSS with Tailwind processing\n';
    content += 'Assets: Optimized bundling and code splitting\n';
    content += 'HMR: Hot module replacement in development\n\n';
    
    content += 'PACKAGE MANAGEMENT:\n';
    content += '-------------------\n';
    content += 'Lock File: bun.lockb (Bun package manager)\n';
    content += 'Node Version: Compatible with Node 18+\n';
    content += 'Registry: npm registry for all packages\n';
    content += 'Security: Regular dependency updates\n\n';
    
    content += 'PERFORMANCE CONSIDERATIONS:\n';
    content += '---------------------------\n';
    content += 'Bundle Size: Tree shaking enabled\n';
    content += 'Code Splitting: Route-based lazy loading\n';
    content += 'Dependencies: Minimal runtime bundle\n';
    content += 'Build Speed: SWC compiler for fast builds\n';
    content += 'Development: Fast HMR and instant server start\n';
    
    return {
      name: 'package-config.txt',
      content: BundleExporter.sanitizeContent(content),
      description: 'Complete package.json analysis with dependencies, scripts, and build configuration'
    };
  }
  
  private static async generateRoutingConfig(): Promise<BundleFile> {
    let content = 'TEAM1 PORTAL - ROUTING CONFIGURATION\n';
    content += '====================================\n\n';
    content += 'Complete routing structure using React Router v7 with\n';
    content += 'authentication guards and role-based access control.\n\n';
    
    content += 'ROUTING ARCHITECTURE:\n';
    content += '---------------------\n';
    content += 'Router: React Router v7 (createBrowserRouter)\n';
    content += 'Loading: Lazy loading with React.lazy()\n';
    content += 'Guards: Authentication and role-based protection\n';
    content += 'Layout: Nested routes with AppShell wrapper\n';
    content += 'Fallback: Suspense with loading components\n\n';
    
    content += 'ROOT LEVEL ROUTES:\n';
    content += '------------------\n';
    content += '/ - Authentication page (login/signup)\n';
    content += '/auth - Authentication page (alias)\n';
    content += '/auth/accept-invitation - Invitation acceptance\n';
    content += '/dashboard/* - Protected application routes\n\n';
    
    content += 'AUTHENTICATION FLOW:\n';
    content += '---------------------\n';
    content += 'Unauthenticated: Redirected to / or /auth\n';
    content += 'Authenticated: Access to /dashboard routes\n';
    content += 'Role Check: RoleGate component validates permissions\n';
    content += 'Session: Supabase JWT token management\n\n';
    
    content += 'DASHBOARD ROUTES:\n';
    content += '-----------------\n';
    content += '/dashboard - Main dashboard (index route)\n';
    content += '/dashboard/projects - Project management\n';
    content += '/dashboard/tasks - Task tracking\n';
    content += '/dashboard/employees - Employee directory\n';
    content += '/dashboard/customers - Customer management\n';
    content += '/dashboard/production - Manufacturing/work orders\n';
    content += '/dashboard/shipping - Logistics management\n';
    content += '/dashboard/documents - Document management\n';
    content += '/dashboard/carriers - Carrier management\n';
    content += '/dashboard/accounting - Financial management\n';
    content += '/dashboard/analytics - Business intelligence\n';
    content += '/dashboard/messages - Internal communications\n';
    content += '/dashboard/settings - User preferences\n\n';
    
    content += 'CUSTOMER MANAGEMENT ROUTES:\n';
    content += '---------------------------\n';
    content += '/dashboard/customers - Customer list\n';
    content += '/dashboard/customers/new - Create customer\n';
    content += '/dashboard/customers/labels - Customer labels\n';
    content += '/dashboard/customers/:id - Customer details\n';
    content += '/dashboard/customers/:id/edit - Edit customer\n';
    content += '/dashboard/customers/:id/delete - Delete customer\n\n';
    
    content += 'ADMIN ROUTES:\n';
    content += '-------------\n';
    content += '/dashboard/admin/users - User management\n';
    content += '/dashboard/admin/users/invite - Invite users\n';
    content += '/dashboard/admin/users/:id - User details\n';
    content += '/dashboard/admin/users/:id/edit - Edit user\n';
    content += '/dashboard/admin/users/:id/delete - Delete user\n';
    content += '/dashboard/admin/users/labels - User labels\n';
    content += '/dashboard/admin/organizations - Organization management\n';
    content += '/dashboard/admin/organizations/:id - Organization details\n';
    content += '/dashboard/admin/organizations/:id/edit - Edit organization\n';
    content += '/dashboard/admin/organizations/:id/delete - Delete organization\n';
    content += '/dashboard/admin/organizations/labels - Organization labels\n\n';
    
    content += 'PRODUCTION ROUTES:\n';
    content += '------------------\n';
    content += '/dashboard/production/work-orders/new - Create work order\n';
    content += '/dashboard/production/work-orders/:id - Work order details\n';
    content += '/dashboard/production/capacity - Capacity planning\n';
    content += '/dashboard/production/quality - Quality reports\n';
    content += '/dashboard/production/maintenance - Maintenance schedules\n\n';
    
    content += 'SHIPPING ROUTES:\n';
    content += '----------------\n';
    content += '/dashboard/shipping/shipments/new - Create shipment\n';
    content += '/dashboard/shipping/shipments/:id - Shipment details\n';
    content += '/dashboard/shipping/routes - Route management\n';
    content += '/dashboard/shipping/carriers/rates - Carrier rates\n';
    content += '/dashboard/shipping/tracking - Shipment tracking\n\n';
    
    content += 'DOCUMENTS ROUTES:\n';
    content += '-----------------\n';
    content += '/dashboard/documents/upload - Upload documents\n';
    content += '/dashboard/documents/search - Search documents\n';
    content += '/dashboard/documents/archive - Document archive\n';
    content += '/dashboard/documents/:id - Document details\n';
    content += '/dashboard/documents/folders/new - Create folder\n\n';
    
    content += 'ACCOUNTING ROUTES:\n';
    content += '------------------\n';
    content += '/dashboard/accounting/invoices/new - Create invoice\n';
    content += '/dashboard/accounting/invoices/:id - Invoice details\n';
    content += '/dashboard/accounting/payments/new - Record payment\n';
    content += '/dashboard/accounting/payments/:id - Payment details\n';
    content += '/dashboard/accounting/reports - Financial reports\n';
    content += '/dashboard/accounting/tax - Tax documents\n\n';
    
    content += 'SETTINGS ROUTES:\n';
    content += '----------------\n';
    content += '/dashboard/settings/profile - User profile\n';
    content += '/dashboard/settings/security - Security settings\n';
    content += '/dashboard/settings/notifications - Notification preferences\n';
    content += '/dashboard/settings/billing - Billing information\n';
    content += '/dashboard/settings/themes - Theme preferences\n';
    content += '/dashboard/settings/api-keys - API key management\n';
    content += '/dashboard/settings/backup - Backup and export\n\n';
    
    content += 'DEVELOPMENT ROUTES:\n';
    content += '-------------------\n';
    content += '/dev/bridge - Developer bridge panel (event simulation)\n\n';
    
    content += 'ROUTE PROTECTION:\n';
    content += '-----------------\n';
    content += 'ProtectedRoute: Wraps all /dashboard routes\n';
    content += '  - Checks authentication status\n';
    content += '  - Redirects to /auth if not authenticated\n';
    content += '  - Provides AppShell layout wrapper\n\n';
    
    content += 'RoleGate: Wraps individual route components\n';
    content += '  - Validates user permissions\n';
    content += '  - Checks organization membership\n';
    content += '  - Enforces role-based access control\n';
    content += '  - Shows access denied for insufficient permissions\n\n';
    
    content += 'LAZY LOADING:\n';
    content += '-------------\n';
    content += 'All route components use React.lazy() for code splitting\n';
    content += 'Suspense boundaries with loading fallbacks\n';
    content += 'Automatic bundle optimization\n';
    content += 'Improved initial page load performance\n\n';
    
    content += 'NAVIGATION PATTERNS:\n';
    content += '--------------------\n';
    content += 'Sidebar: Primary navigation for main modules\n';
    content += 'Breadcrumbs: Secondary navigation for sub-pages\n';
    content += 'Back buttons: Consistent navigation between levels\n';
    content += 'Deep linking: All routes support direct URL access\n';
    content += 'State preservation: Navigation maintains form state\n\n';
    
    content += 'ERROR HANDLING:\n';
    content += '---------------\n';
    content += 'NotFoundPage: 404 error handling\n';
    content += 'Route guards: Access denied pages\n';
    content += 'Error boundaries: Component error catching\n';
    content += 'Graceful degradation: Fallback components\n';
    
    return {
      name: 'routing-config.txt',
      content,
      description: 'Complete routing configuration with authentication guards and role-based access'
    };
  }
  
  private static async generateEnvironmentVars(): Promise<BundleFile> {
    let content = 'TEAM1 PORTAL - ENVIRONMENT VARIABLES\n';
    content += '====================================\n\n';
    content += 'Environment variable configuration (values redacted for security).\n';
    content += 'This documentation shows variable names and usage patterns.\n\n';
    
    content += 'SUPABASE CONFIGURATION:\n';
    content += '-----------------------\n';
    content += 'SUPABASE_URL: [REDACTED]\n';
    content += '  Purpose: Supabase project API endpoint\n';
    content += '  Usage: Client configuration, API calls\n';
    content += '  Format: https://[project-id].supabase.co\n\n';
    
    content += 'SUPABASE_ANON_KEY: [REDACTED]\n';
    content += '  Purpose: Public anonymous key for client-side access\n';
    content += '  Usage: Frontend authentication, public API calls\n';
    content += '  Security: Safe for client-side exposure\n\n';
    
    content += 'SUPABASE_SERVICE_ROLE_KEY: [REDACTED]\n';
    content += '  Purpose: Service role key for admin operations\n';
    content += '  Usage: Server-side operations, bypassing RLS\n';
    content += '  Security: Server-side only, never expose to client\n\n';
    
    content += 'SUPABASE_DB_URL: [REDACTED]\n';
    content += '  Purpose: Direct database connection string\n';
    content += '  Usage: Database exports, schema operations\n';
    content += '  Format: postgresql://[credentials]@[host]/[database]\n\n';
    
    content += 'DATABASE ACCESS:\n';
    content += '----------------\n';
    content += 'DB_URL_READONLY: [REDACTED]\n';
    content += '  Purpose: Read-only database access for exports\n';
    content += '  Usage: Schema exports, RLS policy exports\n';
    content += '  Security: Limited to SELECT operations only\n\n';
    
    content += 'API INTEGRATIONS:\n';
    content += '-----------------\n';
    content += 'LOVABLE_API_KEY: [REDACTED]\n';
    content += '  Purpose: Lovable platform integration\n';
    content += '  Usage: Development tooling, deployment\n';
    content += '  Environment: Development and staging\n\n';
    
    content += 'RESEND_API_KEY: [REDACTED]\n';
    content += '  Purpose: Email service integration\n';
    content += '  Usage: Transactional emails, notifications\n';
    content += '  Provider: Resend email service\n\n';
    
    content += 'DEVELOPMENT VARIABLES:\n';
    content += '----------------------\n';
    content += 'NODE_ENV: development | production | test\n';
    content += '  Purpose: Environment detection\n';
    content += '  Usage: Feature flags, debug modes\n';
    content += '  Default: development\n\n';
    
    content += 'VITE_* Variables: NOT USED\n';
    content += '  Note: This project does not use VITE_ prefixed variables\n';
    content += '  Reason: Lovable does not support VITE_ environment variables\n';
    content += '  Alternative: Direct configuration in code\n\n';
    
    content += 'SECURITY CONSIDERATIONS:\n';
    content += '------------------------\n';
    content += 'Public Variables:\n';
    content += '  - SUPABASE_URL (safe to expose)\n';
    content += '  - SUPABASE_ANON_KEY (designed for client-side)\n';
    content += '  - NODE_ENV (standard practice)\n\n';
    
    content += 'Private Variables (never expose to client):\n';
    content += '  - SUPABASE_SERVICE_ROLE_KEY\n';
    content += '  - SUPABASE_DB_URL\n';
    content += '  - DB_URL_READONLY\n';
    content += '  - RESEND_API_KEY\n';
    content += '  - LOVABLE_API_KEY\n\n';
    
    content += 'CONFIGURATION MANAGEMENT:\n';
    content += '-------------------------\n';
    content += 'Local Development: .env file (not in repository)\n';
    content += 'Production: Platform environment variables\n';
    content += 'Staging: Separate environment configuration\n';
    content += 'Testing: Test-specific variable overrides\n\n';
    
    content += 'VARIABLE VALIDATION:\n';
    content += '--------------------\n';
    content += 'Required Variables:\n';
    content += '  - SUPABASE_URL (client functionality)\n';
    content += '  - SUPABASE_ANON_KEY (authentication)\n';
    content += '  - SUPABASE_SERVICE_ROLE_KEY (server operations)\n\n';
    
    content += 'Optional Variables:\n';
    content += '  - RESEND_API_KEY (email features)\n';
    content += '  - LOVABLE_API_KEY (development tools)\n';
    content += '  - DB_URL_READONLY (export features)\n\n';
    
    content += 'USAGE PATTERNS:\n';
    content += '---------------\n';
    content += 'Client-side Access:\n';
    content += '  import { supabase } from "@/integrations/supabase/client"\n';
    content += '  // Uses SUPABASE_URL and SUPABASE_ANON_KEY automatically\n\n';
    
    content += 'Server-side Operations:\n';
    content += '  // Edge functions use SUPABASE_SERVICE_ROLE_KEY\n';
    content += '  // Database scripts use DB_URL_READONLY\n\n';
    
    content += 'DEPLOYMENT CONSIDERATIONS:\n';
    content += '--------------------------\n';
    content += 'Build Time: Variables available during build process\n';
    content += 'Runtime: Server-side variables not exposed to client\n';
    content += 'Security: Sensitive keys stored securely in platform\n';
    content += 'Rotation: Regular key rotation for security\n';
    content += 'Monitoring: Environment variable access logging\n\n';
    
    content += 'TROUBLESHOOTING:\n';
    content += '----------------\n';
    content += 'Missing Variables: Check platform configuration\n';
    content += 'Invalid Keys: Verify Supabase project settings\n';
    content += 'Access Issues: Confirm RLS policies and permissions\n';
    content += 'Build Failures: Ensure required variables are set\n';
    
    return {
      name: 'environment-vars.txt',
      content: BundleExporter.sanitizeContent(content),
      description: 'Environment variable configuration with security notes (values redacted)'
    };
  }
  
  private static async generateApiIntegrations(): Promise<BundleFile> {
    let content = 'TEAM1 PORTAL - API INTEGRATIONS & RPC CALLS\n';
    content += '===========================================\n\n';
    content += 'Documentation of all API integrations, RPC calls, and\n';
    content += 'external service connections in the codebase.\n\n';
    
    content += 'SUPABASE INTEGRATION:\n';
    content += '---------------------\n';
    content += 'Client Configuration: src/integrations/supabase/client.ts\n';
    content += 'Type Definitions: src/integrations/supabase/types.ts (auto-generated)\n';
    content += 'Base URL: https://kjweuajrmyohatweqdts.supabase.co\n\n';
    
    content += 'AUTHENTICATION METHODS:\n';
    content += '-----------------------\n';
    content += 'supabase.auth.signInWithPassword() - Email/password login\n';
    content += 'supabase.auth.signUp() - User registration\n';
    content += 'supabase.auth.signOut() - User logout\n';
    content += 'supabase.auth.onAuthStateChange() - Auth state monitoring\n';
    content += 'supabase.auth.getUser() - Current user retrieval\n';
    content += 'supabase.auth.resetPasswordForEmail() - Password reset\n\n';
    
    content += 'DATABASE OPERATIONS:\n';
    content += '--------------------\n';
    content += 'Table Access Pattern:\n';
    content += '  supabase.from("[table]").select() - Data retrieval\n';
    content += '  supabase.from("[table]").insert() - Data insertion\n';
    content += '  supabase.from("[table]").update() - Data modification\n';
    content += '  supabase.from("[table]").delete() - Data deletion\n';
    content += '  supabase.from("[table]").upsert() - Insert or update\n\n';
    
    content += 'COMMON TABLE OPERATIONS:\n';
    content += '------------------------\n';
    content += 'Organizations:\n';
    content += '  - SELECT with membership filtering\n';
    content += '  - UPDATE organization settings\n';
    content += '  - Org-scoped data access\n\n';
    
    content += 'Profiles:\n';
    content += '  - SELECT user profiles within org\n';
    content += '  - UPDATE own profile data\n';
    content += '  - Search users by name/email\n\n';
    
    content += 'Customers:\n';
    content += '  - CRUD operations with org scoping\n';
    content += '  - Full-text search on customer data\n';
    content += '  - Customer project relationships\n\n';
    
    content += 'Projects:\n';
    content += '  - Project lifecycle management\n';
    content += '  - Status and priority updates\n';
    content += '  - Customer and work order relationships\n\n';
    
    content += 'Work Orders:\n';
    content += '  - Manufacturing order management\n';
    content += '  - Time tracking integration\n';
    content += '  - Capacity planning queries\n\n';
    
    content += 'REAL-TIME SUBSCRIPTIONS:\n';
    content += '------------------------\n';
    content += 'supabase.channel().on("postgres_changes", ...)\n';
    content += 'Use Cases:\n';
    content += '  - Live dashboard updates\n';
    content += '  - Real-time notifications\n';
    content += '  - Collaborative editing\n';
    content += '  - Status change monitoring\n\n';
    
    content += 'RPC FUNCTION CALLS:\n';
    content += '-------------------\n';
    content += 'supabase.rpc("function_name", parameters)\n\n';
    
    content += 'Security Functions:\n';
    content += '  is_user_admin() - Admin role check\n';
    content += '  get_user_org_id() - User organization lookup\n\n';
    
    content += 'Business Logic Functions:\n';
    content += '  [Custom RPC functions for complex operations]\n';
    content += '  [Stored procedures for data processing]\n';
    content += '  [Analytical functions for reporting]\n\n';
    
    content += 'EDGE FUNCTIONS:\n';
    content += '---------------\n';
    content += 'create-user: User creation with organization setup\n';
    content += '  Endpoint: /functions/v1/create-user\n';
    content += '  Purpose: Admin user creation workflow\n';
    content += '  Security: Service role authentication\n\n';
    
    content += 'invite-user: User invitation system\n';
    content += '  Endpoint: /functions/v1/invite-user\n';
    content += '  Purpose: Send user invitations via email\n';
    content += '  Integration: Email service (Resend)\n\n';
    
    content += 'ERROR HANDLING PATTERNS:\n';
    content += '------------------------\n';
    content += 'Try-catch blocks for all async operations\n';
    content += 'Toast notifications for user feedback\n';
    content += 'Graceful degradation for network failures\n';
    content += 'Retry mechanisms for transient errors\n';
    content += 'Detailed error logging for debugging\n\n';
    
    content += 'QUERY OPTIMIZATION:\n';
    content += '-------------------\n';
    content += 'Always include org_id in WHERE clauses\n';
    content += 'Use select() to limit returned columns\n';
    content += 'Implement pagination for large datasets\n';
    content += 'Utilize indexes for frequently queried columns\n';
    content += 'Cache frequently accessed data\n\n';
    
    content += 'REACT QUERY INTEGRATION:\n';
    content += '------------------------\n';
    content += 'Custom hooks for data management:\n';
    content += '  useCustomers() - Customer data management\n';
    content += '  useProjects() - Project data management\n';
    content += '  useUsers() - User management\n';
    content += '  useProfile() - User profile management\n';
    content += '  useSupabaseAuth() - Authentication state\n\n';
    
    content += 'Benefits:\n';
    content += '  - Automatic caching and background updates\n';
    content += '  - Optimistic updates for better UX\n';
    content += '  - Error state management\n';
    content += '  - Loading state handling\n\n';
    
    content += 'EXTERNAL INTEGRATIONS:\n';
    content += '----------------------\n';
    content += 'Email Service (Resend):\n';
    content += '  - Transactional emails\n';
    content += '  - User invitations\n';
    content += '  - Notification delivery\n';
    content += '  - Email templates\n\n';
    
    content += 'Development Tools (Lovable):\n';
    content += '  - Development platform integration\n';
    content += '  - Deployment automation\n';
    content += '  - Project synchronization\n\n';
    
    content += 'SECURITY CONSIDERATIONS:\n';
    content += '------------------------\n';
    content += 'RLS Policy Enforcement:\n';
    content += '  - All database access filtered by organization\n';
    content += '  - User role validation on sensitive operations\n';
    content += '  - Admin-only access to audit logs\n\n';
    
    content += 'API Key Management:\n';
    content += '  - Environment variable storage\n';
    content += '  - Regular key rotation\n';
    content += '  - Separate keys for different environments\n\n';
    
    content += 'MONITORING & ANALYTICS:\n';
    content += '-----------------------\n';
    content += 'API call logging and monitoring\n';
    content += 'Performance tracking for slow queries\n';
    content += 'Error rate monitoring and alerting\n';
    content += 'Usage analytics for optimization\n';
    
    return {
      name: 'api-integrations.txt',
      content: BundleExporter.sanitizeContent(content),
      description: 'Complete API integration documentation with Supabase, RPC calls, and external services'
    };
  }
  
  private static async generateMigrationsSchema(): Promise<BundleFile> {
    let content = 'TEAM1 PORTAL - MIGRATIONS & SCHEMA MANAGEMENT\n';
    content += '============================================\n\n';
    content += 'Database migration strategy and schema evolution patterns\n';
    content += 'used in the Team1 Portal project.\n\n';
    
    content += 'MIGRATION STRATEGY:\n';
    content += '-------------------\n';
    content += 'Platform: Supabase Database Migrations\n';
    content += 'Location: supabase/migrations/ (read-only in codebase)\n';
    content += 'Management: Via Supabase CLI and dashboard\n';
    content += 'Versioning: Timestamp-based migration files\n';
    content += 'Environment: Applied consistently across dev/staging/prod\n\n';
    
    content += 'SCHEMA EVOLUTION PATTERNS:\n';
    content += '--------------------------\n';
    content += 'Additive Changes:\n';
    content += '  - New tables and columns\n';
    content += '  - Additional indexes and constraints\n';
    content += '  - New functions and triggers\n';
    content += '  - Extended enum values\n\n';
    
    content += 'Backwards Compatible:\n';
    content += '  - Default values for new columns\n';
    content += '  - Nullable columns for optional data\n';
    content += '  - Gradual data migration patterns\n';
    content += '  - Deprecation warnings before removal\n\n';
    
    content += 'CORE SCHEMA COMPONENTS:\n';
    content += '-----------------------\n';
    content += 'Foundation Tables:\n';
    content += '  - organizations (tenant root)\n';
    content += '  - profiles (user data)\n';
    content += '  - memberships (user-org relationships)\n';
    content += '  - departments (organizational structure)\n\n';
    
    content += 'Business Tables:\n';
    content += '  - customers (CRM)\n';
    content += '  - projects (project management)\n';
    content += '  - work_orders (manufacturing)\n';
    content += '  - quotes (sales)\n';
    content += '  - shipments (logistics)\n';
    content += '  - time_entries (labor tracking)\n\n';
    
    content += 'System Tables:\n';
    content += '  - audit_log (change tracking)\n';
    content += '  - notifications (user notifications)\n';
    content += '  - messages (communications)\n';
    content += '  - documents (file management)\n';
    content += '  - labels (tagging system)\n\n';
    
    content += 'MIGRATION WORKFLOW:\n';
    content += '-------------------\n';
    content += '1. Schema Design: Plan changes with business requirements\n';
    content += '2. Migration Script: Create SQL migration file\n';
    content += '3. RLS Policies: Update security policies as needed\n';
    content += '4. Function Updates: Modify helper functions if required\n';
    content += '5. Type Generation: Update TypeScript types\n';
    content += '6. Application Updates: Modify code to use new schema\n';
    content += '7. Testing: Validate in development environment\n';
    content += '8. Deployment: Apply to staging then production\n\n';
    
    content += 'RLS POLICY PATTERNS:\n';
    content += '--------------------\n';
    content += 'Organization Scoping:\n';
    content += '  CREATE POLICY "table_org_access" ON table\n';
    content += '    FOR ALL USING (\n';
    content += '      EXISTS (\n';
    content += '        SELECT 1 FROM profiles p\n';
    content += '        WHERE p.id = auth.uid() \n';
    content += '          AND p.org_id = table.org_id\n';
    content += '      )\n';
    content += '    );\n\n';
    
    content += 'Admin-Only Access:\n';
    content += '  CREATE POLICY "table_admin_access" ON table\n';
    content += '    FOR ALL USING (\n';
    content += '      is_user_admin() AND \n';
    content += '      org_id = get_user_org_id()\n';
    content += '    );\n\n';
    
    content += 'Self-Service Access:\n';
    content += '  CREATE POLICY "profile_self_update" ON profiles\n';
    content += '    FOR UPDATE USING (id = auth.uid());\n\n';
    
    content += 'TRIGGER PATTERNS:\n';
    content += '-----------------\n';
    content += 'Automatic Timestamps:\n';
    content += '  CREATE TRIGGER update_table_updated_at\n';
    content += '    BEFORE UPDATE ON table\n';
    content += '    FOR EACH ROW\n';
    content += '    EXECUTE FUNCTION update_updated_at_column();\n\n';
    
    content += 'Audit Trail:\n';
    content += '  CREATE TRIGGER table_audit_trigger\n';
    content += '    AFTER INSERT OR UPDATE OR DELETE ON table\n';
    content += '    FOR EACH ROW\n';
    content += '    EXECUTE FUNCTION audit_trigger();\n\n';
    
    content += 'FUNCTION PATTERNS:\n';
    content += '------------------\n';
    content += 'Security Helper:\n';
    content += '  CREATE OR REPLACE FUNCTION is_user_admin()\n';
    content += '  RETURNS BOOLEAN AS $$\n';
    content += '    SELECT EXISTS (\n';
    content += '      SELECT 1 FROM memberships m\n';
    content += '      WHERE m.user_id = auth.uid()\n';
    content += '        AND m.role_bucket = \'admin\'\n';
    content += '        AND m.deleted_at IS NULL\n';
    content += '    );\n';
    content += '  $$ LANGUAGE SQL STABLE SECURITY DEFINER;\n\n';
    
    content += 'ENUM MANAGEMENT:\n';
    content += '----------------\n';
    content += 'Creating Enums:\n';
    content += '  CREATE TYPE status_enum AS ENUM (\n';
    content += '    \'draft\', \'active\', \'completed\', \'cancelled\'\n';
    content += '  );\n\n';
    
    content += 'Adding Values:\n';
    content += '  ALTER TYPE status_enum ADD VALUE \'suspended\';\n\n';
    
    content += 'INDEX STRATEGIES:\n';
    content += '-----------------\n';
    content += 'Tenant Isolation:\n';
    content += '  CREATE INDEX idx_table_org_id ON table(org_id);\n\n';
    
    content += 'Composite Indexes:\n';
    content += '  CREATE INDEX idx_table_org_status \n';
    content += '    ON table(org_id, status);\n\n';
    
    content += 'Full-Text Search:\n';
    content += '  CREATE INDEX idx_table_search \n';
    content += '    ON table USING GIN(search_vector);\n\n';
    
    content += 'DATA SEEDING:\n';
    content += '-------------\n';
    content += 'Default Organizations:\n';
    content += '  INSERT INTO organizations (name, slug) \n';
    content += '  VALUES (\'Demo Organization\', \'demo-org\');\n\n';
    
    content += 'System Labels:\n';
    content += '  INSERT INTO labels (name, scope, color)\n';
    content += '  VALUES (\'Priority\', \'global\', \'#FF0000\');\n\n';
    
    content += 'ROLLBACK STRATEGIES:\n';
    content += '--------------------\n';
    content += 'Schema Changes: Reversible migration scripts\n';
    content += 'Data Changes: Backup before major modifications\n';
    content += 'Function Changes: Version functions during transition\n';
    content += 'Emergency: Database restore from backup\n\n';
    
    content += 'MONITORING & VALIDATION:\n';
    content += '------------------------\n';
    content += 'Schema Validation:\n';
    content += '  - Constraint checking\n';
    content += '  - Referential integrity validation\n';
    content += '  - RLS policy testing\n\n';
    
    content += 'Performance Monitoring:\n';
    content += '  - Query performance tracking\n';
    content += '  - Index usage analysis\n';
    content += '  - Trigger execution monitoring\n\n';
    
    content += 'BEST PRACTICES:\n';
    content += '---------------\n';
    content += '1. Always test migrations in development first\n';
    content += '2. Use transactions for complex multi-step changes\n';
    content += '3. Maintain backwards compatibility during transitions\n';
    content += '4. Document all schema changes thoroughly\n';
    content += '5. Monitor performance impact of new indexes\n';
    content += '6. Keep migration scripts idempotent when possible\n';
    content += '7. Plan rollback procedures for each migration\n';
    
    return {
      name: 'migrations-schema.txt',
      content,
      description: 'Database migration strategy, schema evolution patterns, and management procedures'
    };
  }
  
  private static async generateWorkflowsAutomation(): Promise<BundleFile> {
    let content = 'TEAM1 PORTAL - WORKFLOWS & AUTOMATION\n';
    content += '=====================================\n\n';
    content += 'Documentation of GitHub Actions workflows and automation\n';
    content += 'scripts used in the Team1 Portal project.\n\n';
    
    content += 'GITHUB ACTIONS WORKFLOWS:\n';
    content += '-------------------------\n';
    content += 'Location: .github/workflows/\n';
    content += 'Active Workflows: docs.yml\n\n';
    
    content += 'DOCUMENTATION WORKFLOW (docs.yml):\n';
    content += '----------------------------------\n';
    content += 'Trigger: Push to main branch, manual dispatch\n';
    content += 'Purpose: Automated documentation generation\n';
    content += 'Runner: ubuntu-latest\n\n';
    
    content += 'Workflow Steps:\n';
    content += '1. Checkout repository code\n';
    content += '2. Setup Node.js environment\n';
    content += '3. Install project dependencies\n';
    content += '4. Run documentation generation scripts\n';
    content += '5. Deploy documentation to GitHub Pages\n\n';
    
    content += 'BUILD AUTOMATION SCRIPTS:\n';
    content += '-------------------------\n';
    content += 'Location: scripts/\n';
    content += 'Purpose: Extract project metadata for documentation\n\n';
    
    content += 'export-routes.mjs:\n';
    content += '  Purpose: Extract route definitions from router\n';
    content += '  Output: docs/data/routes.json\n';
    content += '  Usage: Documentation of application navigation\n\n';
    
    content += 'export-schema.mjs:\n';
    content += '  Purpose: Export database schema as SQL\n';
    content += '  Output: docs/data/schema.sql\n';
    content += '  Dependencies: DB_URL_READONLY environment variable\n';
    content += '  Tool: pg_dump with schema-only flag\n\n';
    
    content += 'export-rls.mjs:\n';
    content += '  Purpose: Export RLS policies as JSON\n';
    content += '  Output: docs/data/rls.json\n';
    content += '  Query: pg_policies system view\n';
    content += '  Format: Structured policy information\n\n';
    
    content += 'export-buildmeta.mjs:\n';
    content += '  Purpose: Generate build metadata\n';
    content += '  Output: docs/data/build.json\n';
    content += '  Content: Build timestamp, version, environment\n\n';
    
    content += 'write-index.mjs:\n';
    content += '  Purpose: Generate documentation index\n';
    content += '  Output: docs/index.html\n';
    content += '  Combines: All exported data into documentation site\n\n';
    
    content += 'design-guard.js:\n';
    content += '  Purpose: Design system validation\n';
    content += '  Function: Ensure consistent styling patterns\n';
    content += '  Rules: Validate color usage, component patterns\n\n';
    
    content += 'NPM SCRIPT AUTOMATION:\n';
    content += '----------------------\n';
    content += 'Package.json scripts for development workflow:\n\n';
    
    content += 'Development:\n';
    content += '  npm run dev - Start development server\n';
    content += '  npm run build - Production build\n';
    content += '  npm run build:dev - Development build\n';
    content += '  npm run preview - Preview built application\n';
    content += '  npm run lint - Code linting\n\n';
    
    content += 'Documentation:\n';
    content += '  npm run docs:prepare - Setup documentation directory\n';
    content += '  npm run docs:routes - Extract route definitions\n';
    content += '  npm run docs:schema - Export database schema\n';
    content += '  npm run docs:rls - Export RLS policies\n';
    content += '  npm run docs:buildmeta - Generate build metadata\n';
    content += '  npm run docs:index - Create documentation index\n';
    content += '  npm run docs:all - Run complete documentation build\n\n';
    
    content += 'CONTINUOUS INTEGRATION:\n';
    content += '-----------------------\n';
    content += 'Automated Testing:\n';
    content += '  - ESLint code quality checks\n';
    content += '  - TypeScript compilation validation\n';
    content += '  - Build process verification\n\n';
    
    content += 'Code Quality Gates:\n';
    content += '  - Linting must pass before merge\n';
    content += '  - Build must succeed on all targets\n';
    content += '  - Documentation must generate successfully\n\n';
    
    content += 'DEPLOYMENT AUTOMATION:\n';
    content += '----------------------\n';
    content += 'Lovable Platform Integration:\n';
    content += '  - Automatic deployment on code changes\n';
    content += '  - Environment-specific configurations\n';
    content += '  - Zero-downtime deployment strategy\n\n';
    
    content += 'Database Migrations:\n';
    content += '  - Supabase CLI integration\n';
    content += '  - Automatic schema synchronization\n';
    content += '  - Migration rollback capabilities\n\n';
    
    content += 'MONITORING & ALERTS:\n';
    content += '--------------------\n';
    content += 'Build Status Monitoring:\n';
    content += '  - GitHub Actions status badges\n';
    content += '  - Failure notifications via email/Slack\n';
    content += '  - Build performance tracking\n\n';
    
    content += 'Deployment Monitoring:\n';
    content += '  - Health checks after deployment\n';
    content += '  - Performance regression detection\n';
    content += '  - Error rate monitoring\n\n';
    
    content += 'DEVELOPMENT WORKFLOW:\n';
    content += '---------------------\n';
    content += 'Local Development:\n';
    content += '1. Clone repository\n';
    content += '2. Install dependencies (npm install)\n';
    content += '3. Setup environment variables\n';
    content += '4. Start development server (npm run dev)\n';
    content += '5. Make changes and test locally\n';
    content += '6. Run linting (npm run lint)\n';
    content += '7. Commit and push changes\n\n';
    
    content += 'Pull Request Workflow:\n';
    content += '1. Create feature branch\n';
    content += '2. Implement changes\n';
    content += '3. Run local tests and builds\n';
    content += '4. Create pull request\n';
    content += '5. Automated CI checks run\n';
    content += '6. Code review process\n';
    content += '7. Merge to main branch\n';
    content += '8. Automatic deployment triggers\n\n';
    
    content += 'SECURITY AUTOMATION:\n';
    content += '--------------------\n';
    content += 'Dependency Scanning:\n';
    content += '  - Automated vulnerability detection\n';
    content += '  - Security advisory notifications\n';
    content += '  - Dependency update automation\n\n';
    
    content += 'Secret Management:\n';
    content += '  - Environment variable validation\n';
    content += '  - Secret rotation reminders\n';
    content += '  - Access audit logging\n\n';
    
    content += 'MAINTENANCE AUTOMATION:\n';
    content += '-----------------------\n';
    content += 'Scheduled Tasks:\n';
    content += '  - Weekly dependency updates\n';
    content += '  - Monthly security scans\n';
    content += '  - Quarterly documentation reviews\n\n';
    
    content += 'Cleanup Automation:\n';
    content += '  - Old build artifact removal\n';
    content += '  - Log file rotation\n';
    content += '  - Temporary file cleanup\n\n';
    
    content += 'FUTURE AUTOMATION OPPORTUNITIES:\n';
    content += '--------------------------------\n';
    content += 'Testing Automation:\n';
    content += '  - Unit test automation\n';
    content += '  - Integration test suites\n';
    content += '  - End-to-end testing\n\n';
    
    content += 'Performance Automation:\n';
    content += '  - Bundle size monitoring\n';
    content += '  - Performance regression testing\n';
    content += '  - Load testing automation\n\n';
    
    content += 'Quality Automation:\n';
    content += '  - Code coverage reporting\n';
    content += '  - Technical debt tracking\n';
    content += '  - Code complexity analysis\n';
    
    return {
      name: 'workflows-automation.txt',
      content,
      description: 'Complete documentation of GitHub Actions workflows, build scripts, and automation processes'
    };
  }
  
  private static generateReadme(): string {
    return `# Team1 Portal - GitHub Repository Bundle

This bundle contains comprehensive documentation of the Team1 Portal GitHub repository structure, configuration, and development workflows for LLM analysis and code review.

## Bundle Contents

### project-tree.txt
Complete project file structure with descriptions of key directories and files. Essential for understanding the codebase organization and architecture.

### package-config.txt
Complete package.json analysis with dependencies, scripts, and build configuration. Shows all libraries used and their purposes.

### routing-config.txt
Complete routing configuration with authentication guards and role-based access. Documents the entire application navigation structure.

### environment-vars.txt
Environment variable configuration with security notes (values redacted). Shows required configuration for different environments.

### api-integrations.txt
Complete API integration documentation with Supabase, RPC calls, and external services. Essential for understanding data flow.

### migrations-schema.txt
Database migration strategy, schema evolution patterns, and management procedures. Shows how database changes are managed.

### workflows-automation.txt
Complete documentation of GitHub Actions workflows, build scripts, and automation processes. Shows CI/CD and development workflow.

## How to Use This Bundle

### For Code Architecture Review:
1. Start with project-tree.txt to understand the codebase structure
2. Review package-config.txt to understand the technology stack
3. Study routing-config.txt to understand user flow and navigation
4. Check api-integrations.txt to understand data integration patterns
5. Review workflows-automation.txt to understand development processes

### For Development Setup:
1. Follow project-tree.txt to understand where files are located
2. Use package-config.txt to understand dependencies and scripts
3. Reference environment-vars.txt for required configuration
4. Check workflows-automation.txt for development workflow
5. Study migrations-schema.txt for database setup

### For Code Maintenance:
1. Use project-tree.txt to locate relevant files
2. Check package-config.txt for dependency management
3. Review routing-config.txt when adding new pages
4. Reference api-integrations.txt when working with data
5. Follow workflows-automation.txt for deployment procedures

## Technology Stack Summary

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **UI Components**: Radix UI + Shadcn/ui component library
- **Routing**: React Router v7 with lazy loading
- **State**: Zustand + React Query for data management
- **Backend**: Supabase (PostgreSQL + Auth + Edge Functions)
- **Build**: Vite with SWC compiler for fast builds
- **Styling**: Tailwind CSS with custom design system
- **Development**: ESLint + TypeScript strict mode
- **Deployment**: Lovable platform with automated CI/CD

## Key Architecture Features

- **Route-based Code Splitting**: Lazy loading for all pages
- **Role-based Access Control**: Guards for authentication and permissions
- **Multi-tenant Architecture**: Organization-scoped data isolation
- **Real-time Updates**: Supabase subscriptions for live data
- **Type Safety**: Full TypeScript coverage with generated types
- **Design System**: Consistent styling with Tailwind + custom tokens
- **Export/Import**: Comprehensive data export capabilities
- **Development Tools**: Built-in debugging and testing utilities

## Security Features

- **Authentication**: Supabase Auth with JWT tokens
- **Authorization**: Row Level Security (RLS) policies
- **Data Isolation**: Organization-based tenant separation
- **Environment Security**: Proper secret management
- **Code Security**: ESLint security rules and dependency scanning

## Development Workflow

1. **Local Development**: npm run dev with hot reload
2. **Code Quality**: ESLint + TypeScript validation
3. **Build Process**: Vite with optimization and bundling
4. **Testing**: Manual testing with built-in dev tools
5. **Deployment**: Automatic via Lovable platform
6. **Monitoring**: Build status and error tracking

## Performance Optimizations

- **Lazy Loading**: Route-based code splitting
- **Bundle Optimization**: Tree shaking and minification
- **Image Optimization**: Automatic image processing
- **Caching**: React Query for data caching
- **Database**: Optimized queries and indexing

## Compliance & Governance

- **Data Governance**: Audit trails and soft delete patterns
- **Privacy**: GDPR-compliant data handling
- **Security**: SOX-compliant access controls
- **Documentation**: Automated documentation generation
- **Backup**: Database backup and recovery procedures

Generated: ${new Date().toISOString()}
Bundle Type: GitHub Repository Bundle
Version: 1.0.0
Generator: Team1 Portal Export System
`;
  }
}