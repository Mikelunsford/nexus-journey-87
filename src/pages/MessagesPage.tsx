import React, { useState } from 'react';
import QuickActionsGrid, { QAItem } from '@/components/ui/QuickActionsGrid';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Plus, Search, Send, Inbox, SendIcon, Archive, Star, UserPlus } from 'lucide-react';
import { useMessages } from '@/hooks/useMessages';
import { getMessageStats, getInboxMessages, getSentMessages, getStarredMessages } from '@/services/messageService';
import { useAuth } from '@/components/auth/AuthProvider';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import { useEffect, useState as useStateHook } from 'react';

export default function MessagesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [includeTest, setIncludeTest] = useState(false);
  const [messageStats, setMessageStats] = useState<any>(null);
  const [inboxMessages, setInboxMessages] = useState<any[]>([]);
  const [sentMessages, setSentMessages] = useState<any[]>([]);
  const [starredMessages, setStarredMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const testSeedsEnabled = useFeatureFlag('ui.enable_test_seeds');
  const { messages } = useMessages(includeTest);

  // Fetch live message data
  useEffect(() => {
    const fetchMessageData = async () => {
      if (!user?.org_id) return;

      try {
        setLoading(true);
        const [stats, inbox, sent, starred] = await Promise.all([
          getMessageStats(user.org_id),
          getInboxMessages(user.org_id),
          getSentMessages(user.org_id),
          getStarredMessages(user.org_id)
        ]);

        setMessageStats(stats);
        setInboxMessages(inbox);
        setSentMessages(sent);
        setStarredMessages(starred);
      } catch (error) {
        console.error('Error fetching message data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessageData();
  }, [user?.org_id, includeTest]);

  // Filter messages based on search
  const filteredInboxMessages = inboxMessages.filter(message =>
    message.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    message.body?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    message.from_email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSentMessages = sentMessages.filter(message =>
    message.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    message.body?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    message.to_emails?.some((email: string) => 
      email.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const filteredStarredMessages = starredMessages.filter(message =>
    message.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    message.body?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const quickActions: QAItem[] = [
    {
      label: 'Compose Message',
      to: '/dashboard/messages/compose',
      icon: <Plus className="w-4 h-4" />,
      caption: 'Send a new message'
    },
    {
      label: 'Team Chat',
      to: '/dashboard/messages/team',
      icon: <UserPlus className="w-4 h-4" />,
      caption: 'Join team discussions'
    },
    {
      label: 'Announcements',
      to: '/dashboard/messages/announcements',
      icon: <SendIcon className="w-4 h-4" />,
      caption: 'Company updates'
    },
    {
      label: 'Archived Messages',
      to: '/dashboard/messages/archive',
      icon: <Archive className="w-4 h-4" />,
      caption: 'View archived conversations'
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'default';
      case 'read': return 'secondary';
      case 'sent': return 'outline';
      default: return 'outline';
    }
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
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold t-primary">Messages</h1>
          <p className="t-dim mt-2">Loading messages...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="kpi animate-pulse">
              <div className="h-12 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold t-primary">Messages</h1>
        <p className="t-dim mt-2">Internal communication and messaging</p>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold t-primary mb-4">Quick Actions</h2>
        <QuickActionsGrid items={quickActions} />
      </div>

      {/* Live Message Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="kpi">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm t-dim">Unread</p>
              <p className="text-2xl font-bold t-primary">{messageStats?.unread ?? 0}</p>
            </div>
            <div className="w-12 h-12 bg-t1-blue/10 rounded-lg flex items-center justify-center">
              <Inbox className="w-6 h-6 t1-blue" />
            </div>
          </div>
        </div>
        <div className="kpi">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm t-dim">Starred</p>
              <p className="text-2xl font-bold t-primary">{messageStats?.starred ?? 0}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center">
              <Star className="w-6 h-6 text-yellow-500" />
            </div>
          </div>
        </div>
        <div className="kpi">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm t-dim">Sent Today</p>
              <p className="text-2xl font-bold t-primary">{messageStats?.sentToday ?? 0}</p>
            </div>
            <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
              <Send className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </div>
        <div className="kpi">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm t-dim">Archived</p>
              <p className="text-2xl font-bold t-primary">{messageStats?.archived ?? 0}</p>
            </div>
            <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
              <Archive className="w-6 h-6 text-purple-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Search and Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          {testSeedsEnabled && (
            <div className="flex items-center space-x-2">
              <Switch
                id="include-test"
                checked={includeTest}
                onCheckedChange={setIncludeTest}
              />
              <Label htmlFor="include-test">Include test data</Label>
            </div>
          )}
        </div>

        {/* Messages Tabs */}
        <Tabs defaultValue="inbox" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="inbox" className="flex items-center gap-2">
              <Inbox className="w-4 h-4" />
              Inbox ({filteredInboxMessages.length})
            </TabsTrigger>
            <TabsTrigger value="sent" className="flex items-center gap-2">
              <Send className="w-4 h-4" />
              Sent ({filteredSentMessages.length})
            </TabsTrigger>
            <TabsTrigger value="starred" className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              Starred ({filteredStarredMessages.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="inbox" className="space-y-4">
            {filteredInboxMessages.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Inbox className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold t-primary mb-2">No messages found</h3>
                  <p className="t-dim">
                    {searchQuery ? 'Try adjusting your search terms.' : 'Your inbox is empty.'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {filteredInboxMessages.map((message) => (
                  <Card key={message.id} className={`hover:shadow-md transition-shadow cursor-pointer ${message.status === 'draft' ? 'border-l-4 border-l-blue-500' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback>
                            {message.from_email ? message.from_email.substring(0, 2).toUpperCase() : 'ME'}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <h4 className={`font-medium ${message.status === 'draft' ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>
                                From: {message.from_email}
                              </h4>
                              {message.data && (message.data as any).starred && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                              <Badge variant={getStatusColor(message.status)}>
                                {message.status}
                              </Badge>
                            </div>
                            <span className="text-sm text-muted-foreground">{formatDate(message.created_at)}</span>
                          </div>
                          
                          <h5 className={`text-sm mb-1 ${message.status === 'draft' ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                            {message.subject}
                          </h5>
                          
                          <p className="text-sm text-muted-foreground truncate">
                            {message.body?.substring(0, 120)}...
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="sent" className="space-y-4">
            {filteredSentMessages.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Send className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold t-primary mb-2">No sent messages</h3>
                  <p className="t-dim">
                    {searchQuery ? 'No sent messages match your search.' : 'You haven\'t sent any messages yet.'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {filteredSentMessages.map((message) => (
                  <Card key={message.id} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-foreground">
                              To: {Array.isArray(message.to_emails) ? message.to_emails.join(', ') : message.to_emails}
                            </h4>
                            <Badge variant={getStatusColor(message.status)}>
                              {message.status}
                            </Badge>
                          </div>
                          
                          <h5 className="text-sm font-medium text-foreground mb-1">
                            {message.subject}
                          </h5>
                          
                          <p className="text-sm text-muted-foreground truncate">
                            {message.body?.substring(0, 120)}...
                          </p>
                        </div>
                        
                        <span className="text-sm text-muted-foreground">
                          {formatDate(message.sent_at || message.created_at)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="starred" className="space-y-4">
            {filteredStarredMessages.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Star className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold t-primary mb-2">No starred messages</h3>
                  <p className="t-dim">
                    {searchQuery ? 'No starred messages match your search.' : 'You haven\'t starred any messages yet.'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {filteredStarredMessages.map((message) => (
                  <Card key={message.id} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback>
                            {message.from_email ? message.from_email.substring(0, 2).toUpperCase() : 'ME'}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-foreground">From: {message.from_email}</h4>
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            </div>
                            <span className="text-sm text-muted-foreground">{formatDate(message.created_at)}</span>
                          </div>
                          
                          <h5 className="text-sm font-medium text-foreground mb-1">
                            {message.subject}
                          </h5>
                          
                          <p className="text-sm text-muted-foreground truncate">
                            {message.body?.substring(0, 120)}...
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}