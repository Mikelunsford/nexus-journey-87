import { supabase } from "@/integrations/supabase/client";
import { BundleExporter, BundleFile } from "./bundleExporter";

export class AppBundleExporter {
  static async exportAppBundle(): Promise<void> {
    const files: BundleFile[] = [];
    
    // Generate all bundle files
    files.push(await this.generateAppStructure());
    files.push(await this.generateUIElements());
    files.push(await this.generateColorPalette());
    files.push(await this.generatePagesContent());
    files.push(await this.generateApiEndpoints());
    files.push(await this.generateBrandTokens());
    files.push(await this.generateLiveDataSample());
    
    const readme = this.generateReadme();
    
    await BundleExporter.createBundle({
      bundleName: 'app-bundle',
      files,
      readme,
      includeMetadata: true
    });
  }
  
  private static async generateAppStructure(): Promise<BundleFile> {
    const routes = [
      { path: '/', name: 'Authentication', description: 'Login and signup page' },
      { path: '/dashboard', name: 'Dashboard', description: 'Main application dashboard with KPIs' },
      { path: '/dashboard/projects', name: 'Projects', description: 'Project management interface' },
      { path: '/dashboard/tasks', name: 'Tasks', description: 'Task tracking and management' },
      { path: '/dashboard/employees', name: 'Employees', description: 'Employee directory and management' },
      { path: '/dashboard/customers', name: 'Customers', description: 'Customer relationship management' },
      { path: '/dashboard/production', name: 'Production', description: 'Work orders and manufacturing' },
      { path: '/dashboard/shipping', name: 'Shipping', description: 'Shipment tracking and logistics' },
      { path: '/dashboard/documents', name: 'Documents', description: 'Document management system' },
      { path: '/dashboard/carriers', name: 'Carriers', description: 'Carrier and logistics management' },
      { path: '/dashboard/accounting', name: 'Accounting', description: 'Financial management and invoicing' },
      { path: '/dashboard/analytics', name: 'Analytics', description: 'Business intelligence and reporting' },
      { path: '/dashboard/messages', name: 'Messages', description: 'Internal communication system' },
      { path: '/dashboard/admin/users', name: 'User Management', description: 'Admin user management interface' },
      { path: '/dashboard/admin/organizations', name: 'Organizations', description: 'Organization management for admins' },
      { path: '/dashboard/settings', name: 'Settings', description: 'User preferences and system configuration' },
      { path: '/dev/bridge', name: 'Bridge Panel', description: 'Developer tools and event simulation' }
    ];
    
    let content = 'TEAM1 PORTAL - APPLICATION STRUCTURE\n';
    content += '=====================================\n\n';
    content += 'This document outlines the complete navigation structure and page hierarchy\n';
    content += 'of the Team1 Portal application.\n\n';
    content += 'MAIN NAVIGATION ROUTES:\n';
    content += '-----------------------\n\n';
    
    routes.forEach(route => {
      content += `${route.path}\n`;
      content += `  Name: ${route.name}\n`;
      content += `  Description: ${route.description}\n\n`;
    });
    
    content += '\nAPPLICATION FLOW:\n';
    content += '-----------------\n';
    content += '1. Users start at authentication page\n';
    content += '2. After login, redirected to dashboard with role-based access\n';
    content += '3. Left sidebar provides navigation to all modules\n';
    content += '4. Each module has sub-pages for CRUD operations\n';
    content += '5. Admin users have access to additional user/org management\n';
    content += '6. All pages are protected by authentication and role-based security\n\n';
    
    content += 'SECURITY MODEL:\n';
    content += '---------------\n';
    content += '- Organization-based tenant isolation\n';
    content += '- Role-based access control (admin, operational, external)\n';
    content += '- Row-level security policies on all data\n';
    content += '- Protected routes with authentication guards\n';
    
    return {
      name: 'app-structure.txt',
      content: BundleExporter.sanitizeContent(content),
      description: 'Complete application route structure and navigation hierarchy'
    };
  }
  
