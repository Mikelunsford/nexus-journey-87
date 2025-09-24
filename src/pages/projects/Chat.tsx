import React from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { MessageSquare } from 'lucide-react';

// Temporary placeholder types until chat functionality is implemented
type ChatMessage = {
  id: string;
  sender: string;
  message: string;
  timestamp: string;
};

export default function ProjectChatPage() {
  const { id: projectId } = useParams();
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [body, setBody] = React.useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;
    
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'You',
      message: body,
      timestamp: new Date().toISOString(),
    };
    
    setMessages(prev => [...prev, newMessage]);
    setBody('');
  };

  return (
    <div className="flex h-full gap-4 p-4">
      <Card className="w-64 flex-shrink-0 p-2 overflow-auto" aria-label="Projects list">
        {/* Left rail: projects + threads list (placeholder) */}
        <div className="text-sm text-muted-foreground">Projects & Threads</div>
        <div className="mt-2 space-y-1">
          <div className="p-2 text-sm bg-muted rounded">Project {projectId}</div>
        </div>
      </Card>

      <Card className="flex-1 p-2 flex flex-col min-w-0" aria-label="Thread view">
        {/* Middle: messages */}
        <div className="flex items-center justify-between px-2 py-1">
          <div className="font-medium">Project {projectId} · General</div>
          <div className="text-xs text-muted-foreground">Team Chat</div>
        </div>
        <Separator />
        <div className="flex-1 overflow-auto p-2 space-y-2" aria-live="polite">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <MessageSquare className="w-8 h-8 text-muted-foreground mb-2" />
              <div className="text-sm text-muted-foreground">Start a conversation about this project.</div>
              <div className="text-xs text-muted-foreground mt-1">Chat functionality coming soon</div>
            </div>
          ) : (
            messages.map(m => (
              <div key={m.id} className="text-sm">
                <span className="text-muted-foreground mr-2">{new Date(m.timestamp).toLocaleTimeString()}</span>
                <span className="font-medium mr-1">{m.sender}:</span>
                <span>{m.message}</span>
              </div>
            ))
          )}
        </div>
        <Separator />
        <form className="p-2 flex gap-2 items-end" aria-label="Message composer" onSubmit={handleSend}>
          <textarea
            className="flex-1 resize-none border rounded p-2"
            rows={2}
            placeholder="Write a message..."
            aria-label="Message input"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                handleSend(e);
              }
            }}
          />
          <button type="submit" className="border rounded px-3 py-2">Send</button>
        </form>
      </Card>

      <Card className="w-72 flex-shrink-0 p-2 overflow-auto" aria-label="Project info">
        {/* Right pane: project info */}
        <div className="text-sm text-muted-foreground">Project snapshot</div>
        <div className="mt-2 space-y-2">
          <div className="text-xs">
            <div className="font-medium">Status</div>
            <div className="text-muted-foreground">In Progress</div>
          </div>
          <div className="text-xs">
            <div className="font-medium">Team</div>
            <div className="text-muted-foreground">Loading...</div>
          </div>
        </div>
      </Card>
    </div>
  );
}