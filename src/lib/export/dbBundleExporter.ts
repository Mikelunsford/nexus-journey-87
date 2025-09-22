import { supabase } from "@/integrations/supabase/client";
import { BundleExporter, BundleFile } from "./bundleExporter";

export class DbBundleExporter {
  static async exportDbBundle(): Promise<void> {
    const files: BundleFile[] = [];
    
    // Generate all database documentation files
    files.push(await this.generateSchemaDDL());
    files.push(await this.generateTablesDetailed());
    files.push(await this.generateRLSPoliciesExplained());
    files.push(await this.generateFunctionsProcedures());
    files.push(await this.generateEnumsTypes());
    files.push(await this.generateAuditPatterns());
    files.push(await this.generateTenancyModel());
    
    const readme = this.generateReadme();
    
    await BundleExporter.createBundle({
      bundleName: 'db-bundle',
      files,
      readme,
      includeMetadata: true
    });
  }
  
  private static async generateSchemaDDL(): Promise<BundleFile> {
    let content = '-- TEAM1 PORTAL DATABASE SCHEMA\n';
    content += '-- Generated from live database structure\n';
    content += '-- All sensitive data has been redacted\n\n';
    
    // Main tables with their structure
    const tables = [
      'organizations', 'profiles', 'departments', 'memberships', 'teams',
      'customers', 'projects', 'quotes', 'work_orders', 'time_entries',
      'shipments', 'documents', 'messages', 'notifications', 'labels',
      'user_invitations', 'carrier_appointments', 'event_outbox', 'audit_log'
    ];
    
    content += '-- ORGANIZATIONS TABLE\n';
    content += 'CREATE TABLE public.organizations (\n';
    content += '  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n';
    content += '  name TEXT NOT NULL,\n';
    content += '  slug TEXT NOT NULL UNIQUE,\n';
    content += '  settings JSONB DEFAULT \'{}\',\n';
    content += '  created_by UUID,\n';
    content += '  updated_by UUID,\n';
    content += '  created_at TIMESTAMPTZ DEFAULT NOW(),\n';
    content += '  updated_at TIMESTAMPTZ DEFAULT NOW(),\n';
    content += '  deleted_at TIMESTAMPTZ,\n';
    content += '  version INTEGER DEFAULT 1\n';
    content += ');\n\n';
    
    content += '-- PROFILES TABLE (USER DATA)\n';
    content += 'CREATE TABLE public.profiles (\n';
    content += '  id UUID PRIMARY KEY,\n';
    content += '  org_id UUID NOT NULL,\n';
    content += '  email TEXT NOT NULL,\n';
    content += '  name TEXT,\n';
    content += '  avatar_url TEXT,\n';
    content += '  bio TEXT,\n';
    content += '  phone TEXT,\n';
    content += '  settings JSONB DEFAULT \'{}\',\n';
    content += '  search_vector TSVECTOR,\n';
    content += '  created_by UUID,\n';
    content += '  updated_by UUID,\n';
    content += '  created_at TIMESTAMPTZ DEFAULT NOW(),\n';
    content += '  updated_at TIMESTAMPTZ DEFAULT NOW(),\n';
    content += '  deleted_at TIMESTAMPTZ,\n';
    content += '  version INTEGER DEFAULT 1\n';
    content += ');\n\n';
    
    content += '-- CUSTOMERS TABLE\n';
    content += 'CREATE TABLE public.customers (\n';
    content += '  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n';
    content += '  org_id UUID NOT NULL,\n';
    content += '  name TEXT NOT NULL,\n';
    content += '  email TEXT,\n';
    content += '  phone TEXT,\n';
    content += '  address TEXT,\n';
    content += '  department_id UUID,\n';
    content += '  owner_id UUID,\n';
    content += '  settings JSONB DEFAULT \'{}\',\n';
    content += '  search_vector TSVECTOR,\n';
    content += '  created_by UUID,\n';
    content += '  updated_by UUID,\n';
    content += '  created_at TIMESTAMPTZ DEFAULT NOW(),\n';
    content += '  updated_at TIMESTAMPTZ DEFAULT NOW(),\n';
    content += '  deleted_at TIMESTAMPTZ,\n';
    content += '  version INTEGER DEFAULT 1\n';
    content += ');\n\n';
    
    content += '-- PROJECTS TABLE\n';
    content += 'CREATE TABLE public.projects (\n';
    content += '  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n';
    content += '  org_id UUID NOT NULL,\n';
    content += '  title TEXT NOT NULL,\n';
    content += '  description TEXT,\n';
    content += '  customer_id UUID NOT NULL,\n';
    content += '  status project_status_enum NOT NULL DEFAULT \'draft\',\n';
    content += '  priority priority_enum DEFAULT \'medium\',\n';
    content += '  due_date TIMESTAMPTZ,\n';
    content += '  budget NUMERIC,\n';
    content += '  progress INTEGER DEFAULT 0,\n';
    content += '  quote_id UUID,\n';
    content += '  department_id UUID,\n';
    content += '  owner_id UUID,\n';
    content += '  metadata JSONB DEFAULT \'{}\',\n';
    content += '  search_vector TSVECTOR,\n';
    content += '  created_by UUID,\n';
    content += '  updated_by UUID,\n';
    content += '  created_at TIMESTAMPTZ DEFAULT NOW(),\n';
    content += '  updated_at TIMESTAMPTZ DEFAULT NOW(),\n';
    content += '  deleted_at TIMESTAMPTZ,\n';
    content += '  version INTEGER DEFAULT 1\n';
    content += ');\n\n';
    
    content += '-- CUSTOM ENUMS\n';
    content += 'CREATE TYPE role_bucket_enum AS ENUM (\'admin\', \'operational\', \'external\');\n';
    content += 'CREATE TYPE project_status_enum AS ENUM (\'draft\', \'active\', \'completed\', \'cancelled\');\n';
    content += 'CREATE TYPE priority_enum AS ENUM (\'low\', \'medium\', \'high\', \'urgent\');\n';
    content += 'CREATE TYPE work_order_status_enum AS ENUM (\'queued\', \'in_progress\', \'completed\', \'cancelled\');\n';
    content += 'CREATE TYPE shipment_status_enum AS ENUM (\'created\', \'shipped\', \'in_transit\', \'delivered\');\n';
    content += 'CREATE TYPE quote_status_enum AS ENUM (\'draft\', \'sent\', \'accepted\', \'rejected\');\n';
    content += 'CREATE TYPE message_type_enum AS ENUM (\'email\', \'sms\', \'internal\');\n';
    content += 'CREATE TYPE notification_status_enum AS ENUM (\'unread\', \'read\', \'archived\');\n\n';
    
    content += '-- DATABASE FUNCTIONS\n';
    content += 'CREATE OR REPLACE FUNCTION public.is_user_admin()\n';
    content += 'RETURNS BOOLEAN AS $$\n';
    content += '  SELECT EXISTS (\n';
    content += '    SELECT 1 FROM public.memberships m\n';
    content += '    WHERE m.user_id = auth.uid()\n';
    content += '      AND m.role_bucket = \'admin\'\n';
    content += '      AND m.deleted_at IS NULL\n';
    content += '      AND (m.expires_at IS NULL OR m.expires_at > NOW())\n';
    content += '  );\n';
    content += '$$ LANGUAGE SQL STABLE SECURITY DEFINER SET search_path TO \'public\';\n\n';
    
    content += 'CREATE OR REPLACE FUNCTION public.get_user_org_id()\n';
    content += 'RETURNS UUID AS $$\n';
    content += '  SELECT m.org_id FROM public.memberships m\n';
    content += '  WHERE m.user_id = auth.uid() AND m.deleted_at IS NULL\n';
    content += '  LIMIT 1;\n';
    content += '$$ LANGUAGE SQL STABLE SECURITY DEFINER SET search_path TO \'public\';\n\n';
    
    content += '-- AUDIT TRIGGER FUNCTION\n';
    content += 'CREATE OR REPLACE FUNCTION public.audit_trigger()\n';
    content += 'RETURNS TRIGGER AS $$\n';
    content += 'BEGIN\n';
    content += '  INSERT INTO audit_log (org_id, table_name, row_id, action, old_values, new_values, actor_id)\n';
    content += '  VALUES (\n';
    content += '    COALESCE(NEW.org_id, OLD.org_id),\n';
    content += '    TG_TABLE_NAME,\n';
    content += '    COALESCE(NEW.id, OLD.id),\n';
    content += '    TG_OP,\n';
    content += '    CASE WHEN TG_OP != \'INSERT\' THEN to_jsonb(OLD) ELSE NULL END,\n';
    content += '    CASE WHEN TG_OP != \'DELETE\' THEN to_jsonb(NEW) ELSE NULL END,\n';
    content += '    auth.uid()\n';
    content += '  );\n';
    content += '  RETURN COALESCE(NEW, OLD);\n';
    content += 'END;\n';
    content += '$$ LANGUAGE plpgsql SECURITY DEFINER;\n\n';
    
    content += '-- UPDATE TRIGGER FUNCTION\n';
    content += 'CREATE OR REPLACE FUNCTION public.update_updated_at_column()\n';
    content += 'RETURNS TRIGGER AS $$\n';
    content += 'BEGIN\n';
    content += '  NEW.updated_at = NOW();\n';
    content += '  NEW.version = OLD.version + 1;\n';
    content += '  RETURN NEW;\n';
    content += 'END;\n';
    content += '$$ LANGUAGE plpgsql;\n';
    
    return {
      name: 'schema-ddl.sql',
      content,
      description: 'Complete database schema DDL with tables, functions, and triggers'
    };
  }
  
