import { supabase } from '@/integrations/supabase/client';

export type ChatAttachment = {
  path: string;
  name: string;
  size: number;
  mime: string;
};

export type ChatMessage = {
  id: string;
  thread_id: string;
  sender_id: string;
  body: string;
  attachments: ChatAttachment[];
  created_at: string;
  edited_at: string | null;
  deleted_at: string | null;
};

export type ChatThread = {
  id: string;
  org_id: string;
  project_id: string;
  title: string | null;
  created_by: string;
  created_at: string;
};

export const chatService = {
  async createThread(projectId: string, title: string, participants: { user_id: string; role: 'customer' | 'team' }[]) {
    const { data, error } = await supabase.rpc('chat_thread_create', {
      project_id: projectId,
      title,
      participants,
    } as any);
    if (error) throw error;
    return data as { thread_id: string };
  },

  async addParticipant(threadId: string, userId: string, role: 'customer' | 'team') {
    const { error } = await supabase.rpc('chat_participant_add', { thread_id: threadId, user_id: userId, role } as any);
    if (error) throw error;
    return { ok: true } as const;
  },

  async sendMessage(threadId: string, body: string, attachments: ChatAttachment[] = []) {
    const { data, error } = await supabase.rpc('chat_message_send', { thread_id: threadId, body, attachments } as any);
    if (error) throw error;
    return data as { message_id: string };
  },

  async markRead(threadId: string) {
    const { error } = await supabase.rpc('chat_mark_read', { thread_id: threadId } as any);
    if (error) throw error;
    return { ok: true } as const;
  },

  async signFiles(paths: string[]) {
    const { data, error } = await supabase.rpc('chat_files_sign', { paths } as any);
    if (error) throw error;
    return data as { path: string; url: string; expires: string }[];
  },

  async getThreads(orgId: string, projectId?: string) {
    let query = supabase
      .from('chat_threads')
      .select(`
        *,
        chat_participants (
          user_id,
          role
        )
      `)
      .eq('org_id', orgId)
      .order('created_at', { ascending: false });

    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async getMessages(threadId: string, limit = 50) {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('thread_id', threadId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []).reverse();
  },

  async getParticipants(threadId: string) {
    const { data, error } = await supabase
      .from('chat_participants')
      .select(`
        *,
        profiles (
          id,
          name,
          email
        )
      `)
      .eq('thread_id', threadId);

    if (error) throw error;
    return data || [];
  },

  async removeParticipant(threadId: string, userId: string) {
    const { error } = await supabase
      .from('chat_participants')
      .delete()
      .eq('thread_id', threadId)
      .eq('user_id', userId);

    if (error) throw error;
    return { success: true };
  },

  async updateThread(threadId: string, updates: { title?: string }) {
    const { data, error } = await supabase
      .from('chat_threads')
      .update(updates)
      .eq('id', threadId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteThread(threadId: string) {
    const { error } = await supabase
      .from('chat_threads')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', threadId);

    if (error) throw error;
    return { success: true };
  },
};

export function subscribeToMessages(threadId: string, onChange: (payload: { type: 'INSERT' | 'UPDATE'; message: ChatMessage }) => void) {
  const channel = supabase
    .channel(`chat_messages_${threadId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_messages', filter: `thread_id=eq.${threadId}` }, (payload: any) => {
      const type = payload.eventType as 'INSERT' | 'UPDATE';
      onChange({ type, message: payload.new as ChatMessage });
    })
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}


