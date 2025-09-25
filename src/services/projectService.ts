import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type DbProject = Database['public']['Tables']['projects']['Row'];
type ProjectInsert = Database['public']['Tables']['projects']['Insert'];

export async function getProjects(orgId: string, includeTest = false, limit = 50) {
  let query = supabase
    .from('projects')
    .select(`
      *,
      customers (
        name
      )
    `)
    .eq('org_id', orgId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(limit);

  // Filter out test data by default unless includeTest is true
  if (!includeTest) {
    query = query.or('is_test.is.null,is_test.eq.false');
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

export async function getProjectById(orgId: string, projectId: string) {
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      customers (
        name,
        email,
        phone
      )
    `)
    .eq('org_id', orgId)
    .eq('id', projectId)
    .is('deleted_at', null)
    .single();

  if (error) throw error;
  return data;
}

export async function createProject(orgId: string, projectData: Omit<ProjectInsert, 'org_id'>) {
  const { data, error } = await supabase
    .from('projects')
    .insert({
      ...projectData,
      org_id: orgId,
    })
    .select(`
      *,
      customers (
        name
      )
    `)
    .single();

  if (error) throw error;
  return data;
}

export async function updateProject(orgId: string, projectId: string, updates: Partial<DbProject>) {
  const { data, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('org_id', orgId)
    .eq('id', projectId)
    .select(`
      *,
      customers (
        name
      )
    `)
    .single();

  if (error) throw error;
  return data;
}

export async function deleteProject(orgId: string, projectId: string) {
  const { error } = await supabase
    .from('projects')
    .update({ deleted_at: new Date().toISOString() })
    .eq('org_id', orgId)
    .eq('id', projectId);

  if (error) throw error;
  return { success: true };
}

export async function getProjectStats(orgId: string) {
  try {
    const { count: totalCount } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .or('is_test.is.null,is_test.eq.false')
      .is('deleted_at', null);

    const { count: activeCount } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .in('status', ['approved', 'in_progress'])
      .or('is_test.is.null,is_test.eq.false')
      .is('deleted_at', null);

    const { count: completedCount } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .eq('status', 'completed')
      .or('is_test.is.null,is_test.eq.false')
      .is('deleted_at', null);

    return {
      total: totalCount || 0,
      active: activeCount || 0,
      completed: completedCount || 0,
    };
  } catch (error) {
    console.error('Error fetching project stats:', error);
    throw error;
  }
}

