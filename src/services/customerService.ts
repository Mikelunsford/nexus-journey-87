import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type DbCustomer = Database['public']['Tables']['customers']['Row'];
type CustomerInsert = Database['public']['Tables']['customers']['Insert'];

export async function getCustomers(orgId: string, includeTest = false, limit = 50) {
  let query = supabase
    .from('customers')
    .select('*')
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

export async function getCustomerById(orgId: string, customerId: string) {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('org_id', orgId)
    .eq('id', customerId)
    .is('deleted_at', null)
    .single();

  if (error) throw error;
  return data;
}

export async function createCustomer(orgId: string, customerData: Omit<CustomerInsert, 'org_id'>) {
  const { data, error } = await supabase
    .from('customers')
    .insert({
      ...customerData,
      org_id: orgId,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateCustomer(orgId: string, customerId: string, updates: Partial<DbCustomer>) {
  const { data, error } = await supabase
    .from('customers')
    .update(updates)
    .eq('org_id', orgId)
    .eq('id', customerId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteCustomer(orgId: string, customerId: string) {
  const { error } = await supabase
    .from('customers')
    .update({ deleted_at: new Date().toISOString() })
    .eq('org_id', orgId)
    .eq('id', customerId);

  if (error) throw error;
  return { success: true };
}

export async function getCustomerStats(orgId: string) {
  try {
    const { count: totalCount } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .or('is_test.is.null,is_test.eq.false')
      .is('deleted_at', null);

    const { count: activeCount } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .eq('status', 'active')
      .or('is_test.is.null,is_test.eq.false')
      .is('deleted_at', null);

    return {
      total: totalCount || 0,
      active: activeCount || 0,
    };
  } catch (error) {
    console.error('Error fetching customer stats:', error);
    throw error;
  }
}