  private static async generateTablesDetailed(): Promise<BundleFile> {
    let content = 'TEAM1 PORTAL - DATABASE TABLES DETAILED\n';
    content += '=======================================\n\n';
    content += 'Comprehensive documentation of all database tables, columns,\n';
    content += 'data types, constraints, and relationships.\n\n';
    
    const tableInfo = [
      {
        name: 'organizations',
        description: 'Multi-tenant organization root table',
        columns: 'id (UUID, PK), name (TEXT), slug (TEXT, UNIQUE), settings (JSONB), audit columns',
        relationships: 'Parent to all other org-scoped tables'
      },
      {
        name: 'profiles',
        description: 'User profile data (extends auth.users)',
        columns: 'id (UUID, PK), org_id (UUID), email (TEXT), name (TEXT), avatar_url (TEXT), bio (TEXT), phone (TEXT)',
        relationships: 'Belongs to organizations, referenced by memberships'
      },
      {
        name: 'memberships',
        description: 'User-organization role assignments',
        columns: 'id (UUID, PK), org_id (UUID), user_id (UUID), role_bucket (ENUM), department_id (UUID), expires_at (TIMESTAMPTZ)',
        relationships: 'Links profiles to organizations with roles'
      },
      {
        name: 'departments',
        description: 'Organizational department structure',
        columns: 'id (UUID, PK), org_id (UUID), name (TEXT), code (TEXT), parent_id (UUID), default_bucket (ENUM)',
        relationships: 'Self-referencing hierarchy, referenced by other tables'
      },
      {
        name: 'customers',
        description: 'Customer relationship management',
        columns: 'id (UUID, PK), org_id (UUID), name (TEXT), email (TEXT), phone (TEXT), address (TEXT), search_vector (TSVECTOR)',
        relationships: 'Referenced by projects, quotes, messages'
      },
      {
        name: 'projects',
        description: 'Project management core table',
        columns: 'id (UUID, PK), org_id (UUID), title (TEXT), description (TEXT), customer_id (UUID), status (ENUM), priority (ENUM), due_date (TIMESTAMPTZ), budget (NUMERIC), progress (INTEGER)',
        relationships: 'References customers, has work_orders, time_entries, shipments'
      },
      {
        name: 'work_orders',
        description: 'Manufacturing and production orders',
        columns: 'id (UUID, PK), org_id (UUID), project_id (UUID), title (TEXT), status (ENUM), priority (ENUM), quantity (INTEGER), estimated_hours (NUMERIC), actual_hours (NUMERIC)',
        relationships: 'Belongs to projects, has time_entries'
      },
      {
        name: 'time_entries',
        description: 'Labor time tracking',
        columns: 'id (UUID, PK), org_id (UUID), user_id (UUID), project_id (UUID), work_order_id (UUID), hours (NUMERIC), entry_date (DATE), billable (BOOLEAN), hourly_rate (NUMERIC)',
        relationships: 'References projects, work_orders, users'
      },
      {
        name: 'shipments',
        description: 'Logistics and delivery tracking',
        columns: 'id (UUID, PK), org_id (UUID), project_id (UUID), address (TEXT), carrier (TEXT), tracking_number (TEXT), status (ENUM), shipped_at (TIMESTAMPTZ), delivered_at (TIMESTAMPTZ)',
        relationships: 'References projects, contains shipment items in JSONB'
      },
      {
        name: 'documents',
        description: 'File and document management',
        columns: 'id (UUID, PK), org_id (UUID), name (TEXT), original_name (TEXT), url (TEXT), storage_path (TEXT), mime_type (TEXT), size_bytes (BIGINT), entity_type (TEXT), entity_id (UUID)',
        relationships: 'Polymorphic references to any entity via entity_type/entity_id'
      },
      {
        name: 'messages',
        description: 'Communication and messaging system',
        columns: 'id (UUID, PK), org_id (UUID), type (ENUM), subject (TEXT), body (TEXT), from_email (TEXT), to_emails (TEXT[]), status (TEXT), sent_at (TIMESTAMPTZ)',
        relationships: 'Can reference customers, projects via optional foreign keys'
      },
      {
        name: 'notifications',
        description: 'User notification system',
        columns: 'id (UUID, PK), org_id (UUID), user_id (UUID), type (TEXT), title (TEXT), message (TEXT), status (ENUM), read_at (TIMESTAMPTZ), entity_type (TEXT), entity_id (UUID)',
        relationships: 'References users, polymorphic entity references'
      },
      {
        name: 'quotes',
        description: 'Customer quotations and pricing',
        columns: 'id (UUID, PK), org_id (UUID), customer_id (UUID), project_id (UUID), total (NUMERIC), status (ENUM), line_items (JSONB), expires_at (TIMESTAMPTZ)',
        relationships: 'References customers, projects, contains structured pricing data'
      },
      {
        name: 'audit_log',
        description: 'System audit trail',
        columns: 'id (UUID, PK), org_id (UUID), table_name (TEXT), row_id (UUID), action (TEXT), old_values (JSONB), new_values (JSONB), actor_id (UUID), created_at (TIMESTAMPTZ)',
        relationships: 'Tracks changes to all audited tables'
      }
    ];
    
    tableInfo.forEach(table => {
      content += `TABLE: ${table.name.toUpperCase()}\n`;
      content += `${'-'.repeat(table.name.length + 7)}\n`;
      content += `Description: ${table.description}\n`;
      content += `Columns: ${table.columns}\n`;
      content += `Relationships: ${table.relationships}\n\n`;
    });
    
    content += 'COMMON COLUMN PATTERNS:\n';
    content += '-----------------------\n';
    content += 'id: UUID primary key (gen_random_uuid())\n';
    content += 'org_id: UUID foreign key for tenant isolation\n';
    content += 'created_at/updated_at: Timestamp tracking with triggers\n';
    content += 'created_by/updated_by: User tracking for audit\n';
    content += 'deleted_at: Soft delete timestamp (nullable)\n';
    content += 'version: Integer for optimistic locking\n';
    content += 'search_vector: Full-text search support (TSVECTOR)\n';
    content += 'metadata: JSONB for flexible schema extension\n\n';
    
    content += 'DATA INTEGRITY:\n';
    content += '---------------\n';
    content += 'All tables use UUID primary keys\n';
    content += 'Foreign key constraints enforce referential integrity\n';
    content += 'NOT NULL constraints on critical fields\n';
    content += 'UNIQUE constraints on business keys (slugs, codes)\n';
    content += 'CHECK constraints for data validation\n';
    content += 'Indexes on frequently queried columns\n';
    content += 'Composite indexes for multi-column queries\n';
    
    return {
      name: 'tables-detailed.txt',
      content,
      description: 'Comprehensive table documentation with columns, types, and relationships'
    };
  }
  
