import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type DbShipment = Database['public']['Tables']['shipments']['Row'];
type ShipmentInsert = Database['public']['Tables']['shipments']['Insert'];

export async function getShipments(orgId: string, includeTest = false, limit = 50) {
  let query = supabase
    .from('shipments')
    .select(`
      *,
      customers (
        name
      ),
      carriers (
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

export async function getShipmentById(orgId: string, shipmentId: string) {
  const { data, error } = await supabase
    .from('shipments')
    .select(`
      *,
      customers (
        name,
        email,
        phone
      ),
      carriers (
        name,
        contact_info
      )
    `)
    .eq('org_id', orgId)
    .eq('id', shipmentId)
    .is('deleted_at', null)
    .single();

  if (error) throw error;
  return data;
}

export async function createShipment(orgId: string, shipmentData: Omit<ShipmentInsert, 'org_id'>) {
  const { data, error } = await supabase
    .from('shipments')
    .insert({
      ...shipmentData,
      org_id: orgId,
    })
    .select(`
      *,
      customers (
        name
      ),
      carriers (
        name
      )
    `)
    .single();

  if (error) throw error;
  return data;
}

export async function updateShipment(orgId: string, shipmentId: string, updates: Partial<DbShipment>) {
  const { data, error } = await supabase
    .from('shipments')
    .update(updates)
    .eq('org_id', orgId)
    .eq('id', shipmentId)
    .select(`
      *,
      customers (
        name
      ),
      carriers (
        name
      )
    `)
    .single();

  if (error) throw error;
  return data;
}

export async function deleteShipment(orgId: string, shipmentId: string) {
  const { error } = await supabase
    .from('shipments')
    .update({ deleted_at: new Date().toISOString() })
    .eq('org_id', orgId)
    .eq('id', shipmentId);

  if (error) throw error;
  return { success: true };
}

export async function getShipmentStats(orgId: string) {
  try {
    const { count: totalCount } = await supabase
      .from('shipments')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .or('is_test.is.null,is_test.eq.false')
      .is('deleted_at', null);

    const { count: activeCount } = await supabase
      .from('shipments')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .in('status', ['created', 'in_transit'])
      .or('is_test.is.null,is_test.eq.false')
      .is('deleted_at', null);

    const { count: deliveredCount } = await supabase
      .from('shipments')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .eq('status', 'delivered')
      .or('is_test.is.null,is_test.eq.false')
      .is('deleted_at', null);

    return {
      total: totalCount || 0,
      active: activeCount || 0,
      delivered: deliveredCount || 0,
    };
  } catch (error) {
    console.error('Error fetching shipment stats:', error);
    throw error;
  }
}

