import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type DbLabel = Database['public']['Tables']['labels']['Row'];
type LabelInsert = Database['public']['Tables']['labels']['Insert'];

export async function getLabels(orgId: string, scope?: 'customer' | 'user' | 'org', includeTest = false) {
  let query = supabase
    .from('labels')
    .select('*')
    .eq('org_id', orgId)
    .is('deleted_at', null)
    .order('name', { ascending: true });

  if (scope) {
    query = query.eq('scope', scope);
  }

  // Filter out test data by default unless includeTest is true
  if (!includeTest) {
    query = query.or('is_test.is.null,is_test.eq.false');
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

export async function getLabelById(orgId: string, labelId: string) {
  const { data, error } = await supabase
    .from('labels')
    .select('*')
    .eq('org_id', orgId)
    .eq('id', labelId)
    .is('deleted_at', null)
    .single();

  if (error) throw error;
  return data;
}

export async function createLabel(orgId: string, labelData: Omit<LabelInsert, 'org_id'>) {
  const { data, error } = await supabase
    .from('labels')
    .insert({
      ...labelData,
      org_id: orgId,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateLabel(orgId: string, labelId: string, updates: Partial<DbLabel>) {
  const { data, error } = await supabase
    .from('labels')
    .update(updates)
    .eq('org_id', orgId)
    .eq('id', labelId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteLabel(orgId: string, labelId: string) {
  const { error } = await supabase
    .from('labels')
    .update({ deleted_at: new Date().toISOString() })
    .eq('org_id', orgId)
    .eq('id', labelId);

  if (error) throw error;
  return { success: true };
}

export async function getLabelStats(orgId: string) {
  try {
    const { count: totalCount } = await supabase
      .from('labels')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .or('is_test.is.null,is_test.eq.false')
      .is('deleted_at', null);

    const { count: customerCount } = await supabase
      .from('labels')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .eq('scope', 'customer')
      .or('is_test.is.null,is_test.eq.false')
      .is('deleted_at', null);

    const { count: userCount } = await supabase
      .from('labels')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .eq('scope', 'user')
      .or('is_test.is.null,is_test.eq.false')
      .is('deleted_at', null);

    const { count: orgCount } = await supabase
      .from('labels')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .eq('scope', 'org')
      .or('is_test.is.null,is_test.eq.false')
      .is('deleted_at', null);

    return {
      total: totalCount || 0,
      customer: customerCount || 0,
      user: userCount || 0,
      org: orgCount || 0,
    };
  } catch (error) {
    console.error('Error fetching label stats:', error);
    throw error;
  }
}