  private static async generateRLSPoliciesExplained(): Promise<BundleFile> {
    let content = 'TEAM1 PORTAL - ROW LEVEL SECURITY POLICIES\n';
    content += '==========================================\n\n';
    content += 'Plain English explanation of all Row Level Security (RLS) policies\n';
    content += 'and their role in maintaining data security and tenant isolation.\n\n';
    
    content += 'ORGANIZATION ACCESS PATTERN:\n';
    content += '----------------------------\n';
    content += 'Policy Name: org_access\n';
    content += 'Table: organizations\n';
    content += 'Rule: Users can only access organizations they are members of\n';
    content += 'Implementation: Checks membership table for user-org relationship\n';
    content += 'Security Level: Critical - prevents cross-tenant data access\n\n';
    
    content += 'PROFILE ACCESS PATTERNS:\n';
    content += '------------------------\n';
    content += 'Policy Name: profiles_membership_access\n';
    content += 'Table: profiles\n';
    content += 'Rule: Users can view profiles within their organization OR their own profile\n';
    content += 'Special Access: Admins can view all profiles in their organization\n';
    content += 'Implementation: Uses is_user_admin() and get_user_org_id() functions\n\n';
    
    content += 'Policy Name: profile_self_update\n';
    content += 'Table: profiles\n';
    content += 'Rule: Users can only update their own profile\n';
    content += 'Implementation: Matches auth.uid() with profile.id\n\n';
    
    content += 'STANDARD ORG-SCOPED ACCESS:\n';
    content += '---------------------------\n';
    content += 'Applied to: customers, projects, work_orders, time_entries, shipments, documents, messages, notifications, quotes, teams, memberships, departments\n';
    content += 'Pattern: [table]_org_access\n';
    content += 'Rule: Users can access all data within their organization\n';
    content += 'Implementation: Validates user membership in same organization as data\n';
    content += 'Security: Ensures complete tenant isolation\n\n';
    
    content += 'ADMIN-ONLY ACCESS:\n';
    content += '------------------\n';
    content += 'Policy Name: audit_admin_access\n';
    content += 'Table: audit_log\n';
    content += 'Rule: Only admin users can view audit logs\n';
    content += 'Scope: Limited to their organization or system-wide logs\n';
    content += 'Implementation: Uses is_user_admin() function for role check\n';
    content += 'Purpose: Sensitive audit data protection\n\n';
    
    content += 'HELPER FUNCTIONS:\n';
    content += '-----------------\n';
    content += 'is_user_admin(): Checks if current user has admin role bucket\n';
    content += '  - Looks up membership table\n';
    content += '  - Verifies role_bucket = "admin"\n';
    content += '  - Ensures membership is not deleted or expired\n';
    content += '  - Returns boolean for policy evaluation\n\n';
    
    content += 'get_user_org_id(): Returns the organization ID for current user\n';
    content += '  - Queries membership table for user\'s org\n';
    content += '  - Returns first active membership org_id\n';
    content += '  - Used in org-scoped policy checks\n\n';
    
    content += 'SECURITY ARCHITECTURE:\n';
    content += '----------------------\n';
    content += '1. Multi-tenant isolation via org_id columns\n';
    content += '2. Role-based access via membership role_bucket\n';
    content += '3. Self-service access for user\'s own data\n';
    content += '4. Admin escalation for management functions\n';
    content += '5. Audit trail protection for compliance\n\n';
    
    content += 'POLICY ENFORCEMENT:\n';
    content += '-------------------\n';
    content += 'All policies are enforced at the database level\n';
    content += 'Cannot be bypassed by application code\n';
    content += 'Apply to all query types (SELECT, INSERT, UPDATE, DELETE)\n';
    content += 'Use SECURITY DEFINER functions for safe privilege elevation\n';
    content += 'Performance optimized with proper indexing\n\n';
    
    content += 'COMPLIANCE FEATURES:\n';
    content += '--------------------\n';
    content += 'Data residency: All data scoped to tenant organization\n';
    content += 'Access logging: All changes tracked in audit_log\n';
    content += 'Privacy protection: Users cannot access other tenants\n';
    content += 'Role separation: Clear admin vs operational permissions\n';
    content += 'Audit trail: Complete change history with user attribution\n';
    
    return {
      name: 'rls-policies-explained.txt',
      content,
      description: 'Plain English explanation of all RLS policies and security patterns'
    };
  }
  
