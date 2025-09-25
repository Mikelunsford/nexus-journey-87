import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, 
  Search, 
  Send, 
  Users, 
  MessageSquare, 
  Hash, 
  Star,
  MoreHorizontal,
  Paperclip,
  Smile,
  Phone,
  Video,
  Settings
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import { chatService, subscribeToMessages, ChatMessage, ChatThread } from '@/services/chatService';
import { supabase } from '@/integrations/supabase/client';

export default function MessagesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [includeTest, setIncludeTest] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [channels, setChannels] = useState<ChatThread[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useFallback, setUseFallback] = useState(false);
  const { user } = useAuth();
  const testSeedsEnabled = useFeatureFlag('ui.enable_test_seeds');

  // Fetch chat channels/threads
  useEffect(() => {
    const fetchChannels = async () => {
      if (!user?.org_id) return;

      try {
        setLoading(true);
        setError(null);
        
        const { data, error } = await supabase
          .from('chat_threads')
          .select('*')
          .eq('org_id', user.org_id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Supabase error:', error);
          // If it's a permission error or table doesn't exist, fall back to simple mode
          if (error.message.includes('permission') || error.message.includes('policy') || error.message.includes('does not exist')) {
            console.log('Chat system not available, using fallback mode');
            setUseFallback(true);
            setError(null);
            return;
          } else {
            throw error;
          }
        }
        
        setChannels(data || []);
        
        // Select first channel if none selected
        if (data && data.length > 0 && !selectedChannel) {
          setSelectedChannel(data[0].id);
        }
      } catch (error) {
        console.error('Error fetching channels:', error);
        setError('Failed to load chat channels. Check console for details.');
      } finally {
        setLoading(false);
      }
    };

    fetchChannels();
  }, [user?.org_id, includeTest, selectedChannel]);

  // Subscribe to messages for selected channel
  useEffect(() => {
    if (!selectedChannel) return;

    const unsubscribe = subscribeToMessages(selectedChannel, ({ type, message }) => {
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
  }, [selectedChannel]);

  // Filter channels based on search
  const filteredChannels = channels.filter(channel =>
    channel.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    channel.project_id?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Send message function
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChannel) return;

    try {
      const tempId = `temp_${Date.now()}`;
      const tempMessage: ChatMessage = {
        id: tempId,
        thread_id: selectedChannel,
        sender_id: user?.id || '',
        body: newMessage,
        attachments: [],
        created_at: new Date().toISOString(),
        edited_at: null,
        deleted_at: null
      };

      // Add temp message immediately for optimistic UI
      setMessages(prev => [...prev, tempMessage]);
      setNewMessage('');

      // Send to backend
      await chatService.sendMessage(selectedChannel, newMessage);
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove temp message on error
      setMessages(prev => prev.filter(m => m.id !== `temp_${Date.now()}`));
      setError('Failed to send message');
    }
  };

  // Create new channel
  const handleCreateChannel = async () => {
    if (!user?.org_id) return;
    
    try {
      const channelName = prompt('Enter channel name:');
      if (!channelName) return;

      // For now, create a dummy project ID for general channels
      // In a real implementation, you'd want to create a general project or modify the schema
      const dummyProjectId = '00000000-0000-0000-0000-000000000000';
      
      const { data, error } = await chatService.createThread(dummyProjectId, channelName, []);
      
      if (error) throw error;
      
      // Refresh channels list
      const { data: updatedChannels, error: fetchError } = await supabase
        .from('chat_threads')
        .select('*')
        .eq('org_id', user.org_id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setChannels(updatedChannels || []);
      setSelectedChannel(data.thread_id);
    } catch (error) {
      console.error('Error creating channel:', error);
      setError('Failed to create channel');
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const selectedChannelData = channels.find(c => c.id === selectedChannel);

  if (loading) {
    return (
      <div className="flex h-screen">
        <div className="w-80 bg-gray-50 border-r p-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-6 bg-gray-200 rounded"></div>
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex-1 p-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="space-y-2">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Fallback mode when chat system isn't available
  if (useFallback) {
    return (
      <div className="flex h-screen bg-white">
        {/* Left Sidebar - Simple Mode */}
        <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-semibold text-gray-900">Messages</h1>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>Simple Mode:</strong> Chat system is being set up. Basic messaging available.
              </p>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p className="text-sm text-gray-500">Chat channels will appear here</p>
                <p className="text-xs text-gray-400">Once the chat system is configured</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Area - Simple Mode */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Chat System Setup</h3>
            <p className="text-gray-500 mb-4">
              The advanced chat system is being configured. In the meantime, you can use the project-specific chat by navigating to a project.
            </p>
            <Button 
              onClick={() => window.location.href = '/dashboard/projects'}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Go to Projects
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white">
      {/* Left Sidebar - Channels */}
      <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold text-gray-900">Messages</h1>
            <Button
              size="sm"
              onClick={handleCreateChannel}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search channels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white"
            />
          </div>

          {/* Test Data Toggle */}
          {testSeedsEnabled && (
            <div className="flex items-center space-x-2 mt-3">
              <Switch
                id="include-test"
                checked={includeTest}
                onCheckedChange={setIncludeTest}
              />
              <Label htmlFor="include-test" className="text-sm">Include test data</Label>
            </div>
          )}
        </div>

        {/* Channels List */}
        <div className="flex-1 overflow-y-auto p-2">
          <div className="space-y-1">
            {filteredChannels.map((channel) => (
              <button
                key={channel.id}
                onClick={() => setSelectedChannel(channel.id)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  selectedChannel === channel.id
                    ? 'bg-blue-100 text-blue-900 border border-blue-200'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    channel.project_id ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {channel.project_id ? <Hash className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">
                      {channel.title || 'General Chat'}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {channel.project_id ? `Project ${channel.project_id}` : 'General discussion'}
                    </div>
                  </div>
                  {channel.id === selectedChannel && (
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  )}
                </div>
              </button>
            ))}
          </div>
          
          {filteredChannels.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No channels found</p>
              <p className="text-xs text-gray-400">Create your first channel to start chatting</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChannel ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                    {selectedChannelData?.project_id ? <Hash className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900">
                      {selectedChannelData?.title || 'General Chat'}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {selectedChannelData?.project_id ? `Project ${selectedChannelData.project_id}` : 'General discussion'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Phone className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Video className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                  {error}
                </div>
              )}
              
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Start a conversation</h3>
                  <p className="text-gray-500">Send a message to begin chatting in this channel</p>
                </div>
              ) : (
                messages
                  .sort((a, b) => a.created_at.localeCompare(b.created_at))
                  .map((message) => (
                    <div key={message.id} className="flex gap-3">
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarFallback className="text-xs">
                          {message.sender_id.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm text-gray-900">
                            {message.sender_id === user?.id ? 'You' : 'User'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatTime(message.created_at)}
                          </span>
                        </div>
                        <div className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                          {message.body}
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <form onSubmit={handleSendMessage} className="flex gap-3">
                <div className="flex-1 relative">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="pr-20"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                  />
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
                    <Button type="button" variant="ghost" size="sm" className="p-1">
                      <Paperclip className="w-4 h-4" />
                    </Button>
                    <Button type="button" variant="ghost" size="sm" className="p-1">
                      <Smile className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <Button 
                  type="submit" 
                  disabled={!newMessage.trim()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a channel</h3>
              <p className="text-gray-500">Choose a channel from the sidebar to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}