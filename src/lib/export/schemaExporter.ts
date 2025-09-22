import { supabase } from '@/integrations/supabase/client';
import { CSVExporter, CSVColumn } from './csvExporter';

export interface TableInfo {
  table_name: string;
  column_name: string;
  data_type: string;
  is_nullable: string;
  column_default: string | null;
  ordinal_position: number;
}

export interface ForeignKeyInfo {
  table_name: string;
  column_name: string;
  foreign_table_name: string;
  foreign_column_name: string;
  constraint_name: string;
}

export class SchemaExporter {
  static async exportDatabaseSchema(): Promise<void> {
    try {
      // Use predefined schema information since we can't query information_schema directly
      const schemaData = this.getPredefinedSchemaData();

      const columns: CSVColumn[] = [
        { key: 'table_name', label: 'Table Name' },
        { key: 'column_name', label: 'Column Name' },
        { key: 'data_type', label: 'Data Type' },
        { key: 'is_nullable', label: 'Nullable' },
        { key: 'column_default', label: 'Default Value' },
        { key: 'ordinal_position', label: 'Position' },
        { key: 'description', label: 'Description' }
      ];

      CSVExporter.downloadCSV({
        filename: 'supabase_database_schema',
        columns,
        data: schemaData,
        includeMetadata: true
      });

    } catch (error) {
      console.error('Schema export failed:', error);
      throw new Error('Failed to export database schema');
    }
  }

  static async exportRLSPolicies(): Promise<void> {
    try {
      const rlsPolicies = this.getPredefinedRLSPolicies();

      const columns: CSVColumn[] = [
        { key: 'table_name', label: 'Table Name' },
        { key: 'policy_name', label: 'Policy Name' },
        { key: 'command', label: 'Command' },
        { key: 'permissive', label: 'Permissive' },
        { key: 'using_expression', label: 'Using Expression' },
        { key: 'check_expression', label: 'Check Expression' },
        { key: 'description', label: 'Description' }
      ];

      CSVExporter.downloadCSV({
        filename: 'supabase_rls_policies',
        columns,
        data: rlsPolicies,
        includeMetadata: true
      });

    } catch (error) {
      console.error('RLS policies export failed:', error);
      throw error;
    }
  }

  static async exportForeignKeys(): Promise<void> {
    try {
      const foreignKeys = this.getPredefinedForeignKeys();

      const columns: CSVColumn[] = [
        { key: 'table_name', label: 'Table Name' },
        { key: 'column_name', label: 'Column Name' },
        { key: 'foreign_table_name', label: 'Foreign Table' },
        { key: 'foreign_column_name', label: 'Foreign Column' },
        { key: 'constraint_name', label: 'Constraint Name' },
        { key: 'relationship_type', label: 'Relationship Type' }
      ];

      CSVExporter.downloadCSV({
        filename: 'supabase_foreign_keys',
        columns,
        data: foreignKeys,
        includeMetadata: true
      });

    } catch (error) {
      console.error('Foreign keys export failed:', error);
      throw error;
    }
  }