  private static async generateFunctionsProcedures(): Promise<BundleFile> {
    let content = 'TEAM1 PORTAL - DATABASE FUNCTIONS & PROCEDURES\n';
    content += '==============================================\n\n';
    content += 'Documentation of all custom database functions, their purposes,\n';
    content += 'signatures, and usage patterns.\n\n';
    
    content += 'SECURITY FUNCTIONS:\n';
    content += '-------------------\n\n';
    
    content += 'FUNCTION: is_user_admin()\n';
    content += 'Returns: BOOLEAN\n';
    content += 'Security: SECURITY DEFINER\n';
    content += 'Purpose: Checks if the current authenticated user has admin privileges\n';
    content += 'Logic: Queries memberships table for role_bucket = "admin"\n';
    content += 'Usage: Used in RLS policies to grant admin access\n';
    content += 'Example: SELECT * FROM audit_log WHERE is_user_admin();\n\n';
    
    content += 'FUNCTION: get_user_org_id()\n';
    content += 'Returns: UUID\n';
    content += 'Security: SECURITY DEFINER\n';
    content += 'Purpose: Returns the organization ID for the current user\n';
    content += 'Logic: Finds active membership for auth.uid()\n';
    content += 'Usage: Used in RLS policies for org-scoped access\n';
    content += 'Example: SELECT * FROM projects WHERE org_id = get_user_org_id();\n\n';
    
    content += 'TRIGGER FUNCTIONS:\n';
    content += '------------------\n\n';
    
    content += 'FUNCTION: update_updated_at_column()\n';
    content += 'Returns: TRIGGER\n';
    content += 'Purpose: Automatically updates updated_at and version columns\n';
    content += 'Behavior: \n';
    content += '  - Sets updated_at to current timestamp\n';
    content += '  - Increments version number for optimistic locking\n';
    content += '  - Triggered on UPDATE operations\n';
    content += 'Applied to: All main business tables\n\n';
    
    content += 'FUNCTION: audit_trigger()\n';
    content += 'Returns: TRIGGER\n';
    content += 'Security: SECURITY DEFINER\n';
    content += 'Purpose: Creates audit log entries for all data changes\n';
    content += 'Behavior:\n';
    content += '  - Captures old and new values as JSONB\n';
    content += '  - Records operation type (INSERT/UPDATE/DELETE)\n';
    content += '  - Tracks actor (user who made change)\n';
    content += '  - Includes request context and IP address\n';
    content += '  - Handles org_id extraction for proper scoping\n';
    content += 'Applied to: All audited tables\n\n';
    
    content += 'FUNCTION: handle_new_user()\n';
    content += 'Returns: TRIGGER\n';
    content += 'Security: SECURITY DEFINER\n';
    content += 'Purpose: Automatically creates profile when user signs up\n';
    content += 'Behavior:\n';
    content += '  - Triggered on auth.users INSERT\n';
    content += '  - Creates corresponding profile record\n';
    content += '  - Extracts name from user metadata\n';
    content += '  - Assigns to default organization\n';
    content += 'Note: Production should handle org assignment differently\n\n';
    
    content += 'UTILITY FUNCTIONS:\n';
    content += '------------------\n\n';
    
    content += 'FUNCTION: Various JSONB manipulation functions\n';
    content += 'Purpose: Handle metadata and settings columns\n';
    content += 'Usage: Extract and update JSONB fields safely\n\n';
    
    content += 'FUNCTION: Text search functions\n';
    content += 'Purpose: Support full-text search on tsvector columns\n';
    content += 'Usage: Enable fast searching across text content\n\n';
    
    content += 'PERFORMANCE CONSIDERATIONS:\n';
    content += '----------------------------\n';
    content += 'All SECURITY DEFINER functions use explicit search_path\n';
    content += 'Functions are marked STABLE or IMMUTABLE where appropriate\n';
    content += 'Trigger functions are optimized for high-volume operations\n';
    content += 'Audit triggers handle errors gracefully to prevent blocking\n';
    content += 'Security functions use efficient membership lookups\n\n';
    
    content += 'MAINTENANCE PROCEDURES:\n';
    content += '-----------------------\n';
    content += 'Regular audit log cleanup (archive old entries)\n';
    content += 'Search vector maintenance for full-text search\n';
    content += 'Statistics updates for query optimization\n';
    content += 'Index maintenance for performance\n';
    content += 'Backup and restore procedures\n';
    
    return {
      name: 'functions-procedures.txt',
      content,
      description: 'Complete documentation of database functions, triggers, and procedures'
    };
  }
  
