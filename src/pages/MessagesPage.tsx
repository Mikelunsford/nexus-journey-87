import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, 
  Search, 
  Send, 
  Hash,
  Users,
  Settings,
  Smile,
  Paperclip,
  MoreHorizontal,
  Clock
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useChat } from '@/hooks/useChat';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';

export default function MessagesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [newRoomName, setNewRoomName] = useState('');
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const { user, profile, loading: authLoading } = useAuth();
  const testSeedsEnabled = useFeatureFlag('ui.enable_test_seeds');
  
  const {
    rooms,
    selectedRoom, 
    messages,
    loading,
    error,
    sendMessage,
    createRoom,
    selectRoom
  } = useChat();

  // Wait for authentication to complete
  if (authLoading || !user || !profile) {
    return (
      <div className="flex h-screen bg-background">
        {/* Left Sidebar */}
        <div className="w-80 bg-muted/30 border-r border-border">
          <div className="p-4 space-y-4">
            <div className="h-8 bg-muted rounded animate-pulse"></div>
            <div className="h-6 bg-muted rounded animate-pulse"></div>
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-muted rounded animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Main Area */}
        <div className="flex-1 p-4">
          <div className="space-y-4">
            <div className="h-8 bg-muted rounded animate-pulse"></div>
            <div className="space-y-2">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="h-16 bg-muted rounded animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Filter rooms based on search
  const filteredRooms = rooms.filter(room =>
    room.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Send message function
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    await sendMessage(newMessage);
    setNewMessage('');
  };

  // Create room function
  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;

    await createRoom(newRoomName);
    setNewRoomName('');
    setShowCreateRoom(false);
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

  if (loading) {
    return (
      <div className="flex h-screen bg-background">
        {/* Left Sidebar */}
        <div className="w-80 bg-muted/30 border-r border-border">
          <div className="p-4 space-y-4">
            <div className="h-8 bg-muted rounded animate-pulse"></div>
            <div className="h-6 bg-muted rounded animate-pulse"></div>
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-muted rounded animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Main Area */}
        <div className="flex-1 p-4">
          <div className="space-y-4">
            <div className="h-8 bg-muted rounded animate-pulse"></div>
            <div className="space-y-2">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="h-16 bg-muted rounded animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Left Sidebar - Chat Rooms */}
      <div className="w-80 bg-muted/30 border-r border-border flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-foreground">Messages</h1>
            <Button
              size="sm"
              onClick={() => setShowCreateRoom(true)}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search channels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background"
            />
          </div>

          {/* Create Room Form */}
          {showCreateRoom && (
            <form onSubmit={handleCreateRoom} className="mt-4 space-y-2">
              <Input
                placeholder="Room name..."
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                className="bg-background"
                autoFocus
              />
              <div className="flex gap-2">
                <Button type="submit" size="sm" className="flex-1">
                  Create
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setShowCreateRoom(false);
                    setNewRoomName('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Rooms List */}
        <ScrollArea className="flex-1 p-2">
          <div className="space-y-1">
            {filteredRooms.map((room) => (
              <button
                key={room.id}
                onClick={() => selectRoom(room)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  selectedRoom?.id === room.id
                    ? 'bg-primary/20 text-primary border border-primary/30'
                    : 'hover:bg-muted text-foreground'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <Hash className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">
                      {room.name}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {room.member_count} members
                    </div>
                  </div>
                  {room.unread_count && room.unread_count > 0 && (
                    <Badge variant="secondary" className="bg-primary text-primary-foreground">
                      {room.unread_count}
                    </Badge>
                  )}
                </div>
              </button>
            ))}
          </div>
          
          {filteredRooms.length === 0 && !loading && (
            <div className="text-center py-8 text-muted-foreground">
              <Hash className="w-12 h-12 mx-auto mb-2 text-muted-foreground/50" />
              <p className="text-sm">No channels found</p>
              <p className="text-xs">Create your first channel to start chatting</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-3"
                onClick={() => setShowCreateRoom(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Channel
              </Button>
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedRoom ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-border bg-background">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <Hash className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h2 className="font-bold text-foreground">
                      {selectedRoom.name}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {selectedRoom.member_count} members • {selectedRoom.description || 'No description'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Users className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              {error && (
                <div className="bg-destructive/15 border border-destructive/30 text-destructive rounded-lg p-3 mb-4 text-sm">
                  {error}
                </div>
              )}
              
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <Hash className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-lg font-medium text-foreground mb-2">Welcome to #{selectedRoom.name}</h3>
                  <p className="text-muted-foreground">This is the beginning of your conversation in this channel</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div key={message.id} className="flex gap-3">
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarImage src={message.sender_avatar || undefined} />
                        <AvatarFallback className="text-xs">
                          {message.sender_name?.substring(0, 2).toUpperCase() || 'UN'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm text-foreground">
                            {message.sender_name || 'Unknown User'}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTime(message.created_at)}
                          </span>
                          {message.edited_at && (
                            <span className="text-xs text-muted-foreground">(edited)</span>
                          )}
                        </div>
                        <div className="text-sm text-foreground whitespace-pre-wrap break-words">
                          {message.content}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t border-border bg-background">
              <form onSubmit={handleSendMessage} className="flex gap-3">
                <div className="flex-1 relative">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={`Message #${selectedRoom.name}`}
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
                  className="bg-primary hover:bg-primary/90"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Hash className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-medium text-foreground mb-2">Select a channel</h3>
              <p className="text-muted-foreground">Choose a channel from the sidebar to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}