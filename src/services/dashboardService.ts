import { supabase } from '@/integrations/supabase/client';
import type { RoleBucket } from '@/lib/rbac/roleBuckets';

export interface DashboardCounts {
  activeProjects: number;
  pendingQuotes: number;
  activeShipments: number;
  teamMembers: number;
  customers: number;
}

export interface AdminDashboardCounts extends DashboardCounts {
  totalRevenue: number;
  totalTimeEntries: number;
  auditLogEntries: number;
}

export interface ManagementDashboardCounts extends DashboardCounts {
  totalRevenue: number;
  totalTimeEntries: number;
}

// Role-gated dashboard data access
export async function getDashboardData(orgId: string, userRole: RoleBucket): Promise<DashboardCounts | ManagementDashboardCounts | AdminDashboardCounts> {
  switch (userRole) {
    case 'admin':
      return getAdminDashboard(orgId);
    case 'management':
      return getManagementDashboard(orgId);
    case 'operational':
      return getOperationalDashboard(orgId);
    case 'external':
      return getExternalDashboard(orgId);
    default:
      return getExternalDashboard(orgId);
  }
}

// External users get minimal data
async function getExternalDashboard(orgId: string): Promise<DashboardCounts> {
  try {
    // External users only see their own projects
    const { count: activeProjectsCount } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .in('status', ['approved', 'in_progress'])
      .or('is_test.is.null,is_test.eq.false')
      .is('deleted_at', null);

    return {
      activeProjects: activeProjectsCount || 0,
      pendingQuotes: 0, // External users don't see quotes
      activeShipments: 0, // External users don't see shipments
      teamMembers: 0, // External users don't see team members
      customers: 0 // External users don't see customers
    };
  } catch (error) {
    console.error('Error fetching external dashboard:', error);
    throw error;
  }
}

// Operational users get operational data
async function getOperationalDashboard(orgId: string): Promise<DashboardCounts> {
  try {
    const [activeProjectsCount, pendingQuotesCount, activeShipmentsCount] = await Promise.all([
      supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .in('status', ['approved', 'in_progress'])
        .or('is_test.is.null,is_test.eq.false')
        .is('deleted_at', null),
      
      supabase
        .from('quotes')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .eq('status', 'sent')
        .or('is_test.is.null,is_test.eq.false')
        .is('deleted_at', null),
      
      supabase
        .from('shipments')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .in('status', ['created', 'in_transit'])
        .or('is_test.is.null,is_test.eq.false')
        .is('deleted_at', null)
    ]);

    return {
      activeProjects: activeProjectsCount.count || 0,
      pendingQuotes: pendingQuotesCount.count || 0,
      activeShipments: activeShipmentsCount.count || 0,
      teamMembers: 0, // Operational users don't see team member counts
      customers: 0 // Operational users don't see customer counts
    };
  } catch (error) {
    console.error('Error fetching operational dashboard:', error);
    throw error;
  }
}

// Management users get management data
async function getManagementDashboard(orgId: string): Promise<ManagementDashboardCounts> {
  try {
    const [activeProjectsCount, pendingQuotesCount, activeShipmentsCount, teamMembersCount, customersCount, timeEntriesData] = await Promise.all([
      supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .in('status', ['approved', 'in_progress'])
        .or('is_test.is.null,is_test.eq.false')
        .is('deleted_at', null),
      
      supabase
        .from('quotes')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .eq('status', 'sent')
        .or('is_test.is.null,is_test.eq.false')
        .is('deleted_at', null),
      
      supabase
        .from('shipments')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .in('status', ['created', 'in_transit'])
        .or('is_test.is.null,is_test.eq.false')
        .is('deleted_at', null),
      
      supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .is('deleted_at', null),
      
      supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .is('deleted_at', null),
      
      supabase
        .from('time_entries')
        .select('hours, hourly_rate, billable')
        .eq('org_id', orgId)
        .or('is_test.is.null,is_test.eq.false')
        .is('deleted_at', null)
    ]);

    // Calculate revenue from time entries
    const totalRevenue = timeEntriesData.data?.reduce((sum, entry) => {
      if (entry.billable && entry.hourly_rate) {
        return sum + (Number(entry.hours) * Number(entry.hourly_rate));
      }
      return sum;
    }, 0) || 0;

    return {
      activeProjects: activeProjectsCount.count || 0,
      pendingQuotes: pendingQuotesCount.count || 0,
      activeShipments: activeShipmentsCount.count || 0,
      teamMembers: teamMembersCount.count || 0,
      customers: customersCount.count || 0,
      totalRevenue,
      totalTimeEntries: timeEntriesData.data?.length || 0
    };
  } catch (error) {
    console.error('Error fetching management dashboard:', error);
    throw error;
  }
}