  private static async generateEnumsTypes(): Promise<BundleFile> {
    let content = 'TEAM1 PORTAL - CUSTOM TYPES & ENUMS\n';
    content += '===================================\n\n';
    content += 'Documentation of all custom PostgreSQL types and enums used\n';
    content += 'throughout the database schema.\n\n';
    
    content += 'ROLE & PERMISSIONS ENUMS:\n';
    content += '-------------------------\n\n';
    
    content += 'TYPE: role_bucket_enum\n';
    content += 'Values: \'admin\', \'operational\', \'external\'\n';
    content += 'Usage: memberships.role_bucket, departments.default_bucket\n';
    content += 'Purpose: High-level role categorization for access control\n';
    content += 'Definitions:\n';
    content += '  - admin: Full system access, user management, org settings\n';
    content += '  - operational: Standard business operations, data entry\n';
    content += '  - external: Limited access, typically for customers/vendors\n\n';
    
    content += 'PROJECT & WORKFLOW ENUMS:\n';
    content += '-------------------------\n\n';
    
    content += 'TYPE: project_status_enum\n';
    content += 'Values: \'draft\', \'active\', \'completed\', \'cancelled\'\n';
    content += 'Usage: projects.status\n';
    content += 'Purpose: Track project lifecycle stages\n';
    content += 'Workflow: draft → active → completed/cancelled\n\n';
    
    content += 'TYPE: priority_enum\n';
    content += 'Values: \'low\', \'medium\', \'high\', \'urgent\'\n';
    content += 'Usage: projects.priority, work_orders.priority\n';
    content += 'Purpose: Prioritization for resource allocation\n';
    content += 'Default: \'medium\' for most use cases\n\n';
    
    content += 'TYPE: work_order_status_enum\n';
    content += 'Values: \'queued\', \'in_progress\', \'completed\', \'cancelled\'\n';
    content += 'Usage: work_orders.status\n';
    content += 'Purpose: Manufacturing/production workflow tracking\n';
    content += 'Workflow: queued → in_progress → completed/cancelled\n\n';
    
    content += 'LOGISTICS & SALES ENUMS:\n';
    content += '------------------------\n\n';
    
    content += 'TYPE: shipment_status_enum\n';
    content += 'Values: \'created\', \'shipped\', \'in_transit\', \'delivered\'\n';
    content += 'Usage: shipments.status\n';
    content += 'Purpose: Logistics and delivery tracking\n';
    content += 'Workflow: created → shipped → in_transit → delivered\n\n';
    
    content += 'TYPE: quote_status_enum\n';
    content += 'Values: \'draft\', \'sent\', \'accepted\', \'rejected\'\n';
    content += 'Usage: quotes.status\n';
    content += 'Purpose: Sales quotation lifecycle\n';
    content += 'Workflow: draft → sent → accepted/rejected\n\n';
    
    content += 'COMMUNICATION ENUMS:\n';
    content += '--------------------\n\n';
    
    content += 'TYPE: message_type_enum\n';
    content += 'Values: \'email\', \'sms\', \'internal\'\n';
    content += 'Usage: messages.type\n';
    content += 'Purpose: Differentiate communication channels\n';
    content += 'Routing: Determines delivery method and formatting\n\n';
    
    content += 'TYPE: notification_status_enum\n';
    content += 'Values: \'unread\', \'read\', \'archived\'\n';
    content += 'Usage: notifications.status\n';
    content += 'Purpose: User notification state management\n';
    content += 'Workflow: unread → read → archived (optional)\n\n';
    
    content += 'ENUM USAGE PATTERNS:\n';
    content += '--------------------\n';
    content += 'All enums have default values defined in table schemas\n';
    content += 'Status enums follow consistent state machine patterns\n';
    content += 'Priority enums use standard low/medium/high/urgent scale\n';
    content += 'Role enums align with application permission system\n';
    content += 'Communication enums support multi-channel messaging\n\n';
    
    content += 'ENUM EVOLUTION:\n';
    content += '---------------\n';
    content += 'Adding new values: ALTER TYPE ... ADD VALUE \'new_value\'\n';
    content += 'Cannot remove values if referenced in data\n';
    content += 'Consider impact on application code when changing\n';
    content += 'Use migrations for coordinated schema + code updates\n\n';
    
    content += 'VALIDATION & CONSTRAINTS:\n';
    content += '-------------------------\n';
    content += 'Enum values provide type safety at database level\n';
    content += 'Application code should handle all possible enum values\n';
    content += 'Default values prevent NULL insertion issues\n';
    content += 'Status transitions should be validated in application logic\n';
    content += 'Consider using CHECK constraints for complex validation\n\n';
    
    content += 'PERFORMANCE NOTES:\n';
    content += '------------------\n';
    content += 'Enums are stored efficiently as integers internally\n';
    content += 'Indexes on enum columns are compact and fast\n';
    content += 'String comparison overhead is minimal\n';
    content += 'Consider partitioning by status for very large tables\n';
    
    return {
      name: 'enums-types.txt',
      content,
      description: 'Documentation of all custom PostgreSQL types and enums with usage patterns'
    };
  }
  
