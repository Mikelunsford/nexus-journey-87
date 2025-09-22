import { supabase } from '@/integrations/supabase/client';
import { CSVExporter, CSVColumn } from './csvExporter';
import { format } from 'date-fns';

export class AppDataExporter {
  static async exportComprehensiveData(): Promise<void> {
    try {
      // Fetch all main application data
      const [
        orgsResult,
        profilesResult,
        departmentsResult,
        membershipsResult,
        invitationsResult,
        projectsResult,
        customersResult,
        quotesResult,
        workOrdersResult,
        shipmentsResult,
        messagesResult,
        notificationsResult,
        timeEntriesResult
      ] = await Promise.all([
        supabase.from('organizations').select('*'),
        supabase.from('profiles').select('*'),
        supabase.from('departments').select('*'),
        supabase.from('memberships').select(`
          *,
          organizations(name),
          profiles(name, email),
          departments(name)
        `),
        supabase.from('user_invitations').select('*'),
        supabase.from('projects').select(`
          *,
          customers(name),
          profiles!projects_owner_id_fkey(name)
        `),
        supabase.from('customers').select('*'),
        supabase.from('quotes').select(`
          *,
          customers(name),
          profiles!quotes_owner_id_fkey(name)
        `),
        supabase.from('work_orders').select(`
          *,
          projects(title),
          profiles!work_orders_owner_id_fkey(name),
          profiles!work_orders_assigned_to_fkey(name)
        `),
        supabase.from('shipments').select(`
          *,
          projects(title)
        `),
        supabase.from('messages').select('*'),
        supabase.from('notifications').select('*'),
        supabase.from('time_entries').select(`
          *,
          profiles(name),
          projects(title)
        `)
      ]);

      // Combine all data into a comprehensive export
      const allData = [
        ...this.formatTableData('organizations', orgsResult.data || []),
        ...this.formatTableData('profiles', profilesResult.data || []),
        ...this.formatTableData('departments', departmentsResult.data || []),
        ...this.formatTableData('memberships', membershipsResult.data || []),
        ...this.formatTableData('user_invitations', invitationsResult.data || []),
        ...this.formatTableData('projects', projectsResult.data || []),
        ...this.formatTableData('customers', customersResult.data || []),
        ...this.formatTableData('quotes', quotesResult.data || []),
        ...this.formatTableData('work_orders', workOrdersResult.data || []),
        ...this.formatTableData('shipments', shipmentsResult.data || []),
        ...this.formatTableData('messages', messagesResult.data || []),
        ...this.formatTableData('notifications', notificationsResult.data || []),
        ...this.formatTableData('time_entries', timeEntriesResult.data || [])
      ];

      const columns: CSVColumn[] = [
        { key: 'table_name', label: 'Table' },
        { key: 'record_id', label: 'ID' },
        { key: 'org_id', label: 'Organization ID' },
        { key: 'name_title', label: 'Name/Title' },
        { key: 'email_address', label: 'Email/Address' },
        { key: 'status', label: 'Status' },
        { key: 'created_at', label: 'Created At', formatter: CSVExporter.FORMATTERS.dateTime },
        { key: 'updated_at', label: 'Updated At', formatter: CSVExporter.FORMATTERS.dateTime },
        { key: 'created_by', label: 'Created By' },
        { key: 'department', label: 'Department' },
        { key: 'owner', label: 'Owner' },
        { key: 'version', label: 'Version' },
        { key: 'additional_data', label: 'Additional Data' }
      ];

      CSVExporter.downloadCSV({
        filename: 'team1_dashboard_complete_export',
        columns,
        data: allData,
        includeMetadata: true
      });

    } catch (error) {
      console.error('Export failed:', error);
      throw new Error('Failed to export application data');
    }
  }

  private static formatTableData(tableName: string, data: any[]): any[] {
    return data.map(record => ({
      table_name: tableName,
      record_id: record.id,
      org_id: record.org_id || '',
      name_title: record.name || record.title || record.subject || '',
      email_address: record.email || record.address || '',
      status: record.status || '',
      created_at: record.created_at ? new Date(record.created_at) : null,
      updated_at: record.updated_at ? new Date(record.updated_at) : null,
      created_by: record.created_by || '',
      department: record.departments?.name || record.department_id || '',
      owner: record.profiles?.name || record.owner_id || '',
      version: record.version || '',
      additional_data: this.formatAdditionalData(record, tableName)
    }));
  }

  private static formatAdditionalData(record: any, tableName: string): string {
    const excludeKeys = ['id', 'org_id', 'name', 'title', 'email', 'address', 'status', 
                        'created_at', 'updated_at', 'created_by', 'owner_id', 'department_id', 'version'];
    
    const additionalData: Record<string, any> = {};
    
    Object.keys(record).forEach(key => {
      if (!excludeKeys.includes(key) && record[key] !== null && record[key] !== undefined) {
        if (typeof record[key] === 'object' && !Array.isArray(record[key])) {
          additionalData[key] = JSON.stringify(record[key]);
        } else {
          additionalData[key] = record[key];
        }
      }
    });

    return Object.keys(additionalData).length > 0 
      ? Object.entries(additionalData).map(([k, v]) => `${k}: ${v}`).join(' | ')
      : '';
  }

  static async exportTableData(tableName: string): Promise<void> {
    try {
      // We'll handle specific tables we know exist
      let data: any[] = [];
      
      switch (tableName) {
        case 'organizations':
          const orgsResult = await supabase.from('organizations').select('*');
          data = orgsResult.data || [];
          break;
        case 'profiles':
          const profilesResult = await supabase.from('profiles').select('*');
          data = profilesResult.data || [];
          break;
        case 'projects':
          const projectsResult = await supabase.from('projects').select('*');
          data = projectsResult.data || [];
          break;
        case 'customers':
          const customersResult = await supabase.from('customers').select('*');
          data = customersResult.data || [];
          break;
        default:
          throw new Error(`Table ${tableName} not supported for export`);
      }
      
      if (data.length === 0) {
        throw new Error(`No data found in table: ${tableName}`);
      }

      // Generate columns dynamically based on the first record
      const columns: CSVColumn[] = Object.keys(data[0]).map(key => ({
        key,
        label: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        formatter: this.getFormatterForColumn(key)
      }));

      CSVExporter.downloadCSV({
        filename: `${tableName}_export`,
        columns,
        data,
        includeMetadata: true
      });

    } catch (error) {
      console.error(`Export failed for table ${tableName}:`, error);
      throw error;
    }
  }

  private static getFormatterForColumn(columnName: string): ((value: any) => string) | undefined {
    if (columnName.includes('_at') || columnName.includes('date')) {
      return CSVExporter.FORMATTERS.dateTime;
    }
    if (columnName.includes('amount') || columnName.includes('total') || columnName.includes('budget')) {
      return CSVExporter.FORMATTERS.currency;
    }
    if (columnName.includes('rate') && !columnName.includes('hourly_rate')) {
      return CSVExporter.FORMATTERS.percentage;
    }
    return undefined;
  }
}