  private static getPredefinedSchemaData(): any[] {
    return [
      // Organizations table
      { table_name: 'organizations', column_name: 'id', data_type: 'uuid', is_nullable: 'NO', column_default: 'gen_random_uuid()', ordinal_position: 1, description: 'Primary key' },
      { table_name: 'organizations', column_name: 'name', data_type: 'text', is_nullable: 'NO', column_default: null, ordinal_position: 2, description: 'Organization name' },
      { table_name: 'organizations', column_name: 'slug', data_type: 'text', is_nullable: 'NO', column_default: null, ordinal_position: 3, description: 'URL-friendly identifier' },
      { table_name: 'organizations', column_name: 'settings', data_type: 'jsonb', is_nullable: 'YES', column_default: "'{}'::jsonb", ordinal_position: 4, description: 'Organization settings' },
      { table_name: 'organizations', column_name: 'created_at', data_type: 'timestamp with time zone', is_nullable: 'YES', column_default: 'now()', ordinal_position: 5, description: 'Creation timestamp' },
      { table_name: 'organizations', column_name: 'updated_at', data_type: 'timestamp with time zone', is_nullable: 'YES', column_default: 'now()', ordinal_position: 6, description: 'Last update timestamp' },
      
      // Profiles table
      { table_name: 'profiles', column_name: 'id', data_type: 'uuid', is_nullable: 'NO', column_default: null, ordinal_position: 1, description: 'References auth.users.id' },
      { table_name: 'profiles', column_name: 'email', data_type: 'text', is_nullable: 'NO', column_default: null, ordinal_position: 2, description: 'User email address' },
      { table_name: 'profiles', column_name: 'name', data_type: 'text', is_nullable: 'YES', column_default: null, ordinal_position: 3, description: 'User display name' },
      { table_name: 'profiles', column_name: 'org_id', data_type: 'uuid', is_nullable: 'NO', column_default: null, ordinal_position: 4, description: 'Organization reference' },
      { table_name: 'profiles', column_name: 'avatar_url', data_type: 'text', is_nullable: 'YES', column_default: null, ordinal_position: 5, description: 'Profile picture URL' },
      { table_name: 'profiles', column_name: 'bio', data_type: 'text', is_nullable: 'YES', column_default: null, ordinal_position: 6, description: 'User biography' },
      
      // Departments table
      { table_name: 'departments', column_name: 'id', data_type: 'uuid', is_nullable: 'NO', column_default: 'gen_random_uuid()', ordinal_position: 1, description: 'Primary key' },
      { table_name: 'departments', column_name: 'org_id', data_type: 'uuid', is_nullable: 'NO', column_default: null, ordinal_position: 2, description: 'Organization reference' },
      { table_name: 'departments', column_name: 'name', data_type: 'text', is_nullable: 'NO', column_default: null, ordinal_position: 3, description: 'Department name' },
      { table_name: 'departments', column_name: 'code', data_type: 'text', is_nullable: 'NO', column_default: null, ordinal_position: 4, description: 'Department code' },
      { table_name: 'departments', column_name: 'parent_id', data_type: 'uuid', is_nullable: 'YES', column_default: null, ordinal_position: 5, description: 'Parent department reference' },
      
      // Add more tables as needed...
      { table_name: 'projects', column_name: 'id', data_type: 'uuid', is_nullable: 'NO', column_default: 'gen_random_uuid()', ordinal_position: 1, description: 'Primary key' },
      { table_name: 'projects', column_name: 'title', data_type: 'text', is_nullable: 'NO', column_default: null, ordinal_position: 2, description: 'Project title' },
      { table_name: 'projects', column_name: 'status', data_type: 'project_status_enum', is_nullable: 'NO', column_default: "'draft'::project_status_enum", ordinal_position: 3, description: 'Project status' },
      { table_name: 'projects', column_name: 'customer_id', data_type: 'uuid', is_nullable: 'NO', column_default: null, ordinal_position: 4, description: 'Customer reference' },
      
      { table_name: 'customers', column_name: 'id', data_type: 'uuid', is_nullable: 'NO', column_default: 'gen_random_uuid()', ordinal_position: 1, description: 'Primary key' },
      { table_name: 'customers', column_name: 'name', data_type: 'text', is_nullable: 'NO', column_default: null, ordinal_position: 2, description: 'Customer name' },
      { table_name: 'customers', column_name: 'email', data_type: 'text', is_nullable: 'YES', column_default: null, ordinal_position: 3, description: 'Contact email' },
      { table_name: 'customers', column_name: 'phone', data_type: 'text', is_nullable: 'YES', column_default: null, ordinal_position: 4, description: 'Contact phone' },
      { table_name: 'customers', column_name: 'address', data_type: 'text', is_nullable: 'YES', column_default: null, ordinal_position: 5, description: 'Customer address' }
    ];
  }