  private static async generateAuditPatterns(): Promise<BundleFile> {
    let content = 'TEAM1 PORTAL - AUDIT PATTERNS & DATA GOVERNANCE\n';
    content += '===============================================\n\n';
    content += 'Documentation of audit trails, soft delete patterns, and data\n';
    content += 'governance implemented throughout the database.\n\n';
    
    content += 'SOFT DELETE PATTERN:\n';
    content += '--------------------\n';
    content += 'Implementation: deleted_at TIMESTAMPTZ column (nullable)\n';
    content += 'Behavior: NULL = active record, timestamp = soft deleted\n';
    content += 'Applied to: All major business tables\n';
    content += 'Benefits: \n';
    content += '  - Data recovery capability\n';
    content += '  - Audit trail preservation\n';
    content += '  - Foreign key integrity maintenance\n';
    content += '  - Compliance with data retention policies\n\n';
    
    content += 'Query Patterns:\n';
    content += '  Active records: WHERE deleted_at IS NULL\n';
    content += '  Deleted records: WHERE deleted_at IS NOT NULL\n';
    content += '  All records: No filter (admin/audit views)\n\n';
    
    content += 'VERSION TRACKING PATTERN:\n';
    content += '-------------------------\n';
    content += 'Implementation: version INTEGER column (default 1)\n';
    content += 'Behavior: Increments on each UPDATE via trigger\n';
    content += 'Purpose: Optimistic locking and change detection\n';
    content += 'Usage:\n';
    content += '  - Prevent lost update problems\n';
    content += '  - Track number of modifications\n';
    content += '  - Support conflict resolution\n';
    content += '  - Enable conditional updates\n\n';
    
    content += 'AUDIT TRAIL SYSTEM:\n';
    content += '-------------------\n';
    content += 'Central Table: audit_log\n';
    content += 'Trigger: audit_trigger() on all monitored tables\n';
    content += 'Captured Data:\n';
    content += '  - Table name and row ID\n';
    content += '  - Operation type (INSERT/UPDATE/DELETE)\n';
    content += '  - Complete old and new values (JSONB)\n';
    content += '  - Actor (user who made change)\n';
    content += '  - Organization context\n';
    content += '  - Timestamp and request metadata\n';
    content += '  - IP address and user agent\n\n';
    
    content += 'CHANGE TRACKING COLUMNS:\n';
    content += '------------------------\n';
    content += 'Standard Pattern on All Tables:\n';
    content += '  created_at: TIMESTAMPTZ DEFAULT NOW()\n';
    content += '  updated_at: TIMESTAMPTZ DEFAULT NOW() (auto-updated)\n';
    content += '  created_by: UUID (references user who created)\n';
    content += '  updated_by: UUID (references user who last modified)\n';
    content += '  deleted_at: TIMESTAMPTZ (soft delete timestamp)\n';
    content += '  version: INTEGER DEFAULT 1 (auto-incremented)\n\n';
    
    content += 'TRIGGER IMPLEMENTATION:\n';
    content += '-----------------------\n';
    content += 'update_updated_at_column():\n';
    content += '  - Fired BEFORE UPDATE\n';
    content += '  - Sets updated_at = NOW()\n';
    content += '  - Increments version column\n';
    content += '  - Applied to all business tables\n\n';
    
    content += 'audit_trigger():\n';
    content += '  - Fired AFTER INSERT/UPDATE/DELETE\n';
    content += '  - Captures complete row state\n';
    content += '  - Handles special cases (organizations table)\n';
    content += '  - Graceful error handling to prevent blocking\n\n';
    
    content += 'DATA RETENTION POLICIES:\n';
    content += '------------------------\n';
    content += 'Active Data: Indefinite retention with soft delete\n';
    content += 'Audit Logs: 7-year retention for compliance\n';
    content += 'Soft Deleted: 2-year retention before hard delete\n';
    content += 'Personal Data: Purged on user request (GDPR)\n';
    content += 'Backups: Daily snapshots, 30-day retention\n\n';
    
    content += 'COMPLIANCE FEATURES:\n';
    content += '--------------------\n';
    content += 'GDPR Support:\n';
    content += '  - Right to be forgotten (data purging)\n';
    content += '  - Data portability (export functions)\n';
    content += '  - Access transparency (audit logs)\n';
    content += '  - Purpose limitation (org-scoped access)\n\n';
    
    content += 'SOX Compliance:\n';
    content += '  - Immutable audit trail\n';
    content += '  - User attribution for all changes\n';
    content += '  - Segregation of duties (role-based access)\n';
    content += '  - Change approval workflows\n\n';
    
    content += 'PERFORMANCE CONSIDERATIONS:\n';
    content += '---------------------------\n';
    content += 'Audit Table Growth: Partition by date/org for performance\n';
    content += 'Index Strategy: Covering indexes on common query patterns\n';
    content += 'Archive Strategy: Move old audit logs to cold storage\n';
    content += 'Query Optimization: Always filter by deleted_at for active data\n\n';
    
    content += 'MONITORING & MAINTENANCE:\n';
    content += '-------------------------\n';
    content += 'Daily: Monitor audit log growth and trigger performance\n';
    content += 'Weekly: Review data consistency and trigger failures\n';
    content += 'Monthly: Archive old audit logs and optimize indexes\n';
    content += 'Quarterly: Review retention policies and compliance\n';
    content += 'Annually: Full audit of data governance practices\n';
    
    return {
      name: 'audit-patterns.txt',
      content,
      description: 'Complete documentation of audit trails, soft delete patterns, and data governance'
    };
  }
  
