import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type DbDocument = Database['public']['Tables']['documents']['Row'];
type DocumentInsert = Database['public']['Tables']['documents']['Insert'];

export async function getDocuments(orgId: string, includeTest = false, limit = 50) {
  let query = supabase
    .from('documents')
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

export async function getDocumentsByEntity(
  orgId: string, 
  entityType: string, 
  entityId: string, 
  includeTest = false
) {
  let query = supabase
    .from('documents')
    .select('*')
    .eq('org_id', orgId)
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  // Filter out test data by default unless includeTest is true
  if (!includeTest) {
    query = query.or('is_test.is.null,is_test.eq.false');
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

export async function getDocumentStats(orgId: string) {
  try {
    // Get total documents count
    const { count: totalCount } = await supabase
      .from('documents')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .or('is_test.is.null,is_test.eq.false')
      .is('deleted_at', null);

    // Get documents by type
    const { data: typeData } = await supabase
      .from('documents')
      .select('mime_type')
      .eq('org_id', orgId)
      .or('is_test.is.null,is_test.eq.false')
      .is('deleted_at', null);

    const typeStats = typeData?.reduce((acc, doc) => {
      const type = doc.mime_type.split('/')[0]; // Get main type (image, document, etc.)
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    // Get total size
    const { data: sizeData } = await supabase
      .from('documents')
      .select('size_bytes')
      .eq('org_id', orgId)
      .or('is_test.is.null,is_test.eq.false')
      .is('deleted_at', null);

    const totalSize = sizeData?.reduce((acc, doc) => acc + (doc.size_bytes || 0), 0) || 0;

    return {
      total: totalCount || 0,
      byType: typeStats,
      totalSize
    };
  } catch (error) {
    console.error('Error fetching document stats:', error);
    throw error;
  }
}

export async function createDocument(documentData: DocumentInsert) {
  const { data, error } = await supabase
    .from('documents')
    .insert(documentData)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateDocument(id: string, updates: Partial<DbDocument>) {
  const { data, error } = await supabase
    .from('documents')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteDocument(id: string) {
  const { error } = await supabase
    .from('documents')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw error;
}