  private static async generateUIElements(): Promise<BundleFile> {
    let content = 'TEAM1 PORTAL - UI COMPONENT CATALOG\n';
    content += '===================================\n\n';
    content += 'This document catalogs all UI components and their variants used\n';
    content += 'throughout the Team1 Portal application.\n\n';
    
    content += 'BUTTON VARIANTS:\n';
    content += '----------------\n';
    content += '- primary: Main action buttons (Team1 red background)\n';
    content += '- secondary: Secondary actions (Team1 navy background)\n';
    content += '- outline: Border-only buttons for less prominent actions\n';
    content += '- ghost: Minimal buttons for navigation\n';
    content += '- danger: Destructive actions (red theme)\n';
    content += '- link: Text-only link-style buttons\n\n';
    
    content += 'LAYOUT COMPONENTS:\n';
    content += '------------------\n';
    content += '- AppShell: Main application wrapper with sidebar and topbar\n';
    content += '- Sidebar: Left navigation with collapsible menu\n';
    content += '- Topbar: Top header with user profile and theme toggle\n';
    content += '- PageSection: Standard page layout with title and content\n\n';
    
    content += 'DATA DISPLAY:\n';
    content += '-------------\n';
    content += '- StatusPill: Colored status indicators with text\n';
    content += '- StatusIndicator: Simple dot-style status indicators\n';
    content += '- StatusBar: Progress bars with Team1 blue fill\n';
    content += '- QuickActionsGrid: Grid layout for action cards\n';
    content += '- QuickActionsList: List layout for quick actions\n';
    content += '- EmptyState: Placeholder for empty data states\n\n';
    
    content += 'FORM COMPONENTS:\n';
    content += '----------------\n';
    content += '- Input: Text input fields with Team1 styling\n';
    content += '- Select: Dropdown selection components\n';
    content += '- Textarea: Multi-line text input\n';
    content += '- Checkbox: Checkbox inputs with custom styling\n';
    content += '- SearchInput: Specialized search input with icon\n\n';
    
    content += 'INTERACTIVE COMPONENTS:\n';
    content += '------------------------\n';
    content += '- Dialog: Modal dialogs for forms and confirmations\n';
    content += '- ColumnSelector: Table column visibility controls\n';
    content += '- FilterBar: Advanced filtering interface\n';
    content += '- ExportDialog: Data export options modal\n';
    content += '- ThemeToggle: Light/dark mode switcher\n\n';
    
    content += 'SPECIALIZED COMPONENTS:\n';
    content += '-----------------------\n';
    content += '- ThroughputChart: Performance visualization charts\n';
    content += '- PathCard: Visual path/route display cards\n';
    content += '- LabelsTable: Tag/label management interface\n';
    content += '- SavedViews: View management for filtered data\n';
    
    return {
      name: 'ui-elements.txt',
      content,
      description: 'Comprehensive catalog of UI components and their usage patterns'
    };
  }
  
