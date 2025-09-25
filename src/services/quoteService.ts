import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type DbQuote = Database['public']['Tables']['quotes']['Row'];
type QuoteInsert = Database['public']['Tables']['quotes']['Insert'];

export async function getQuotes(orgId: string, includeTest = false, limit = 50) {
  let query = supabase
    .from('quotes')
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

export async function getQuoteById(orgId: string, quoteId: string) {
  const { data, error } = await supabase
    .from('quotes')
    .select(`
      *,
      customers (
        name,
        email,
        phone
      )
    `)
    .eq('org_id', orgId)
    .eq('id', quoteId)
    .is('deleted_at', null)
    .single();

  if (error) throw error;
  return data;
}

export async function createQuote(orgId: string, quoteData: Omit<QuoteInsert, 'org_id'>) {
  const { data, error } = await supabase
    .from('quotes')
    .insert({
      ...quoteData,
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

export async function updateQuote(orgId: string, quoteId: string, updates: Partial<DbQuote>) {
  const { data, error } = await supabase
    .from('quotes')
    .update(updates)
    .eq('org_id', orgId)
    .eq('id', quoteId)
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

export async function deleteQuote(orgId: string, quoteId: string) {
  const { error } = await supabase
    .from('quotes')
    .update({ deleted_at: new Date().toISOString() })
    .eq('org_id', orgId)
    .eq('id', quoteId);

  if (error) throw error;
  return { success: true };
}

export async function getQuoteStats(orgId: string) {
  try {
    const { count: totalCount } = await supabase
      .from('quotes')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .or('is_test.is.null,is_test.eq.false')
      .is('deleted_at', null);

    const { count: pendingCount } = await supabase
      .from('quotes')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .eq('status', 'sent')
      .or('is_test.is.null,is_test.eq.false')
      .is('deleted_at', null);

    const { count: approvedCount } = await supabase
      .from('quotes')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .eq('status', 'approved')
      .or('is_test.is.null,is_test.eq.false')
      .is('deleted_at', null);

    return {
      total: totalCount || 0,
      pending: pendingCount || 0,
      approved: approvedCount || 0,
    };
  } catch (error) {
    console.error('Error fetching quote stats:', error);
    throw error;
  }
}

