-- Phase 0 & 1: Enterprise Multi-Tenant Schema Foundation (Simplified RLS)
-- ========================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- ========================================================
-- ENUMS (Avoid free-text statuses)
-- ========================================================

CREATE TYPE role_bucket_enum AS ENUM ('admin', 'management', 'operational', 'external');
CREATE TYPE project_status_enum AS ENUM ('draft', 'quoted', 'approved', 'in_progress', 'on_hold', 'completed', 'archived');
CREATE TYPE work_order_status_enum AS ENUM ('queued', 'wip', 'paused', 'done');
CREATE TYPE shipment_status_enum AS ENUM ('created', 'in_transit', 'delivered');
CREATE TYPE quote_status_enum AS ENUM ('draft', 'sent', 'approved', 'rejected');
CREATE TYPE message_type_enum AS ENUM ('email', 'note', 'system');
CREATE TYPE priority_enum AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE approval_status_enum AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE notification_status_enum AS ENUM ('unread', 'read');
CREATE TYPE workflow_step_status_enum AS ENUM ('pending', 'in_progress', 'completed', 'skipped');

-- ========================================================
-- CORE TENANCY TABLES (Root of multi-tenant architecture)
-- ========================================================

-- Organizations (root tenant)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  settings JSONB DEFAULT '{}',
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  version INTEGER DEFAULT 1
);

-- Departments (organizational units)
CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  parent_id UUID REFERENCES departments(id) ON DELETE RESTRICT,
  default_bucket role_bucket_enum NOT NULL DEFAULT 'operational',
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  version INTEGER DEFAULT 1,
  UNIQUE(org_id, code)
);

-- Teams (sub-units within departments)
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  description TEXT,
  lead_id UUID,
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  version INTEGER DEFAULT 1
);

-- User Profiles (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  email TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  bio TEXT,
  phone TEXT,
  settings JSONB DEFAULT '{}',
  search_vector TSVECTOR GENERATED ALWAYS AS (
    to_tsvector('english', COALESCE(name, '') || ' ' || COALESCE(email, '') || ' ' || COALESCE(bio, ''))
  ) STORED,
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  version INTEGER DEFAULT 1
);

-- Memberships (user-org-role relationships)
CREATE TABLE memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  department_id UUID REFERENCES departments(id) ON DELETE RESTRICT,
  team_id UUID REFERENCES teams(id) ON DELETE RESTRICT,
  role_bucket role_bucket_enum NOT NULL DEFAULT 'external',
  assigned_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  expires_at TIMESTAMPTZ,
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  version INTEGER DEFAULT 1,
  UNIQUE(org_id, user_id, department_id, team_id)
);

-- ========================================================
-- BUSINESS LOGIC TABLES (Enhanced from existing types)
-- ========================================================

-- Customers
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  department_id UUID REFERENCES departments(id) ON DELETE RESTRICT,
  owner_id UUID REFERENCES profiles(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  settings JSONB DEFAULT '{}',
  search_vector TSVECTOR GENERATED ALWAYS AS (
    to_tsvector('english', name || ' ' || COALESCE(email, '') || ' ' || COALESCE(phone, ''))
  ) STORED,
  created_by UUID REFERENCES profiles(id),
  updated_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  version INTEGER DEFAULT 1
);

-- Quotes
CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  department_id UUID REFERENCES departments(id) ON DELETE RESTRICT,
  owner_id UUID REFERENCES profiles(id) ON DELETE RESTRICT,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  project_id UUID,
  total DECIMAL(12,2) NOT NULL DEFAULT 0,
  status quote_status_enum NOT NULL DEFAULT 'draft',
  expires_at TIMESTAMPTZ,
  line_items JSONB DEFAULT '[]',
  notes TEXT,
  created_by UUID REFERENCES profiles(id),
  updated_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  version INTEGER DEFAULT 1
);

-- Projects
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  department_id UUID REFERENCES departments(id) ON DELETE RESTRICT,
  owner_id UUID REFERENCES profiles(id) ON DELETE RESTRICT,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  title TEXT NOT NULL,
  description TEXT,
  status project_status_enum NOT NULL DEFAULT 'draft',
  priority priority_enum DEFAULT 'medium',
  due_date TIMESTAMPTZ,
  quote_id UUID REFERENCES quotes(id) ON DELETE RESTRICT,
  budget DECIMAL(12,2),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  metadata JSONB DEFAULT '{}',
  search_vector TSVECTOR GENERATED ALWAYS AS (
    to_tsvector('english', title || ' ' || COALESCE(description, ''))
  ) STORED,
  created_by UUID REFERENCES profiles(id),
  updated_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  version INTEGER DEFAULT 1
);