// Admin users get all data including audit logs
async function getAdminDashboard(orgId: string): Promise<AdminDashboardCounts> {
  try {
    const [activeProjectsCount, pendingQuotesCount, activeShipmentsCount, teamMembersCount, customersCount, timeEntriesData, auditLogCount] = await Promise.all([
      supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .in('status', ['approved', 'in_progress'])
        .or('is_test.is.null,is_test.eq.false')
        .is('deleted_at', null),
      
      supabase
        .from('quotes')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .eq('status', 'sent')
        .or('is_test.is.null,is_test.eq.false')
        .is('deleted_at', null),
      
      supabase
        .from('shipments')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .in('status', ['created', 'in_transit'])
        .or('is_test.is.null,is_test.eq.false')
        .is('deleted_at', null),
      
      supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .is('deleted_at', null),
      
      supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .is('deleted_at', null),
      
      supabase
        .from('time_entries')
        .select('hours, hourly_rate, billable')
        .eq('org_id', orgId)
        .or('is_test.is.null,is_test.eq.false')
        .is('deleted_at', null),
      
      supabase
        .from('audit_log')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', orgId)
    ]);

    // Calculate revenue from time entries
    const totalRevenue = timeEntriesData.data?.reduce((sum, entry) => {
      if (entry.billable && entry.hourly_rate) {
        return sum + (Number(entry.hours) * Number(entry.hourly_rate));
      }
      return sum;
    }, 0) || 0;

    return {
      activeProjects: activeProjectsCount.count || 0,
      pendingQuotes: pendingQuotesCount.count || 0,
      activeShipments: activeShipmentsCount.count || 0,
      teamMembers: teamMembersCount.count || 0,
      customers: customersCount.count || 0,
      totalRevenue,
      totalTimeEntries: timeEntriesData.data?.length || 0,
      auditLogEntries: auditLogCount.count || 0
    };
  } catch (error) {
    console.error('Error fetching admin dashboard:', error);
    throw error;
  }
}

// Legacy function for backward compatibility - now role-gated
export async function getDashboardCounts(orgId: string, userRole: RoleBucket = 'operational'): Promise<DashboardCounts> {
  const data = await getDashboardData(orgId, userRole);
  return {
    activeProjects: data.activeProjects,
    pendingQuotes: data.pendingQuotes,
    activeShipments: data.activeShipments,
    teamMembers: data.teamMembers,
    customers: data.customers
  };
}

// Role-gated data access functions
export async function getActiveProjects(orgId: string, userRole: RoleBucket, limit = 5) {
  // Only operational, management, and admin can see projects
  if (userRole === 'external') {
    return [];
  }

  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      customers (
        name
      )
    `)
    .eq('org_id', orgId)
    .in('status', ['approved', 'in_progress'])
    .or('is_test.is.null,is_test.eq.false')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

export async function getPendingQuotes(orgId: string, userRole: RoleBucket, limit = 5) {
  // Only operational, management, and admin can see quotes
  if (userRole === 'external') {
    return [];
  }

  const { data, error } = await supabase
    .from('quotes')
    .select(`
      *,
      customers (
        name
      )
    `)
    .eq('org_id', orgId)
    .eq('status', 'sent')
    .or('is_test.is.null,is_test.eq.false')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

export async function getActiveShipments(orgId: string, userRole: RoleBucket, limit = 5) {
  // Only operational, management, and admin can see shipments
  if (userRole === 'external') {
    return [];
  }

  const { data, error } = await supabase
    .from('shipments')
    .select(`
      *,
      projects (
        title,
        customers (
          name
        )
      )
    `)
    .eq('org_id', orgId)
    .in('status', ['created', 'in_transit'])
    .or('is_test.is.null,is_test.eq.false')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

export async function getTeamMembers(orgId: string, userRole: RoleBucket, limit = 10) {
  // Only management and admin can see team members
  if (userRole === 'external' || userRole === 'operational') {
    return [];
  }

  const { data, error } = await supabase
    .from('profiles')
    .select(`
      *,
      memberships (
        role_bucket,
        department_id,
        expires_at
      )
    `)
    .eq('org_id', orgId)
    .is('deleted_at', null)
    .order('name', { ascending: true })
    .limit(limit);

  if (error) throw error;
  return data || [];
}