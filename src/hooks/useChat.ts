import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { 
  chatRoomsService, 
  chatMessagesService, 
  subscribeToRoom, 
  subscribeToRooms,
  ChatRoomWithMembers,
  ChatMessageWithSender
} from '@/services/chatService';
import { toast } from '@/hooks/use-toast';

export function useChat() {
  const { user, profile } = useAuth();
  const [rooms, setRooms] = useState<ChatRoomWithMembers[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoomWithMembers | null>(null);
  const [messages, setMessages] = useState<ChatMessageWithSender[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch rooms
  const fetchRooms = useCallback(async () => {
    if (!profile?.org_id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await chatRoomsService.getRooms(profile.org_id);
      setRooms(data);
    } catch (err) {
      console.error('Error fetching chat rooms:', err);
      setError('Failed to fetch chat rooms');
    } finally {
      setLoading(false);
    }
  }, [profile?.org_id]);

  // Fetch messages for a room
  const fetchMessages = useCallback(async (roomId: string) => {
    try {
      const data = await chatMessagesService.getMessages(roomId);
      setMessages(data.reverse()); // Reverse to show oldest first
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to fetch messages');
    }
  }, []);

  // Send a message
  const sendMessage = useCallback(async (content: string) => {
    if (!selectedRoom || !content.trim()) return;

    try {
      await chatMessagesService.sendMessage(selectedRoom.id, content);
      // Message will be added via real-time subscription
    } catch (err) {
      console.error('Error sending message:', err);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
    }
  }, [selectedRoom]);

  // Create a new room
  const createRoom = useCallback(async (name: string, description?: string, isPrivate = false) => {
    if (!profile?.org_id) return;

    try {
      await chatRoomsService.createRoom(profile.org_id, name, description, isPrivate);
      await fetchRooms(); // Refresh rooms list
      toast({
        title: 'Success',
        description: 'Channel created successfully',
      });
    } catch (err) {
      console.error('Error creating room:', err);
      toast({
        title: 'Error',
        description: 'Failed to create channel',
        variant: 'destructive',
      });
    }
  }, [profile?.org_id, fetchRooms]);

  // Join a room
  const joinRoom = useCallback(async (roomId: string) => {
    try {
      await chatRoomsService.joinRoom(roomId);
      await fetchRooms(); // Refresh rooms list
    } catch (err) {
      console.error('Error joining room:', err);
      toast({
        title: 'Error',
        description: 'Failed to join room',
        variant: 'destructive',
      });
    }
  }, [fetchRooms]);

  // Select a room
  const selectRoom = useCallback(async (room: ChatRoomWithMembers) => {
    setSelectedRoom(room);
    await fetchMessages(room.id);
  }, [fetchMessages]);

  // Real-time message subscription
  useEffect(() => {
    if (!selectedRoom) return;

    const unsubscribe = subscribeToRoom(selectedRoom.id, async (message) => {
      // Fetch sender info for the new message
      const { data: profile } = await supabase
        .from('profiles')
        .select('name, avatar_url')
        .eq('id', message.sender_id)
        .single();
      
      const messageWithSender: ChatMessageWithSender = {
        ...message,
        sender_name: profile?.name || 'Unknown User',
        sender_avatar: profile?.avatar_url || undefined
      };
      
      setMessages(prev => [...prev, messageWithSender]);
    });

    return unsubscribe;
  }, [selectedRoom]);

  // Real-time rooms subscription
  useEffect(() => {
    if (!profile?.org_id) return;

    const unsubscribe = subscribeToRooms(profile.org_id, () => {
      fetchRooms(); // Refresh rooms when changes occur
    });

    return unsubscribe;
  }, [profile?.org_id, fetchRooms]);

  // Initial load
  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  return {
    rooms,
    selectedRoom,
    messages,
    loading,
    error,
    sendMessage,
    createRoom,
    joinRoom,
    selectRoom,
    refetchRooms: fetchRooms,
  };
}