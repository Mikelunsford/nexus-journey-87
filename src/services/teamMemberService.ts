import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type DbProfile = Database['public']['Tables']['profiles']['Row'];
type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];

export async function getTeamMembers(orgId: string, includeTest = false, limit = 50) {
  let query = supabase
    .from('profiles')
    .select(`
      *,
      user_roles (
        role
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

export async function getTeamMemberById(orgId: string, memberId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      *,
      user_roles (
        role
      )
    `)
    .eq('org_id', orgId)
    .eq('id', memberId)
    .is('deleted_at', null)
    .single();

  if (error) throw error;
  return data;
}

export async function createTeamMember(orgId: string, memberData: Omit<ProfileInsert, 'org_id'>) {
  const { data, error } = await supabase
    .from('profiles')
    .insert({
      ...memberData,
      org_id: orgId,
    })
    .select(`
      *,
      user_roles (
        role
      )
    `)
    .single();

  if (error) throw error;
  return data;
}

export async function updateTeamMember(orgId: string, memberId: string, updates: Partial<DbProfile>) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('org_id', orgId)
    .eq('id', memberId)
    .select(`
      *,
      user_roles (
        role
      )
    `)
    .single();

  if (error) throw error;
  return data;
}

export async function deleteTeamMember(orgId: string, memberId: string) {
  const { error } = await supabase
    .from('profiles')
    .update({ deleted_at: new Date().toISOString() })
    .eq('org_id', orgId)
    .eq('id', memberId);

  if (error) throw error;
  return { success: true };
}

export async function getTeamMemberStats(orgId: string) {
  try {
    const { count: totalCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .or('is_test.is.null,is_test.eq.false')
      .is('deleted_at', null);

    const { count: activeCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .or('is_test.is.null,is_test.eq.false')
      .is('deleted_at', null);

    return {
      total: totalCount || 0,
      active: activeCount || 0,
    };
  } catch (error) {
    console.error('Error fetching team member stats:', error);
    throw error;
  }
}

