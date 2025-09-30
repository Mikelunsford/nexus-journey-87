import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type ChatRoom = Database['public']['Tables']['chat_rooms']['Row'];
type ChatMessage = Database['public']['Tables']['chat_messages']['Row'];
type ChatRoomMember = Database['public']['Tables']['chat_room_members']['Row'];

export interface ChatRoomWithMembers extends ChatRoom {
  member_count?: number;
  unread_count?: number;
  last_message?: Partial<ChatMessage>;
}

export interface ChatMessageWithSender extends ChatMessage {
  sender_name?: string;
  sender_avatar?: string;
}

// Chat Rooms Service
export const chatRoomsService = {
  // Get all rooms for current user's org
  async getRooms(orgId: string): Promise<ChatRoomWithMembers[]> {
    const { data, error } = await supabase
      .from('chat_rooms')
      .select(`
        *,
        chat_room_members(user_id),
        chat_messages(
          id,
          content,
          created_at,
          sender_id
        )
      `)
      .eq('org_id', orgId)
      .is('deleted_at', null)
      .order('updated_at', { ascending: false });

    if (error) throw error;

    return data?.map(room => ({
      ...room,
      member_count: (room as any).chat_room_members?.length || 0,
      last_message: (room as any).chat_messages?.[0] || undefined,
      unread_count: 0 // TODO: Calculate based on last_read_at
    })) || [];
  },

  // Create a new room
  async createRoom(orgId: string, name: string, description?: string, isPrivate = false): Promise<ChatRoom> {
    const userId = (await supabase.auth.getUser()).data.user?.id!;
    const { data, error } = await supabase
      .from('chat_rooms')
      .insert({
        org_id: orgId,
        name,
        description,
        is_private: isPrivate,
        type: 'channel',
        created_by: userId
      })
      .select()
      .single();

    if (error) throw error;

    // Add creator as room owner
    await this.addMember(data.id, data.created_by!, 'owner');

    return data;
  },

  // Add member to room
  async addMember(roomId: string, userId: string, role: 'owner' | 'admin' | 'member' = 'member'): Promise<void> {
    const { error } = await supabase
      .from('chat_room_members')
      .insert({
        room_id: roomId,
        user_id: userId,
        role
      });

    if (error) throw error;
  },

  // Join a public room
  async joinRoom(roomId: string): Promise<void> {
    const { error } = await supabase
      .from('chat_room_members')
      .insert({
        room_id: roomId,
        user_id: (await supabase.auth.getUser()).data.user?.id!,
        role: 'member'
      });

    if (error) throw error;
  }
};

// Chat Messages Service
export const chatMessagesService = {
  // Get messages for a room
  async getMessages(roomId: string, limit = 50): Promise<ChatMessageWithSender[]> {
    const { data: messages, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('room_id', roomId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    if (!messages || messages.length === 0) return [];

    // Get unique sender IDs
    const senderIds = [...new Set(messages.map(m => m.sender_id))];

    // Fetch all sender profiles
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, name, avatar_url')
      .in('id', senderIds);

    if (profileError) throw profileError;

    // Create a map of profiles for quick lookup
    const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

    return messages.map(msg => {
      const profile = profileMap.get(msg.sender_id);
      return {
        ...msg,
        sender_name: profile?.name || 'Unknown User',
        sender_avatar: profile?.avatar_url || undefined
      };
    });
  },

  // Send a message
  async sendMessage(roomId: string, content: string, messageType: 'text' | 'file' | 'image' = 'text'): Promise<ChatMessage> {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        room_id: roomId,
        sender_id: (await supabase.auth.getUser()).data.user?.id!,
        content,
        message_type: messageType
      })
      .select()
      .single();

    if (error) throw error;

    // Update room's updated_at timestamp
    await supabase
      .from('chat_rooms')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', roomId);

    return data;
  },

  // Edit a message
  async editMessage(messageId: string, content: string): Promise<void> {
    const { error } = await supabase
      .from('chat_messages')
      .update({
        content,
        edited_at: new Date().toISOString()
      })
      .eq('id', messageId);

    if (error) throw error;
  },

  // Delete a message
  async deleteMessage(messageId: string): Promise<void> {
    const { error } = await supabase
      .from('chat_messages')
      .update({
        deleted_at: new Date().toISOString()
      })
      .eq('id', messageId);

    if (error) throw error;
  }
};

// Real-time subscriptions
export const subscribeToRoom = (roomId: string, callback: (message: ChatMessage) => void) => {
  const channel = supabase
    .channel(`room_${roomId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'chat_messages',
        filter: `room_id=eq.${roomId}`
      },
      (payload) => {
        if (payload.eventType === 'INSERT') {
          callback(payload.new as ChatMessage);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

export const subscribeToRooms = (orgId: string, callback: (room: ChatRoom) => void) => {
  const channel = supabase
    .channel(`org_rooms_${orgId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'chat_rooms',
        filter: `org_id=eq.${orgId}`
      },
      (payload) => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          callback(payload.new as ChatRoom);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};