-- Work Orders
CREATE TABLE work_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  department_id UUID REFERENCES departments(id) ON DELETE RESTRICT,
  owner_id UUID REFERENCES profiles(id) ON DELETE RESTRICT,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status work_order_status_enum NOT NULL DEFAULT 'queued',
  priority priority_enum DEFAULT 'medium',
  quantity INTEGER,
  estimated_hours DECIMAL(8,2),
  actual_hours DECIMAL(8,2),
  assigned_to UUID REFERENCES profiles(id),
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES profiles(id),
  updated_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  version INTEGER DEFAULT 1
);

-- Messages
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  department_id UUID REFERENCES departments(id) ON DELETE RESTRICT,
  owner_id UUID REFERENCES profiles(id) ON DELETE RESTRICT,
  customer_id UUID REFERENCES customers(id) ON DELETE RESTRICT,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  from_email TEXT NOT NULL,
  to_emails TEXT[] NOT NULL,
  cc_emails TEXT[],
  bcc_emails TEXT[],
  type message_type_enum NOT NULL DEFAULT 'email',
  status TEXT DEFAULT 'draft',
  sent_at TIMESTAMPTZ,
  data JSONB DEFAULT '{}',
  search_vector TSVECTOR GENERATED ALWAYS AS (
    to_tsvector('english', subject || ' ' || body)
  ) STORED,
  created_by UUID REFERENCES profiles(id),
  updated_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  version INTEGER DEFAULT 1
);

-- Documents
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  department_id UUID REFERENCES departments(id) ON DELETE RESTRICT,
  owner_id UUID REFERENCES profiles(id) ON DELETE RESTRICT,
  entity_type TEXT NOT NULL, -- 'project', 'customer', 'shipment', 'work_order', 'message'
  entity_id UUID NOT NULL,
  name TEXT NOT NULL,
  original_name TEXT NOT NULL,
  size_bytes BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  checksum TEXT,
  tags TEXT[],
  metadata JSONB DEFAULT '{}',
  search_vector TSVECTOR GENERATED ALWAYS AS (
    to_tsvector('english', name || ' ' || original_name)
  ) STORED,
  created_by UUID REFERENCES profiles(id),
  updated_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  version INTEGER DEFAULT 1
);

-- Shipments
CREATE TABLE shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  department_id UUID REFERENCES departments(id) ON DELETE RESTRICT,
  owner_id UUID REFERENCES profiles(id) ON DELETE RESTRICT,
  project_id UUID REFERENCES projects(id) ON DELETE RESTRICT,
  carrier TEXT,
  tracking_number TEXT,
  address TEXT NOT NULL,
  status shipment_status_enum NOT NULL DEFAULT 'created',
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  items JSONB DEFAULT '[]', -- Array of {sku, qty, weight}
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES profiles(id),
  updated_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  version INTEGER DEFAULT 1
);

-- Carrier Appointments
CREATE TABLE carrier_appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  department_id UUID REFERENCES departments(id) ON DELETE RESTRICT,
  owner_id UUID REFERENCES profiles(id) ON DELETE RESTRICT,
  carrier TEXT NOT NULL,
  window_start TIMESTAMPTZ NOT NULL,
  window_end TIMESTAMPTZ NOT NULL,
  reference TEXT,
  notes TEXT,
  status TEXT DEFAULT 'scheduled',
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES profiles(id),
  updated_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  version INTEGER DEFAULT 1
);

-- Labels
CREATE TABLE labels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  department_id UUID REFERENCES departments(id) ON DELETE RESTRICT,
  owner_id UUID REFERENCES profiles(id) ON DELETE RESTRICT,
  scope TEXT NOT NULL CHECK (scope IN ('customer', 'user', 'org', 'project', 'work_order')),
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES profiles(id),
  updated_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  version INTEGER DEFAULT 1,
  UNIQUE(org_id, scope, slug)
);

-- ========================================================
-- MISSING TABLES (As identified in requirements)
-- ========================================================