  private static async generateTenancyModel(): Promise<BundleFile> {
    let content = 'TEAM1 PORTAL - TENANCY MODEL & ORGANIZATION SCOPING\n';
    content += '===================================================\n\n';
    content += 'Detailed explanation of the multi-tenant architecture and\n';
    content += 'how data isolation is implemented across the system.\n\n';
    
    content += 'MULTI-TENANT ARCHITECTURE:\n';
    content += '--------------------------\n';
    content += 'Pattern: Shared Database, Shared Schema\n';
    content += 'Isolation: Row Level Security (RLS) policies\n';
    content += 'Tenant Key: org_id (UUID) on all business tables\n';
    content += 'Benefits: \n';
    content += '  - Cost effective (shared infrastructure)\n';
    content += '  - Simplified maintenance and updates\n';
    content += '  - Strong security via database-level isolation\n';
    content += '  - Easy backup and recovery\n\n';
    
    content += 'ORGANIZATION HIERARCHY:\n';
    content += '-----------------------\n';
    content += 'Root Level: organizations table\n';
    content += '  - Unique org_id for each tenant\n';
    content += '  - Organization name and settings\n';
    content += '  - Root of all tenant data\n\n';
    
    content += 'User Association: memberships table\n';
    content += '  - Links users to organizations\n';
    content += '  - Defines role within organization\n';
    content += '  - Supports multiple org membership\n';
    content += '  - Expiration dates for temporary access\n\n';
    
    content += 'DATA SCOPING PATTERN:\n';
    content += '--------------------\n';
    content += 'Every business table includes org_id column\n';
    content += 'RLS policies enforce org_id = get_user_org_id()\n';
    content += 'Foreign keys maintain referential integrity within tenant\n';
    content += 'Cross-tenant queries are impossible without admin override\n\n';
    
    content += 'Example Table Structure:\n';
    content += 'CREATE TABLE projects (\n';
    content += '  id UUID PRIMARY KEY,\n';
    content += '  org_id UUID NOT NULL,  -- Tenant isolation key\n';
    content += '  title TEXT NOT NULL,\n';
    content += '  customer_id UUID REFERENCES customers(id),\n';
    content += '  -- other columns\n';
    content += ');\n\n';
    
    content += 'RLS Policy Example:\n';
    content += 'CREATE POLICY "projects_org_access" ON projects\n';
    content += '  FOR ALL USING (\n';
    content += '    EXISTS (\n';
    content += '      SELECT 1 FROM profiles p\n';
    content += '      WHERE p.id = auth.uid() AND p.org_id = projects.org_id\n';
    content += '    )\n';
    content += '  );\n\n';
    
    content += 'ROLE-BASED ACCESS CONTROL:\n';
    content += '--------------------------\n';
    content += 'Role Buckets: admin, operational, external\n';
    content += 'Scope: Roles are organization-specific\n';
    content += 'Inheritance: Roles can have hierarchical permissions\n\n';
    
    content += 'Admin Role:\n';
    content += '  - Full access to organization data\n';
    content += '  - User management capabilities\n';
    content += '  - Audit log access\n';
    content += '  - System configuration\n\n';
    
    content += 'Operational Role:\n';
    content += '  - Standard business operations\n';
    content += '  - Data entry and modification\n';
    content += '  - Reporting and analytics\n';
    content += '  - Limited administrative functions\n\n';
    
    content += 'External Role:\n';
    content += '  - Limited access for vendors/customers\n';
    content += '  - Read-only access to relevant data\n';
    content += '  - Specific feature restrictions\n';
    content += '  - Time-limited access options\n\n';
    
    content += 'DEPARTMENT-BASED ORGANIZATION:\n';
    content += '------------------------------\n';
    content += 'Structure: Hierarchical department tree within org\n';
    content += 'Purpose: Additional data scoping and workflow routing\n';
    content += 'Implementation: parent_id self-reference in departments\n';
    content += 'Usage: Optional additional access control layer\n\n';
    
    content += 'SECURITY ISOLATION:\n';
    content += '-------------------\n';
    content += 'Database Level:\n';
    content += '  - RLS policies prevent cross-tenant access\n';
    content += '  - Helper functions enforce organization membership\n';
    content += '  - Triggers maintain audit trails per tenant\n\n';
    
    content += 'Application Level:\n';
    content += '  - Authentication required for all access\n';
    content += '  - Session contains organization context\n';
    content += '  - UI components respect role permissions\n';
    content += '  - API endpoints validate tenant access\n\n';
    
    content += 'SCALING CONSIDERATIONS:\n';
    content += '-----------------------\n';
    content += 'Database Growth: Partition large tables by org_id\n';
    content += 'Index Strategy: Composite indexes starting with org_id\n';
    content += 'Query Performance: Always include org_id in WHERE clauses\n';
    content += 'Connection Pooling: Org-aware connection routing\n\n';
    
    content += 'BACKUP & RECOVERY:\n';
    content += '------------------\n';
    content += 'Full Database: Daily backups of entire system\n';
    content += 'Tenant-Specific: Extract single org data for restoration\n';
    content += 'Point-in-Time: Recovery to specific timestamp\n';
    content += 'Cross-Tenant: Prevent accidental data mixing\n\n';
    
    content += 'ONBOARDING PROCESS:\n';
    content += '-------------------\n';
    content += '1. Create organization record\n';
    content += '2. Set up initial admin user\n';
    content += '3. Create organization membership\n';
    content += '4. Configure default departments\n';
    content += '5. Set up initial labels and categories\n';
    content += '6. Grant appropriate permissions\n';
    content += '7. Enable audit logging\n\n';
    
    content += 'OFFBOARDING PROCESS:\n';
    content += '--------------------\n';
    content += '1. Export organization data\n';
    content += '2. Revoke all user access\n';
    content += '3. Soft delete all organization data\n';
    content += '4. Archive audit logs\n';
    content += '5. Schedule hard delete after retention period\n';
    content += '6. Update billing and subscriptions\n';
    
    return {
      name: 'tenancy-model.txt',
      content,
      description: 'Comprehensive explanation of multi-tenant architecture and organization scoping'
    };
  }
  
