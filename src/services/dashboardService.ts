import { supabase } from '@/integrations/supabase/client';

export interface DashboardCounts {
  activeProjects: number;
  pendingQuotes: number;
  activeShipments: number;
  teamMembers: number;
  customers: number;
}

export async function getDashboardCounts(orgId: string): Promise<DashboardCounts> {
  try {
    // Get active projects count (approved + in_progress status)
    const { count: activeProjectsCount } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .in('status', ['approved', 'in_progress'])
      .or('is_test.is.null,is_test.eq.false')
      .is('deleted_at', null);

    // Get pending quotes count (sent status)
    const { count: pendingQuotesCount } = await supabase
      .from('quotes')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .eq('status', 'sent')
      .or('is_test.is.null,is_test.eq.false')
      .is('deleted_at', null);

    // Get active shipments count (created + in_transit status)
    const { count: activeShipmentsCount } = await supabase
      .from('shipments')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .in('status', ['created', 'in_transit'])
      .or('is_test.is.null,is_test.eq.false')
      .is('deleted_at', null);

    // Get team members count (distinct users with active memberships)
    const { count: teamMembersCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .is('deleted_at', null);

    // Get customers count
    const { count: customersCount } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .is('deleted_at', null);

    return {
      activeProjects: activeProjectsCount || 0,
      pendingQuotes: pendingQuotesCount || 0,
      activeShipments: activeShipmentsCount || 0,
      teamMembers: teamMembersCount || 0,
      customers: customersCount || 0
    };
  } catch (error) {
    console.error('Error fetching dashboard counts:', error);
    throw error;
  }
}

export async function getActiveProjects(orgId: string, limit = 5) {
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

export async function getPendingQuotes(orgId: string, limit = 5) {
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

export async function getActiveShipments(orgId: string, limit = 5) {
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

export async function getTeamMembers(orgId: string, limit = 10) {
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