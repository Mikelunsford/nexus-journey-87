import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { chatService, subscribeToMessages, ChatMessage, ChatThread } from '@/services/chatService';
import { toast } from '@/hooks/use-toast';

export function useChat(projectId?: string) {
  const { user } = useAuth();
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [selectedThread, setSelectedThread] = useState<ChatThread | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch threads
  const fetchThreads = useCallback(async () => {
    if (!user?.org_id) return;

    try {
      setLoading(true);
      setError(null);
      const data = await chatService.getThreads(user.org_id, projectId);
      setThreads(data);
    } catch (err) {
      console.error('Error fetching chat threads:', err);
      setError('Failed to fetch chat threads');
    } finally {
      setLoading(false);
    }
  }, [user?.org_id, projectId]);

  // Fetch messages for a thread
  const fetchMessages = useCallback(async (threadId: string) => {
    try {
      const data = await chatService.getMessages(threadId);
      setMessages(data);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to fetch messages');
    }
  }, []);

  // Send a message
  const sendMessage = useCallback(async (threadId: string, body: string, attachments: any[] = []) => {
    try {
      await chatService.sendMessage(threadId, body, attachments);
    } catch (err) {
      console.error('Error sending message:', err);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
      throw err;
    }
  }, []);

  // Create a new thread
  const createThread = useCallback(async (title: string, participants: { user_id: string; role: 'customer' | 'team' }[] = []) => {
    if (!projectId) {
      throw new Error('Project ID is required to create a thread');
    }

    try {
      const result = await chatService.createThread(projectId, title, participants);
      await fetchThreads(); // Refresh threads list
      return result;
    } catch (err) {
      console.error('Error creating thread:', err);
      toast({
        title: 'Error',
        description: 'Failed to create thread',
        variant: 'destructive',
      });
      throw err;
    }
  }, [projectId, fetchThreads]);

  // Add participant to thread
  const addParticipant = useCallback(async (threadId: string, userId: string, role: 'customer' | 'team') => {
    try {
      await chatService.addParticipant(threadId, userId, role);
      await fetchThreads(); // Refresh threads list
    } catch (err) {
      console.error('Error adding participant:', err);
      toast({
        title: 'Error',
        description: 'Failed to add participant',
        variant: 'destructive',
      });
      throw err;
    }
  }, [fetchThreads]);

  // Mark thread as read
  const markAsRead = useCallback(async (threadId: string) => {
    try {
      await chatService.markRead(threadId);
    } catch (err) {
      console.error('Error marking thread as read:', err);
    }
  }, []);

  // Select a thread
  const selectThread = useCallback(async (thread: ChatThread) => {
    setSelectedThread(thread);
    await fetchMessages(thread.id);
    await markAsRead(thread.id);
  }, [fetchMessages, markAsRead]);

  // Real-time message subscription
  useEffect(() => {
    if (!selectedThread) return;

    const unsubscribe = subscribeToMessages(selectedThread.id, ({ type, message }) => {
      setMessages(prev => {
        const withoutTemp = prev.filter(m => !(m.id.startsWith('temp_') && type === 'INSERT'));
        const existingIdx = withoutTemp.findIndex(m => m.id === message.id);
        if (existingIdx >= 0) {
          const clone = withoutTemp.slice();
          clone[existingIdx] = message;
          return clone;
        }
        return [...withoutTemp, message];
      });
    });

    return unsubscribe;
  }, [selectedThread]);

  // Initial load
  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

  return {
    threads,
    selectedThread,
    messages,
    loading,
    error,
    sendMessage,
    createThread,
    addParticipant,
    selectThread,
    markAsRead,
    refetchThreads: fetchThreads,
  };
}

