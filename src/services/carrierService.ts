import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type DbCarrierAppointment = Database['public']['Tables']['carrier_appointments']['Row'];
type CarrierAppointmentInsert = Database['public']['Tables']['carrier_appointments']['Insert'];

export async function getCarriers(orgId: string, includeTest = false, limit = 50) {
  let query = supabase
    .from('carrier_appointments')
    .select('*')
    .eq('org_id', orgId)
    .is('deleted_at', null)
    .order('window_start', { ascending: false })
    .limit(limit);

  // Filter out test data by default unless includeTest is true
  if (!includeTest) {
    query = query.or('is_test.is.null,is_test.eq.false');
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

export async function getCarrierById(orgId: string, carrierId: string) {
  const { data, error } = await supabase
    .from('carrier_appointments')
    .select('*')
    .eq('org_id', orgId)
    .eq('id', carrierId)
    .is('deleted_at', null)
    .single();

  if (error) throw error;
  return data;
}

export async function createCarrier(orgId: string, carrierData: Omit<CarrierAppointmentInsert, 'org_id'>) {
  const { data, error } = await supabase
    .from('carrier_appointments')
    .insert({
      ...carrierData,
      org_id: orgId,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateCarrier(orgId: string, carrierId: string, updates: Partial<DbCarrierAppointment>) {
  const { data, error } = await supabase
    .from('carrier_appointments')
    .update(updates)
    .eq('org_id', orgId)
    .eq('id', carrierId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteCarrier(orgId: string, carrierId: string) {
  const { error } = await supabase
    .from('carrier_appointments')
    .update({ deleted_at: new Date().toISOString() })
    .eq('org_id', orgId)
    .eq('id', carrierId);

  if (error) throw error;
  return { success: true };
}

export async function getCarrierStats(orgId: string) {
  try {
    const { count: totalCount } = await supabase
      .from('carrier_appointments')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .or('is_test.is.null,is_test.eq.false')
      .is('deleted_at', null);

    const { count: scheduledCount } = await supabase
      .from('carrier_appointments')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .eq('status', 'scheduled')
      .or('is_test.is.null,is_test.eq.false')
      .is('deleted_at', null);

    const { count: completedCount } = await supabase
      .from('carrier_appointments')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .eq('status', 'completed')
      .or('is_test.is.null,is_test.eq.false')
      .is('deleted_at', null);

    return {
      total: totalCount || 0,
      scheduled: scheduledCount || 0,
      completed: completedCount || 0,
    };
  } catch (error) {
    console.error('Error fetching carrier stats:', error);
    throw error;
  }
}

export async function getUpcomingCarriers(orgId: string, limit = 10) {
  const { data, error } = await supabase
    .from('carrier_appointments')
    .select('*')
    .eq('org_id', orgId)
    .gte('window_start', new Date().toISOString())
    .or('is_test.is.null,is_test.eq.false')
    .is('deleted_at', null)
    .order('window_start', { ascending: true })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