-- Time Entries
CREATE TABLE time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  department_id UUID REFERENCES departments(id) ON DELETE RESTRICT,
  owner_id UUID REFERENCES profiles(id) ON DELETE RESTRICT,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  work_order_id UUID REFERENCES work_orders(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  hours DECIMAL(5,2) NOT NULL CHECK (hours > 0),
  billable BOOLEAN DEFAULT true,
  hourly_rate DECIMAL(8,2),
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES profiles(id),
  updated_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  version INTEGER DEFAULT 1
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  department_id UUID REFERENCES departments(id) ON DELETE RESTRICT,
  owner_id UUID REFERENCES profiles(id) ON DELETE RESTRICT,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  status notification_status_enum DEFAULT 'unread',
  entity_type TEXT,
  entity_id UUID,
  read_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES profiles(id),
  updated_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  version INTEGER DEFAULT 1
);

-- Audit Log (immutable)
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  table_name TEXT NOT NULL,
  row_id UUID NOT NULL,
  action TEXT NOT NULL,
  old_values JSONB,
  new_values JSONB,
  actor_id UUID,
  request_id UUID,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Event Outbox (for reliable event publishing)
CREATE TABLE event_outbox (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  topic TEXT NOT NULL,
  payload JSONB NOT NULL,
  correlation_id UUID,
  delivered_at TIMESTAMPTZ,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  next_retry_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================================
-- PERFORMANCE INDEXES (Critical for multi-tenant queries)
-- ========================================================

-- Multi-tenant baseline indexes (org_id filtering)
CREATE INDEX idx_organizations_slug ON organizations(slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_departments_org ON departments(org_id, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_profiles_org ON profiles(org_id, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_memberships_user_org ON memberships(user_id, org_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_memberships_org_role ON memberships(org_id, role_bucket) WHERE deleted_at IS NULL;

-- Business entity indexes
CREATE INDEX idx_customers_org_updated ON customers(org_id, updated_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_projects_org_updated ON projects(org_id, updated_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_projects_status ON projects(org_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_projects_customer ON projects(org_id, customer_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_work_orders_org_status ON work_orders(org_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_work_orders_project ON work_orders(org_id, project_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_work_orders_assigned ON work_orders(org_id, assigned_to) WHERE deleted_at IS NULL;

-- Search indexes (GIN for full-text search)
CREATE INDEX idx_profiles_search ON profiles USING GIN(search_vector);
CREATE INDEX idx_customers_search ON customers USING GIN(search_vector);
CREATE INDEX idx_projects_search ON projects USING GIN(search_vector);
CREATE INDEX idx_messages_search ON messages USING GIN(search_vector);
CREATE INDEX idx_documents_search ON documents USING GIN(search_vector);

-- Composite indexes for common queries
CREATE INDEX idx_projects_org_status_priority ON projects(org_id, status, priority) WHERE deleted_at IS NULL;
CREATE INDEX idx_work_orders_org_project_status ON work_orders(org_id, project_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_time_entries_org_user ON time_entries(org_id, user_id, entry_date DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_notifications_user_status ON notifications(org_id, user_id, status) WHERE deleted_at IS NULL;

-- Audit and event indexes
CREATE INDEX idx_audit_log_org_table ON audit_log(org_id, table_name, created_at DESC);
CREATE INDEX idx_audit_log_actor ON audit_log(org_id, actor_id, created_at DESC);
CREATE INDEX idx_event_outbox_topic ON event_outbox(org_id, topic, created_at DESC) WHERE delivered_at IS NULL;

-- ========================================================
-- UPDATED_AT TRIGGERS (Automatic timestamp management)
-- ========================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  NEW.version = OLD.version + 1;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all tables with updated_at
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_memberships_updated_at BEFORE UPDATE ON memberships FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON quotes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_work_orders_updated_at BEFORE UPDATE ON work_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shipments_updated_at BEFORE UPDATE ON shipments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_carrier_appointments_updated_at BEFORE UPDATE ON carrier_appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_labels_updated_at BEFORE UPDATE ON labels FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_time_entries_updated_at BEFORE UPDATE ON time_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================================
-- AUDIT TRIGGER (Automatic audit trail)
-- ========================================================

CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS TRIGGER AS $$
DECLARE
  org_id_val UUID;
BEGIN
  -- Extract org_id from the record
  org_id_val := COALESCE(NEW.org_id, OLD.org_id);
  
  INSERT INTO audit_log (
    org_id, 
    table_name, 
    row_id, 
    action, 
    old_values, 
    new_values, 
    actor_id,
    request_id,
    ip_address
  ) VALUES (
    org_id_val,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    TG_OP,
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END,
    auth.uid(),
    current_setting('request.id', true)::UUID,
    inet_client_addr()
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit trigger to key tables
CREATE TRIGGER audit_organizations AFTER INSERT OR UPDATE OR DELETE ON organizations FOR EACH ROW EXECUTE FUNCTION audit_trigger();
CREATE TRIGGER audit_projects AFTER INSERT OR UPDATE OR DELETE ON projects FOR EACH ROW EXECUTE FUNCTION audit_trigger();
CREATE TRIGGER audit_work_orders AFTER INSERT OR UPDATE OR DELETE ON work_orders FOR EACH ROW EXECUTE FUNCTION audit_trigger();
CREATE TRIGGER audit_customers AFTER INSERT OR UPDATE OR DELETE ON customers FOR EACH ROW EXECUTE FUNCTION audit_trigger();
CREATE TRIGGER audit_quotes AFTER INSERT OR UPDATE OR DELETE ON quotes FOR EACH ROW EXECUTE FUNCTION audit_trigger();
CREATE TRIGGER audit_memberships AFTER INSERT OR UPDATE OR DELETE ON memberships FOR EACH ROW EXECUTE FUNCTION audit_trigger();

-- ========================================================
-- ENABLE ROW LEVEL SECURITY (RLS) - SIMPLIFIED
-- ========================================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE carrier_appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_outbox ENABLE ROW LEVEL SECURITY;

-- ========================================================
-- SIMPLIFIED RLS POLICIES (No custom auth functions)
-- ========================================================

-- For now, create basic policies that allow authenticated users to access their org's data
-- These will be enhanced later with proper JWT-based org filtering

-- Organizations: Users can only see organizations they belong to via profiles
CREATE POLICY "org_access" ON organizations
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() AND p.org_id = id
    )
  );

-- Departments: Org isolation via profiles
CREATE POLICY "dept_org_access" ON departments
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() AND p.org_id = org_id
    )
  );

-- Teams: Org isolation
CREATE POLICY "team_org_access" ON teams
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() AND p.org_id = org_id
    )
  );

-- Profiles: Users can see profiles in their org
CREATE POLICY "profile_org_access" ON profiles
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() AND p.org_id = org_id
    )
  );

-- Profiles: Users can update their own profile
CREATE POLICY "profile_self_update" ON profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid());

-- Memberships: Org isolation
CREATE POLICY "membership_org_access" ON memberships
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() AND p.org_id = org_id
    )
  );

-- Business entities: Basic org isolation
CREATE POLICY "customers_org_access" ON customers
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() AND p.org_id = org_id
    )
  );

CREATE POLICY "quotes_org_access" ON quotes
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() AND p.org_id = org_id
    )
  );

