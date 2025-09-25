import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { getInboxMessages, getMessageStats } from '@/services/messageService';
import { Database } from '@/integrations/supabase/types';

type DbMessage = Database['public']['Tables']['messages']['Row'];

export function useMessages(includeTest = false) {
  const [messages, setMessages] = useState<DbMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchMessages = async () => {
    if (!user?.org_id) {
      setLoading(false);
      return;
    }

    try {
      const data = await getInboxMessages(user.org_id);
      setMessages(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  };

  // Real-time subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('messages-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `org_id=eq.${user.org_id}`
        },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  useEffect(() => {
    fetchMessages();
  }, [user, includeTest]);

  // Helper functions for message statistics
  const getMessageStatsLocal = () => {
    const today = new Date().toISOString().split('T')[0];
    
    return {
      unread: messages.filter(m => m.status === 'draft' || m.status === 'sent').length,
      starred: messages.filter(m => m.data && (m.data as any).starred).length,
      sentToday: messages.filter(m => 
        m.status === 'sent' && 
        m.sent_at && 
        m.sent_at.startsWith(today)
      ).length,
      archived: messages.filter(m => m.status === 'archived').length
    };
  };

  return {
    messages,
    loading,
    error,
    getMessageStats: getMessageStatsLocal,
    refetch: fetchMessages
  };
}