  private static async generateColorPalette(): Promise<BundleFile> {
    let content = 'TEAM1 PORTAL - DESIGN SYSTEM & COLOR PALETTE\n';
    content += '============================================\n\n';
    content += 'Complete design system documentation including colors, typography,\n';
    content += 'and visual styling tokens.\n\n';
    
    content += 'BRAND COLORS (HSL):\n';
    content += '-------------------\n';
    content += 'Primary Brand Navy: hsl(217, 73%, 14%) - #0B1936\n';
    content += 'Secondary Navy: hsl(215, 68%, 19%) - #12224D\n';
    content += 'Brand Red: hsl(0, 74%, 53%) - #E02525\n';
    content += 'Brand Red Dark: hsl(0, 72%, 41%) - #B31D1D\n';
    content += 'Brand Blue: hsl(211, 93%, 56%) - #2B8AF7\n';
    content += 'Brand Gray: hsl(220, 14%, 46%) - #6B7280\n';
    content += 'Brand Ink: hsl(218, 91%, 9%) - #0F172A\n';
    content += 'Brand Paper: hsl(210, 40%, 98%) - #F8FAFC\n\n';
    
    content += 'SURFACE COLORS:\n';
    content += '---------------\n';
    content += 'Surface 0 (White): hsl(0, 0%, 100%) - #FFFFFF\n';
    content += 'Surface 1 (Light): hsl(216, 41%, 97%) - #F5F7FB\n';
    content += 'Surface 2 (Border): hsl(215, 40%, 93%) - #E9EEF8\n\n';
    
    content += 'STATUS COLORS:\n';
    content += '--------------\n';
    content += 'Success/OK: hsl(142, 71%, 45%) - #16A34A\n';
    content += 'Warning: hsl(38, 92%, 50%) - #F59E0B\n';
    content += 'Info: hsl(199, 89%, 48%) - #0284C7\n';
    content += 'Error/Danger: hsl(0, 84%, 60%) - #DC2626\n\n';
    
    content += 'DARK MODE SURFACES:\n';
    content += '-------------------\n';
    content += 'Dark Surface 0: hsl(217, 91%, 7%) - #0B1220\n';
    content += 'Dark Surface 1: hsl(215, 67%, 12%) - #111A2E\n';
    content += 'Dark Surface 2: hsl(214, 57%, 20%) - #1B2744\n\n';
    
    content += 'GRADIENTS:\n';
    content += '----------\n';
    content += 'Hero Gradient: linear-gradient(135deg, brand-navy, brand-navy2)\n';
    content += 'Glass Gradient: linear-gradient(135deg, white/10%, white/5%)\n';
    content += 'Red Gradient: linear-gradient(135deg, brand-red, brand-red-dark)\n\n';
    
    content += 'TYPOGRAPHY:\n';
    content += '-----------\n';
    content += 'Primary Font: Inter (300, 400, 500, 600, 700 weights)\n';
    content += 'Font Loading: Google Fonts with display=swap optimization\n\n';
    
    content += 'SHADOWS & EFFECTS:\n';
    content += '------------------\n';
    content += 'Glass Shadow: 0 8px 32px rgba(11, 25, 54, 0.15)\n';
    content += 'Red Glow: 0 0 30px rgba(224, 37, 37, 0.3)\n';
    content += 'Backdrop Blur: 12px blur with glass effects\n\n';
    
    content += 'COMPONENT STYLING PATTERNS:\n';
    content += '----------------------------\n';
    content += '- All colors use HSL format for better control\n';
    content += '- Consistent border radius: 0.5rem base, larger for cards\n';
    content += '- Glass morphism effects in dark mode\n';
    content += '- Team1 red for primary actions, navy for secondary\n';
    content += '- Semantic color tokens for consistency\n';
    content += '- Responsive design with mobile-first approach\n';
    
    return {
      name: 'color-palette.txt',
      content,
      description: 'Complete design system documentation with colors, typography, and styling patterns'
    };
  }
  
  private static async generatePagesContent(): Promise<BundleFile> {
    let content = 'TEAM1 PORTAL - PAGE CONTENT & TITLES\n';
    content += '====================================\n\n';
    content += 'This document outlines the content structure, titles, and key\n';
    content += 'information displayed on each page of the application.\n\n';
    
    const pages = [
      {
        path: '/',
        title: 'Team1 Portal - Login',
        content: 'Authentication page with login/signup forms, Team1 branding, and secure access'
      },
      {
        path: '/dashboard',
        title: 'Dashboard - Team1 Portal',
        content: 'Main dashboard with KPI cards, recent activity feed, quick actions, and performance metrics'
      },
      {
        path: '/dashboard/projects',
        title: 'Projects - Team1 Portal',
        content: 'Project management interface with project cards, status tracking, and timeline views'
      },
      {
        path: '/dashboard/customers',
        title: 'Customers - Team1 Portal', 
        content: 'Customer relationship management with contact details, project history, and communication logs'
      },
      {
        path: '/dashboard/production',
        title: 'Production - Team1 Portal',
        content: 'Manufacturing and work order management with capacity planning and quality tracking'
      },
      {
        path: '/dashboard/shipping',
        title: 'Shipping - Team1 Portal',
        content: 'Logistics and shipment tracking with carrier management and delivery status'
      },
      {
        path: '/dashboard/accounting',
        title: 'Accounting - Team1 Portal',
        content: 'Financial management with invoicing, payment tracking, and financial reporting'
      },
      {
        path: '/dashboard/analytics',
        title: 'Analytics - Team1 Portal',
        content: 'Business intelligence with charts, reports, and data visualization'
      },
      {
        path: '/dashboard/admin/users',
        title: 'User Management - Team1 Portal',
        content: 'Admin interface for user management, role assignments, and access control'
      }
    ];
    
    pages.forEach(page => {
      content += `PAGE: ${page.path}\n`;
      content += `Title: ${page.title}\n`;
      content += `Content: ${page.content}\n\n`;
    });
    
    content += 'COMMON UI ELEMENTS:\n';
    content += '-------------------\n';
    content += '- Page titles use consistent hierarchy\n';
    content += '- Breadcrumb navigation on detail pages\n';
    content += '- Search and filter controls on list pages\n';
    content += '- Quick action buttons for common tasks\n';
    content += '- Status indicators and progress tracking\n';
    content += '- Export and bulk operation tools\n\n';
    
    content += 'BRANDING ELEMENTS:\n';
    content += '------------------\n';
    content += '- Team1 logo prominently displayed\n';
    content += '- Consistent color scheme throughout\n';
    content += '- Team1 red for primary actions\n';
    content += '- Team1 navy for headers and navigation\n';
    content += '- Professional typography with Inter font\n';
    
    return {
      name: 'pages-content.txt',
      content,
      description: 'Page titles, content descriptions, and UI element catalog for all application pages'
    };
  }
  