CREATE POLICY "projects_org_access" ON projects
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() AND p.org_id = org_id
    )
  );

CREATE POLICY "work_orders_org_access" ON work_orders
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() AND p.org_id = org_id
    )
  );

CREATE POLICY "messages_org_access" ON messages
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() AND p.org_id = org_id
    )
  );

CREATE POLICY "documents_org_access" ON documents
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() AND p.org_id = org_id
    )
  );

CREATE POLICY "shipments_org_access" ON shipments
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() AND p.org_id = org_id
    )
  );

CREATE POLICY "time_entries_org_access" ON time_entries
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() AND p.org_id = org_id
    )
  );

CREATE POLICY "notifications_org_access" ON notifications
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() AND p.org_id = org_id
    )
  );

-- Audit log: Admin access only (simplified)
CREATE POLICY "audit_read_access" ON audit_log
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      JOIN memberships m ON p.id = m.user_id
      WHERE p.id = auth.uid() 
        AND p.org_id = org_id 
        AND m.role_bucket = 'admin'
        AND m.deleted_at IS NULL
    )
  );

-- ========================================================
-- SEED DEFAULT DATA
-- ========================================================

-- Default organization (for development)
INSERT INTO organizations (id, name, slug, settings) VALUES 
  ('00000000-0000-4000-8000-000000000001', 'Team1 Arkansas Hub', 'team1-arkansas-hub', '{"default": true}');

-- Default departments
INSERT INTO departments (id, org_id, name, code, default_bucket) VALUES 
  ('00000000-0000-4000-8000-000000000010', '00000000-0000-4000-8000-000000000001', 'Administration', 'ADMIN', 'admin'),
  ('00000000-0000-4000-8000-000000000011', '00000000-0000-4000-8000-000000000001', 'Production', 'PROD', 'operational'),
  ('00000000-0000-4000-8000-000000000012', '00000000-0000-4000-8000-000000000001', 'Shipping & Receiving', 'SHIP', 'operational'),
  ('00000000-0000-4000-8000-000000000013', '00000000-0000-4000-8000-000000000001', 'Customer Service', 'CS', 'operational');