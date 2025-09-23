import React from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { chatService, subscribeToMessages, ChatMessage } from '@/services/chatService';

export default function ProjectChatPage() {
  const { id: projectId } = useParams();
  const [threadId, setThreadId] = React.useState<string | null>(null);
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [body, setBody] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);

  // Ensure a default thread for the project exists; backend RPC should be idempotent for same creator/title
  React.useEffect(() => {
    if (!projectId) return;
    let isCancelled = false;
    (async () => {
      try {
        const created = await chatService.createThread(projectId, 'General', []);
        if (!isCancelled) setThreadId(created.thread_id);
      } catch (e: any) {
        // If RPCs are not yet deployed, surface a friendly message but keep UI usable
        setError(e?.message || 'Unable to initialize chat. Deploy database migration and RPCs.');
      }
    })();
    return () => {
      isCancelled = true;
    };
  }, [projectId]);

  // Subscribe to realtime messages
  React.useEffect(() => {
    if (!threadId) return;
    const unsubscribe = subscribeToMessages(threadId, ({ type, message }) => {
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
  }, [threadId]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim() || !threadId) return;
    const temp: ChatMessage = {
      id: 'temp_' + Math.random().toString(36).slice(2),
      thread_id: threadId,
      sender_id: 'me',
      body: body,
      attachments: [],
      created_at: new Date().toISOString(),
      edited_at: null,
      deleted_at: null,
    };
    setMessages(prev => [...prev, temp]);
    setBody('');
    try {
      await chatService.sendMessage(threadId, temp.body, []);
    } catch (e: any) {
      setError(e?.message || 'Failed to send message');
    }
  }

  return (
    <div className="flex h-full gap-4 p-4">
      <Card className="w-64 flex-shrink-0 p-2 overflow-auto" aria-label="Projects list">
        {/* Left rail: projects + threads list (placeholder) */}
        <div className="text-sm text-muted-foreground">Projects & Threads</div>
      </Card>

      <Card className="flex-1 p-2 flex flex-col min-w-0" aria-label="Thread view">
        {/* Middle: messages */}
        <div className="flex items-center justify-between px-2 py-1">
          <div className="font-medium">Project {projectId} · Thread</div>
          <div className="text-xs text-muted-foreground">Participants</div>
        </div>
        <Separator />
        <div className="flex-1 overflow-auto p-2 space-y-2" aria-live="polite">
          {error && <div className="text-xs text-red-600">{error}</div>}
          {messages.length === 0 ? (
            <div className="text-sm text-muted-foreground">Start a conversation about this project.</div>
          ) : (
            messages
              .sort((a, b) => a.created_at.localeCompare(b.created_at))
              .map(m => (
                <div key={m.id} className="text-sm">
                  <span className="text-muted-foreground mr-2">{new Date(m.created_at).toLocaleTimeString()}</span>
                  <span>{m.body}</span>
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
      </Card>
    </div>
  );
}