  private static async generateApiEndpoints(): Promise<BundleFile> {
    let content = 'TEAM1 PORTAL - API ENDPOINTS & INTEGRATION PATTERNS\n';
    content += '===================================================\n\n';
    content += 'This document outlines the API integration patterns and data\n';
    content += 'access methods used throughout the application.\n\n';
    
    content += 'SUPABASE INTEGRATION:\n';
    content += '---------------------\n';
    content += 'Base URL: https://kjweuajrmyohatweqdts.supabase.co\n';
    content += 'Authentication: JWT-based with Supabase Auth\n';
    content += 'Security: Row Level Security (RLS) policies\n\n';
    
    content += 'MAIN DATA TABLES:\n';
    content += '-----------------\n';
    content += 'organizations - Multi-tenant organization data\n';
    content += 'profiles - User profile information\n';
    content += 'customers - Customer relationship data\n';
    content += 'projects - Project management records\n';
    content += 'work_orders - Production work orders\n';
    content += 'shipments - Logistics and delivery tracking\n';
    content += 'time_entries - Time tracking and labor records\n';
    content += 'documents - File and document management\n';
    content += 'messages - Internal communication system\n';
    content += 'notifications - User notification system\n\n';
    
    content += 'COMMON QUERY PATTERNS:\n';
    content += '----------------------\n';
    content += 'SELECT with org_id filtering for tenant isolation\n';
    content += 'JOIN operations across related entities\n';
    content += 'Real-time subscriptions for live updates\n';
    content += 'Pagination with limit/offset for large datasets\n';
    content += 'Search using full-text search vectors\n\n';
    
    content += 'AUTHENTICATION FLOW:\n';
    content += '--------------------\n';
    content += '1. User logs in via Supabase Auth\n';
    content += '2. JWT token stored in session\n';
    content += '3. RLS policies enforce data access\n';
    content += '4. Organization membership determines data scope\n';
    content += '5. Role-based permissions control actions\n\n';
    
    content += 'REAL-TIME FEATURES:\n';
    content += '-------------------\n';
    content += 'Live updates for project status changes\n';
    content += 'Real-time notifications for user actions\n';
    content += 'Collaborative editing with conflict resolution\n';
    content += 'Live dashboard metrics and KPI updates\n\n';
    
    content += 'ERROR HANDLING:\n';
    content += '---------------\n';
    content += 'Graceful degradation for network issues\n';
    content += 'User-friendly error messages\n';
    content += 'Retry mechanisms for transient failures\n';
    content += 'Offline capability for critical functions\n';
    
    return {
      name: 'api-endpoints.txt',
      content: BundleExporter.sanitizeContent(content),
      description: 'API integration patterns, endpoints, and data access methods'
    };
  }
  
