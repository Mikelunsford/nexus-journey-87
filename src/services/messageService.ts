import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type DbMessage = Database['public']['Tables']['messages']['Row'];
type MessageInsert = Database['public']['Tables']['messages']['Insert'];

export interface MessageStats {
  unread: number;
  starred: number;
  sentToday: number;
  archived: number;
}

export async function getMessageStats(orgId: string): Promise<MessageStats> {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Get unread messages count (draft or sent status)
    const { count: unreadCount } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .in('status', ['draft', 'sent'])
      .or('is_test.is.null,is_test.eq.false')
      .is('deleted_at', null);

    // Get starred messages count (assuming starred flag is in data jsonb)
    const { data: starredData } = await supabase
      .from('messages')
      .select('data')
      .eq('org_id', orgId)
      .or('is_test.is.null,is_test.eq.false')
      .is('deleted_at', null);

    const starredCount = starredData?.filter(m => 
      m.data && typeof m.data === 'object' && (m.data as any).starred
    ).length || 0;

    // Get messages sent today count
    const { count: sentTodayCount } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .eq('status', 'sent')
      .gte('sent_at', `${today}T00:00:00.000Z`)
      .lt('sent_at', `${today}T23:59:59.999Z`)
      .or('is_test.is.null,is_test.eq.false')
      .is('deleted_at', null);

    // Get archived messages count
    const { count: archivedCount } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .eq('status', 'archived')
      .or('is_test.is.null,is_test.eq.false')
      .is('deleted_at', null);

    return {
      unread: unreadCount || 0,
      starred: starredCount,
      sentToday: sentTodayCount || 0,
      archived: archivedCount || 0
    };
  } catch (error) {
    console.error('Error fetching message stats:', error);
    throw error;
  }
}

export async function getInboxMessages(orgId: string, limit = 20) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('org_id', orgId)
    .in('status', ['draft', 'sent', 'delivered'])
    .or('is_test.is.null,is_test.eq.false')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

export async function getSentMessages(orgId: string, limit = 20) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('org_id', orgId)
    .in('status', ['sent', 'delivered', 'read'])
    .or('is_test.is.null,is_test.eq.false')
    .is('deleted_at', null)
    .order('sent_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

export async function getStarredMessages(orgId: string, limit = 20) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('org_id', orgId)
    .or('is_test.is.null,is_test.eq.false')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  
  // Filter starred messages on the client side since we can't easily query JSONB
  return (data || []).filter(message => 
    message.data && 
    typeof message.data === 'object' && 
    (message.data as any).starred
  );
}

export async function createMessage(messageData: MessageInsert) {
  const { data, error } = await supabase
    .from('messages')
    .insert(messageData)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateMessage(id: string, updates: Partial<DbMessage>) {
  const { data, error } = await supabase
    .from('messages')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}