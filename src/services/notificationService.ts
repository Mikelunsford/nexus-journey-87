import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type DbNotification = Database['public']['Tables']['notifications']['Row'];
type NotificationInsert = Database['public']['Tables']['notifications']['Insert'];

export interface NotificationData {
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'quote' | 'project' | 'shipment' | 'document' | 'team';
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, any>;
}

export async function getNotifications(orgId: string, userId: string, includeRead = false, limit = 50) {
  let query = supabase
    .from('notifications')
    .select('*')
    .eq('org_id', orgId)
    .eq('user_id', userId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (!includeRead) {
    query = query.eq('status', 'unread');
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function getNotificationStats(orgId: string, userId: string) {
  try {
    const { count: unreadCount } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .eq('user_id', userId)
      .eq('status', 'unread')
      .is('deleted_at', null);

    const { count: totalCount } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .eq('user_id', userId)
      .is('deleted_at', null);

    return {
      unread: unreadCount || 0,
      total: totalCount || 0,
    };
  } catch (error) {
    console.error('Error fetching notification stats:', error);
    throw error;
  }
}

export async function createNotification(orgId: string, userId: string, notificationData: NotificationData, createdBy?: string) {
  const { data, error } = await supabase
    .from('notifications')
    .insert({
      org_id: orgId,
      user_id: userId,
      title: notificationData.title,
      message: notificationData.message,
      type: notificationData.type,
      entity_type: notificationData.entityType,
      entity_id: notificationData.entityId,
      metadata: notificationData.metadata || {},
      created_by: createdBy,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function markAsRead(orgId: string, userId: string, notificationId: string) {
  const { data, error } = await supabase
    .from('notifications')
    .update({ 
      status: 'read',
      read_at: new Date().toISOString(),
    })
    .eq('org_id', orgId)
    .eq('user_id', userId)
    .eq('id', notificationId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function markAllAsRead(orgId: string, userId: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ 
      status: 'read',
      read_at: new Date().toISOString(),
    })
    .eq('org_id', orgId)
    .eq('user_id', userId)
    .eq('status', 'unread');

  if (error) throw error;
  return { success: true };
}

export async function deleteNotification(orgId: string, userId: string, notificationId: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ deleted_at: new Date().toISOString() })
    .eq('org_id', orgId)
    .eq('user_id', userId)
    .eq('id', notificationId);

  if (error) throw error;
  return { success: true };
}

// Business logic notification functions
export async function notifyQuoteStatusChange(orgId: string, quoteId: string, status: string, customerId: string) {
  const notificationData: NotificationData = {
    title: 'Quote Status Updated',
    message: `Quote status changed to ${status}`,
    type: 'quote',
    entityType: 'quotes',
    entityId: quoteId,
    metadata: { status, customerId },
  };

  // Notify customer
  await createNotification(orgId, customerId, notificationData);
}

export async function notifyProjectUpdate(orgId: string, projectId: string, updateType: string, teamMemberIds: string[]) {
  const notificationData: NotificationData = {
    title: 'Project Updated',
    message: `Project has been ${updateType}`,
    type: 'project',
    entityType: 'projects',
    entityId: projectId,
    metadata: { updateType },
  };

  // Notify all team members
  for (const memberId of teamMemberIds) {
    await createNotification(orgId, memberId, notificationData);
  }
}

export async function notifyShipmentUpdate(orgId: string, shipmentId: string, status: string, stakeholderIds: string[]) {
  const notificationData: NotificationData = {
    title: 'Shipment Update',
    message: `Shipment status changed to ${status}`,
    type: 'shipment',
    entityType: 'shipments',
    entityId: shipmentId,
    metadata: { status },
  };

  // Notify all stakeholders
  for (const stakeholderId of stakeholderIds) {
    await createNotification(orgId, stakeholderId, notificationData);
  }
}

export async function notifyDocumentUpload(orgId: string, documentId: string, documentName: string, projectId: string, teamMemberIds: string[]) {
  const notificationData: NotificationData = {
    title: 'New Document Uploaded',
    message: `Document "${documentName}" has been uploaded`,
    type: 'document',
    entityType: 'documents',
    entityId: documentId,
    metadata: { documentName, projectId },
  };

  // Notify all team members
  for (const memberId of teamMemberIds) {
    await createNotification(orgId, memberId, notificationData);
  }
}

export async function notifyTeamInvitation(orgId: string, invitedUserId: string, inviterName: string, projectId?: string) {
  const notificationData: NotificationData = {
    title: 'Team Invitation',
    message: `${inviterName} has invited you to join the team`,
    type: 'team',
    entityType: projectId ? 'projects' : 'organizations',
    entityId: projectId || orgId,
    metadata: { inviterName, projectId },
  };

  await createNotification(orgId, invitedUserId, notificationData);
}

// Real-time subscription for notifications
export function subscribeToNotifications(orgId: string, userId: string, onChange: (payload: { type: 'INSERT' | 'UPDATE'; notification: DbNotification }) => void) {
  const channel = supabase
    .channel(`notifications_${userId}`)
    .on('postgres_changes', { 
      event: '*', 
      schema: 'public', 
      table: 'notifications', 
      filter: `org_id=eq.${orgId} AND user_id=eq.${userId}` 
    }, (payload: any) => {
      const type = payload.eventType as 'INSERT' | 'UPDATE';
      onChange({ type, notification: payload.new as DbNotification });
    })
    .subscribe();
  
  return () => {
    supabase.removeChannel(channel);
  };
}