  private static async generateBrandTokens(): Promise<BundleFile> {
    let content = 'TEAM1 PORTAL - BRAND TOKENS & VISUAL IDENTITY\n';
    content += '=============================================\n\n';
    content += 'Complete brand identity system including logos, fonts,\n';
    content += 'and visual styling guidelines.\n\n';
    
    content += 'LOGO ASSETS:\n';
    content += '------------\n';
    content += 'Primary Logo: /src/assets/team1-logo.png\n';
    content += 'Alternative Logo: /src/assets/t1-logo.png\n';
    content += 'Logo Usage: Header navigation, login page, document headers\n';
    content += 'Logo Effects: Drop shadow with white glow in dark mode\n\n';
    
    content += 'TYPOGRAPHY SYSTEM:\n';
    content += '------------------\n';
    content += 'Primary Font: Inter\n';
    content += 'Font Source: Google Fonts (optimized loading)\n';
    content += 'Font Weights: 300 (Light), 400 (Regular), 500 (Medium), 600 (Semibold), 700 (Bold)\n';
    content += 'Font Display: swap (for performance)\n\n';
    
    content += 'TEXT HIERARCHY:\n';
    content += '---------------\n';
    content += 'H1: 2.25rem, font-weight 700, Team1 navy color\n';
    content += 'H2: 1.875rem, font-weight 600, Team1 navy color\n';
    content += 'H3: 1.5rem, font-weight 600, Team1 ink color\n';
    content += 'Body: 1rem, font-weight 400, Team1 ink color\n';
    content += 'Small: 0.875rem, font-weight 400, Team1 gray color\n\n';
    
    content += 'BRAND COLOR APPLICATIONS:\n';
    content += '-------------------------\n';
    content += 'Team1 Red (#E02525):\n';
    content += '  - Primary action buttons\n';
    content += '  - Error states and alerts\n';
    content += '  - Important status indicators\n';
    content += '  - Call-to-action elements\n\n';
    
    content += 'Team1 Navy (#0B1936):\n';
    content += '  - Headers and navigation\n';
    content += '  - Secondary action buttons\n';
    content += '  - Professional text elements\n';
    content += '  - Sidebar backgrounds\n\n';
    
    content += 'Team1 Blue (#2B8AF7):\n';
    content += '  - Progress indicators\n';
    content += '  - Link colors\n';
    content += '  - Information highlights\n';
    content += '  - Interactive elements\n\n';
    
    content += 'VISUAL EFFECTS:\n';
    content += '---------------\n';
    content += 'Glass Morphism: Backdrop blur with subtle transparency\n';
    content += 'Shadow System: Multiple shadow layers for depth\n';
    content += 'Gradient Usage: Subtle gradients for premium feel\n';
    content += 'Border Radius: Consistent rounded corners (0.5rem base)\n\n';
    
    content += 'ICONOGRAPHY:\n';
    content += '------------\n';
    content += 'Icon Library: Lucide React\n';
    content += 'Icon Style: Outlined, consistent stroke width\n';
    content += 'Icon Sizes: 16px, 20px, 24px standard sizes\n';
    content += 'Icon Colors: Inherit from text color for consistency\n\n';
    
    content += 'SPACING SYSTEM:\n';
    content += '---------------\n';
    content += 'Base Unit: 0.25rem (4px)\n';
    content += 'Common Spacings: 0.5rem, 1rem, 1.5rem, 2rem, 3rem, 4rem\n';
    content += 'Layout Margins: Consistent 1rem mobile, 2rem desktop\n';
    content += 'Component Padding: 0.75rem standard, 1rem for buttons\n';
    
    return {
      name: 'brand-tokens.txt',
      content,
      description: 'Complete brand identity system with logos, typography, colors, and visual guidelines'
    };
  }
  