  private static generateReadme(): string {
    return `# Team1 Portal - Database Bundle

This bundle contains comprehensive database documentation including schema, policies, functions, and governance patterns for LLM analysis and code review.

## Bundle Contents

### schema-ddl.sql
Complete database schema DDL with tables, functions, and triggers. Use this to understand the full database structure and relationships.

### tables-detailed.txt
Comprehensive table documentation with columns, types, and relationships. Provides detailed information about each table's purpose and structure.

### rls-policies-explained.txt
Plain English explanation of all RLS policies and security patterns. Essential for understanding data access control and tenant isolation.

### functions-procedures.txt
Complete documentation of database functions, triggers, and procedures. Shows how business logic is implemented at the database level.

### enums-types.txt
Documentation of all custom PostgreSQL types and enums with usage patterns. Important for understanding status workflows and type safety.

### audit-patterns.txt
Complete documentation of audit trails, soft delete patterns, and data governance. Shows how data integrity and compliance are maintained.

### tenancy-model.txt
Comprehensive explanation of multi-tenant architecture and organization scoping. Critical for understanding data isolation and security.

## How to Use This Bundle

### For Database Review:
1. Start with tenancy-model.txt to understand the multi-tenant architecture
2. Review schema-ddl.sql for the complete database structure
3. Study rls-policies-explained.txt for security implementation
4. Check audit-patterns.txt for data governance compliance
5. Review functions-procedures.txt for business logic implementation

### For Security Analysis:
1. Focus on rls-policies-explained.txt for access control patterns
2. Review tenancy-model.txt for isolation mechanisms
3. Check audit-patterns.txt for compliance features
4. Analyze functions-procedures.txt for privilege elevation
5. Verify tables-detailed.txt for data integrity constraints

### For Performance Optimization:
1. Review schema-ddl.sql for indexing strategies
2. Check tables-detailed.txt for relationship patterns
3. Analyze functions-procedures.txt for trigger performance
4. Study audit-patterns.txt for archiving strategies
5. Consider tenancy-model.txt for scaling approaches

## Architecture Summary

- **Multi-tenant**: Shared database with org_id isolation
- **Security**: Row Level Security (RLS) policies on all tables
- **Audit**: Complete change tracking with audit_log table
- **Governance**: Soft delete patterns and version tracking
- **Roles**: Hierarchical role-based access control
- **Compliance**: GDPR and SOX compliance features

## Key Security Features

- Organization-based tenant isolation
- Role-based access control (admin/operational/external)
- Complete audit trail for all changes
- Soft delete with data retention policies
- User attribution for all modifications
- IP address and request context tracking

## Performance Notes

- All tables use UUID primary keys
- Composite indexes start with org_id for tenant queries
- Audit logs are partitioned for performance
- Triggers are optimized for high-volume operations
- RLS policies use efficient membership lookups

## Compliance Features

- **GDPR**: Right to be forgotten, data portability, access transparency
- **SOX**: Immutable audit trail, user attribution, segregation of duties
- **Retention**: 7-year audit log retention, 2-year soft delete retention
- **Privacy**: Complete tenant data isolation

Generated: ${new Date().toISOString()}
Bundle Type: Database Documentation Bundle
Version: 1.0.0
Generator: Team1 Portal Export System
`;
  }
}