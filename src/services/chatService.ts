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