  private static getPredefinedRLSPolicies(): any[] {
    return [
      { table_name: 'organizations', policy_name: 'org_access', command: 'ALL', permissive: 'Yes', using_expression: 'EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.org_id = organizations.id)', check_expression: null, description: 'Users can access their own organization' },
      { table_name: 'profiles', policy_name: 'profiles_membership_access', command: 'SELECT', permissive: 'Yes', using_expression: '(is_user_admin() AND (org_id = get_user_org_id())) OR (org_id = get_user_org_id()) OR (id = auth.uid())', check_expression: null, description: 'Users can view profiles in their org or their own profile' },
      { table_name: 'profiles', policy_name: 'profile_self_update', command: 'UPDATE', permissive: 'Yes', using_expression: 'id = auth.uid()', check_expression: null, description: 'Users can update their own profile' },
      { table_name: 'customers', policy_name: 'customers_org_access', command: 'ALL', permissive: 'Yes', using_expression: 'EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.org_id = customers.org_id)', check_expression: null, description: 'Users can access customers in their organization' },
      { table_name: 'projects', policy_name: 'projects_org_access', command: 'ALL', permissive: 'Yes', using_expression: 'EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.org_id = projects.org_id)', check_expression: null, description: 'Users can access projects in their organization' },
      { table_name: 'memberships', policy_name: 'membership_org_access', command: 'ALL', permissive: 'Yes', using_expression: 'EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.org_id = memberships.org_id)', check_expression: null, description: 'Users can access memberships in their organization' },
      { table_name: 'user_invitations', policy_name: 'invitations_org_access', command: 'ALL', permissive: 'Yes', using_expression: 'EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.org_id = user_invitations.org_id)', check_expression: null, description: 'Users can access invitations in their organization' }
    ];
  }

  private static getPredefinedForeignKeys(): any[] {
    return [
      { table_name: 'profiles', column_name: 'org_id', foreign_table_name: 'organizations', foreign_column_name: 'id', constraint_name: 'profiles_org_id_fkey', relationship_type: 'Many-to-One' },
      { table_name: 'departments', column_name: 'org_id', foreign_table_name: 'organizations', foreign_column_name: 'id', constraint_name: 'departments_org_id_fkey', relationship_type: 'Many-to-One' },
      { table_name: 'departments', column_name: 'parent_id', foreign_table_name: 'departments', foreign_column_name: 'id', constraint_name: 'departments_parent_id_fkey', relationship_type: 'Many-to-One (Self)' },
      { table_name: 'projects', column_name: 'org_id', foreign_table_name: 'organizations', foreign_column_name: 'id', constraint_name: 'projects_org_id_fkey', relationship_type: 'Many-to-One' },
      { table_name: 'projects', column_name: 'customer_id', foreign_table_name: 'customers', foreign_column_name: 'id', constraint_name: 'projects_customer_id_fkey', relationship_type: 'Many-to-One' },
      { table_name: 'customers', column_name: 'org_id', foreign_table_name: 'organizations', foreign_column_name: 'id', constraint_name: 'customers_org_id_fkey', relationship_type: 'Many-to-One' },
      { table_name: 'memberships', column_name: 'org_id', foreign_table_name: 'organizations', foreign_column_name: 'id', constraint_name: 'memberships_org_id_fkey', relationship_type: 'Many-to-One' },
      { table_name: 'memberships', column_name: 'user_id', foreign_table_name: 'profiles', foreign_column_name: 'id', constraint_name: 'memberships_user_id_fkey', relationship_type: 'Many-to-One' },
      { table_name: 'work_orders', column_name: 'project_id', foreign_table_name: 'projects', foreign_column_name: 'id', constraint_name: 'work_orders_project_id_fkey', relationship_type: 'Many-to-One' },
      { table_name: 'time_entries', column_name: 'project_id', foreign_table_name: 'projects', foreign_column_name: 'id', constraint_name: 'time_entries_project_id_fkey', relationship_type: 'Many-to-One' },
      { table_name: 'quotes', column_name: 'customer_id', foreign_table_name: 'customers', foreign_column_name: 'id', constraint_name: 'quotes_customer_id_fkey', relationship_type: 'Many-to-One' }
    ];
  }
}