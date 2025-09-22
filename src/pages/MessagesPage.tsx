import React, { useState } from 'react';
import PageSection from '@/components/layout/PageSection';
import QuickActionsGrid, { QAItem } from '@/components/ui/QuickActionsGrid';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Plus, Search, Send, Inbox, SendIcon, Archive, Star, UserPlus } from 'lucide-react';

export default function MessagesPage() {
  const [searchQuery, setSearchQuery] = useState('');

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

  const inboxMessages = [
    {
      id: '1',
      sender: 'Alice Johnson',
      avatar: '/placeholder.svg',
      subject: 'Project Update - Q4 Deliverables',
      preview: 'Hey team, I wanted to share the latest updates on our Q4 deliverables...',
      time: '10:30 AM',
      unread: true,
      starred: true,
      priority: 'high'
    },
    {
      id: '2',
      sender: 'Bob Smith',
      avatar: '/placeholder.svg',
      subject: 'Budget Review Meeting',
      preview: 'Can we schedule a meeting to review the budget for next quarter?',
      time: '9:15 AM',
      unread: true,
      starred: false,
      priority: 'medium'
    },
    {
      id: '3',
      sender: 'Carol Davis',
      avatar: '/placeholder.svg',
      subject: 'Client Feedback Summary',
      preview: 'Attached is the summary of client feedback from last week\'s presentation...',
      time: 'Yesterday',
      unread: false,
      starred: true,
      priority: 'low'
    },
    {
      id: '4',
      sender: 'David Wilson',
      avatar: '/placeholder.svg',
      subject: 'Technical Documentation Update',
      preview: 'I\'ve updated the technical documentation with the latest API changes...',
      time: 'Yesterday',
      unread: false,
      starred: false,
      priority: 'medium'
    }
  ];

  const sentMessages = [
    {
      id: '5',
      recipient: 'Engineering Team',
      subject: 'Code Review Guidelines',
      preview: 'Please review the updated code review guidelines in the team handbook...',
      time: '2:45 PM',
      status: 'delivered'
    },
    {
      id: '6',
      recipient: 'Project Managers',
      subject: 'Weekly Status Report',
      preview: 'Attached is this week\'s status report for all active projects...',
      time: '11:20 AM',
      status: 'read'
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

  return (
    <PageSection
      title="Messages"
      subtitle="Internal communication and messaging"
      actions={
        <div className="flex gap-3">
          <QuickActionsGrid items={quickActions} />
        </div>
      }
    >
      <div className="space-y-6">
        {/* Message Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Inbox className="w-4 h-4" />
                Unread
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">8</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Star className="w-4 h-4" />
                Starred
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="kpi-value">12</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Send className="w-4 h-4" />
                Sent Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="kpi-value">15</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Archive className="w-4 h-4" />
                Archived
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="kpi-value">156</div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Messages Tabs */}
        <Tabs defaultValue="inbox" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="inbox" className="flex items-center gap-2">
              <Inbox className="w-4 h-4" />
              Inbox
            </TabsTrigger>
            <TabsTrigger value="sent" className="flex items-center gap-2">
              <Send className="w-4 h-4" />
              Sent
            </TabsTrigger>
            <TabsTrigger value="starred" className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              Starred
            </TabsTrigger>
          </TabsList>

          <TabsContent value="inbox" className="space-y-4">
            <div className="space-y-2">
              {inboxMessages.map((message) => (
                <Card key={message.id} className={`hover:shadow-md transition-shadow cursor-pointer ${message.unread ? 'border-l-4 border-l-blue-500' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={message.avatar} alt={message.sender} />
                        <AvatarFallback>{message.sender.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <h4 className={`font-medium ${message.unread ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>
                              {message.sender}
                            </h4>
                            {message.starred && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                            <Badge variant={getPriorityColor(message.priority)}>
                              {message.priority}
                            </Badge>
                          </div>
                          <span className="text-sm text-muted-foreground">{message.time}</span>
                        </div>
                        
                        <h5 className={`text-sm mb-1 ${message.unread ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                          {message.subject}
                        </h5>
                        
                        <p className="text-sm text-muted-foreground truncate">
                          {message.preview}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="sent" className="space-y-4">
            <div className="space-y-2">
              {sentMessages.map((message) => (
                <Card key={message.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-foreground">To: {message.recipient}</h4>
                          <Badge variant={getStatusColor(message.status)}>
                            {message.status}
                          </Badge>
                        </div>
                        
                        <h5 className="text-sm font-medium text-foreground mb-1">
                          {message.subject}
                        </h5>
                        
                        <p className="text-sm text-muted-foreground truncate">
                          {message.preview}
                        </p>
                      </div>
                      
                      <span className="text-sm text-muted-foreground">{message.time}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="starred" className="space-y-4">
            <div className="space-y-2">
              {inboxMessages.filter(msg => msg.starred).map((message) => (
                <Card key={message.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={message.avatar} alt={message.sender} />
                        <AvatarFallback>{message.sender.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-foreground">{message.sender}</h4>
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          </div>
                          <span className="text-sm text-muted-foreground">{message.time}</span>
                        </div>
                        
                        <h5 className="text-sm font-medium text-foreground mb-1">
                          {message.subject}
                        </h5>
                        
                        <p className="text-sm text-muted-foreground truncate">
                          {message.preview}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageSection>
  );
}