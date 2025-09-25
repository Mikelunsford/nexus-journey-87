import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type DbTimeEntry = Database['public']['Tables']['time_entries']['Row'];
type TimeEntryInsert = Database['public']['Tables']['time_entries']['Insert'];

export async function getTimeEntries(orgId: string, userId?: string, dateRange?: { start: string; end: string }, includeTest = false, limit = 50) {
  let query = supabase
    .from('time_entries')
    .select(`
      *,
      projects (
        title,
        customers (
          name
        )
      ),
      work_orders (
        title
      )
    `)
    .eq('org_id', orgId)
    .is('deleted_at', null)
    .order('entry_date', { ascending: false })
    .limit(limit);

  // Filter by user if specified
  if (userId) {
    query = query.eq('user_id', userId);
  }

  // Filter by date range if specified
  if (dateRange) {
    query = query
      .gte('entry_date', dateRange.start)
      .lte('entry_date', dateRange.end);
  }

  // Filter out test data by default unless includeTest is true
  if (!includeTest) {
    query = query.or('is_test.is.null,is_test.eq.false');
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

export async function getTimeEntryById(orgId: string, timeEntryId: string) {
  const { data, error } = await supabase
    .from('time_entries')
    .select(`
      *,
      projects (
        title,
        customers (
          name
        )
      ),
      work_orders (
        title
      )
    `)
    .eq('org_id', orgId)
    .eq('id', timeEntryId)
    .is('deleted_at', null)
    .single();

  if (error) throw error;
  return data;
}

export async function createTimeEntry(orgId: string, timeEntryData: Omit<TimeEntryInsert, 'org_id'>) {
  const { data, error } = await supabase
    .from('time_entries')
    .insert({
      ...timeEntryData,
      org_id: orgId,
    })
    .select(`
      *,
      projects (
        title,
        customers (
          name
        )
      ),
      work_orders (
        title
      )
    `)
    .single();

  if (error) throw error;
  return data;
}

export async function updateTimeEntry(orgId: string, timeEntryId: string, updates: Partial<DbTimeEntry>) {
  const { data, error } = await supabase
    .from('time_entries')
    .update(updates)
    .eq('org_id', orgId)
    .eq('id', timeEntryId)
    .select(`
      *,
      projects (
        title,
        customers (
          name
        )
      ),
      work_orders (
        title
      )
    `)
    .single();

  if (error) throw error;
  return data;
}

export async function deleteTimeEntry(orgId: string, timeEntryId: string) {
  const { error } = await supabase
    .from('time_entries')
    .update({ deleted_at: new Date().toISOString() })
    .eq('org_id', orgId)
    .eq('id', timeEntryId);

  if (error) throw error;
  return { success: true };
}

export async function getTimeEntryStats(orgId: string, userId?: string, dateRange?: { start: string; end: string }) {
  try {
    let query = supabase
      .from('time_entries')
      .select('hours, billable, hourly_rate, entry_date')
      .eq('org_id', orgId)
      .or('is_test.is.null,is_test.eq.false')
      .is('deleted_at', null);

    // Filter by user if specified
    if (userId) {
      query = query.eq('user_id', userId);
    }

    // Filter by date range if specified
    if (dateRange) {
      query = query
        .gte('entry_date', dateRange.start)
        .lte('entry_date', dateRange.end);
    }

    const { data, error } = await query;

    if (error) throw error;

    const entries = data || [];
    const totalHours = entries.reduce((sum, entry) => sum + Number(entry.hours), 0);
    const billableHours = entries
      .filter(entry => entry.billable)
      .reduce((sum, entry) => sum + Number(entry.hours), 0);
    
    const totalRevenue = entries
      .filter(entry => entry.billable && entry.hourly_rate)
      .reduce((sum, entry) => sum + (Number(entry.hours) * Number(entry.hourly_rate)), 0);

    return {
      totalHours,
      billableHours,
      nonBillableHours: totalHours - billableHours,
      totalRevenue,
      entryCount: entries.length,
    };
  } catch (error) {
    console.error('Error fetching time entry stats:', error);
    throw error;
  }
}

export async function getTimeEntriesByProject(orgId: string, projectId: string, dateRange?: { start: string; end: string }) {
  let query = supabase
    .from('time_entries')
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
    .eq('project_id', projectId)
    .or('is_test.is.null,is_test.eq.false')
    .is('deleted_at', null)
    .order('entry_date', { ascending: false });

  // Filter by date range if specified
  if (dateRange) {
    query = query
      .gte('entry_date', dateRange.start)
      .lte('entry_date', dateRange.end);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

export async function getTimeEntriesByUser(orgId: string, userId: string, dateRange?: { start: string; end: string }) {
  let query = supabase
    .from('time_entries')
    .select(`
      *,
      projects (
        title,
        customers (
          name
        )
      ),
      work_orders (
        title
      )
    `)
    .eq('org_id', orgId)
    .eq('user_id', userId)
    .or('is_test.is.null,is_test.eq.false')
    .is('deleted_at', null)
    .order('entry_date', { ascending: false });

  // Filter by date range if specified
  if (dateRange) {
    query = query
      .gte('entry_date', dateRange.start)
      .lte('entry_date', dateRange.end);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