  private static async generateLiveDataSample(): Promise<BundleFile> {
    let content = 'TEAM1 PORTAL - LIVE DATA SAMPLE\n';
    content += '===============================\n\n';
    content += 'Sanitized sample of current application data for context\n';
    content += 'and LLM analysis. All sensitive information has been redacted.\n\n';
    
    try {
      // Fetch sample data from various tables
      const { data: orgs } = await supabase.from('organizations').select('id, name, slug, created_at').limit(5);
      const { data: profiles } = await supabase.from('profiles').select('id, name, email, created_at').limit(5);
      const { data: projects } = await supabase.from('projects').select('id, title, status, priority, created_at').limit(5);
      const { data: customers } = await supabase.from('customers').select('id, name, email, created_at').limit(5);
      
      content += 'ORGANIZATIONS SAMPLE:\n';
      content += '---------------------\n';
      if (orgs && orgs.length > 0) {
        orgs.forEach(org => {
          content += `ID: ${org.id}\n`;
          content += `Name: ${org.name}\n`;
          content += `Slug: ${org.slug}\n`;
          content += `Created: ${org.created_at}\n\n`;
        });
      } else {
        content += 'No organization data available\n\n';
      }
      
      content += 'PROFILES SAMPLE:\n';
      content += '----------------\n';
      if (profiles && profiles.length > 0) {
        profiles.forEach(profile => {
          content += `ID: ${profile.id}\n`;
          content += `Name: ${profile.name || '[NOT_SET]'}\n`;
          content += `Email: [EMAIL_REDACTED]\n`;
          content += `Created: ${profile.created_at}\n\n`;
        });
      } else {
        content += 'No profile data available\n\n';
      }
      
      content += 'PROJECTS SAMPLE:\n';
      content += '----------------\n';
      if (projects && projects.length > 0) {
        projects.forEach(project => {
          content += `ID: ${project.id}\n`;
          content += `Title: ${project.title}\n`;
          content += `Status: ${project.status}\n`;
          content += `Priority: ${project.priority}\n`;
          content += `Created: ${project.created_at}\n\n`;
        });
      } else {
        content += 'No project data available\n\n';
      }
      
      content += 'CUSTOMERS SAMPLE:\n';
      content += '-----------------\n';
      if (customers && customers.length > 0) {
        customers.forEach(customer => {
          content += `ID: ${customer.id}\n`;
          content += `Name: ${customer.name}\n`;
          content += `Email: [EMAIL_REDACTED]\n`;
          content += `Created: ${customer.created_at}\n\n`;
        });
      } else {
        content += 'No customer data available\n\n';
      }
      
    } catch (error) {
      content += 'ERROR: Unable to fetch live data sample\n';
      content += 'This may be due to authentication or database access issues.\n\n';
    }
    
    content += 'DATA PATTERNS:\n';
    content += '--------------\n';
    content += 'All records use UUID primary keys\n';
    content += 'Timestamps in ISO 8601 format\n';
    content += 'Multi-tenant architecture with org_id references\n';
    content += 'Soft delete patterns with deleted_at columns\n';
    content += 'Version tracking with version integers\n';
    content += 'Audit trails with created_by/updated_by references\n';
    content += 'JSONB metadata columns for flexible data storage\n';
    
    return {
      name: 'live-data-sample.txt',
      content: BundleExporter.sanitizeContent(content),
      description: 'Sanitized sample of current application data showing structure and patterns'
    };
  }
  
  private static generateReadme(): string {
    return `# Team1 Portal - Application Bundle

This bundle contains a comprehensive snapshot of the Team1 Portal application structure, UI components, and live data for LLM analysis and code review.

## Bundle Contents

### app-structure.txt
Complete application route structure and navigation hierarchy. Shows how users move through the application and what functionality is available at each level.

### ui-elements.txt
Comprehensive catalog of UI components and their usage patterns. Documents all reusable components, their variants, and styling approaches.

### color-palette.txt
Complete design system documentation with colors, typography, and styling patterns. Includes HSL color values, gradients, and visual effects used throughout the application.

### pages-content.txt
Page titles, content descriptions, and UI element catalog for all application pages. Shows what users see and interact with on each page.

### api-endpoints.txt
API integration patterns, endpoints, and data access methods. Documents how the application communicates with the Supabase backend.

### brand-tokens.txt
Complete brand identity system with logos, typography, colors, and visual guidelines. Shows how Team1 branding is implemented consistently.

### live-data-sample.txt
Sanitized sample of current application data showing structure and patterns. Provides context for understanding data relationships and formats.

## How to Use This Bundle

### For LLM Analysis:
1. Start with app-structure.txt to understand the application flow
2. Review ui-elements.txt to understand component patterns
3. Use color-palette.txt for styling and design decisions
4. Reference api-endpoints.txt for data integration patterns
5. Check live-data-sample.txt for current data context

### For Code Review:
1. Understand the navigation structure from app-structure.txt
2. Review component reusability patterns in ui-elements.txt
3. Verify brand consistency using brand-tokens.txt
4. Analyze data access patterns in api-endpoints.txt
5. Check data integrity using live-data-sample.txt

### For Development:
- Use this bundle as a reference for maintaining consistency
- Follow the established patterns documented in each file
- Ensure new features align with the existing structure
- Reference the design system for styling new components

## Security Notes

All sensitive information including passwords, API keys, tokens, email addresses, and personal identifiable information has been redacted from this bundle. The data is safe to share with LLMs and external code reviewers.

## Generation Info

Generated: ${new Date().toISOString()}
Bundle Type: Application Structure Bundle
Version: 1.0.0
Generator: Team1 Portal Export System
`;
  }
}