'use client';

import { useEffect, useState } from 'react';
import { PageHeader, EmptyState, ErrorState, PageSkeleton, SplitPane } from '@/components/ds';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useBackendQuery } from '@/hooks/use-backend-query';
import { providerApi } from '@/services/provider-api';
import { useProviderRealtime } from '@/services/provider-realtime';
import { MessageSquare } from 'lucide-react';

export default function ChatPage() {
  const { data, error, loading, reload } = useBackendQuery(() => providerApi.getChats(), []);
  const chats = Array.isArray(data) ? data : [];
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [draft, setDraft] = useState('');
  const [msgError, setMsgError] = useState<string | null>(null);
  const { joinChat, leaveChat, sendChatMessage, subscribe } = useProviderRealtime();

  useEffect(() => {
    if (!chats.length || activeId) return;
    setActiveId(chats[0]._id || chats[0].id);
  }, [chats, activeId]);

  useEffect(() => {
    if (!activeId) return;
    joinChat(activeId);
    let cancelled = false;
    providerApi
      .getChatMessages(activeId)
      .then((list) => {
        if (!cancelled) setMessages(list);
      })
      .catch((err) => setMsgError(err?.message || 'Could not load messages'));
    const off = subscribe('new_message', () => {
      providerApi.getChatMessages(activeId).then(setMessages).catch(() => {});
    });
    return () => {
      cancelled = true;
      leaveChat(activeId);
      off();
    };
  }, [activeId, joinChat, leaveChat, subscribe]);

  if (loading) return <PageSkeleton />;
  if (error) return <ErrorState error={error} onRetry={reload} />;

  return (
    <div className="space-y-4">
      <PageHeader eyebrow="Patients" title="Chat" description="Same threads as AriesXpertV2. Socket namespace /chats." />
      {!chats.length ? (
        <EmptyState
          icon={MessageSquare}
          title="No conversations yet"
          description="Support and lead chats appear here when HQ or a patient thread is opened."
          actionLabel="Start support chat"
          onAction={async () => {
            await providerApi.initializeSupportChat();
            await reload();
          }}
        />
      ) : (
        <SplitPane
          list={
            <div className="rounded-3xl border border-border bg-card divide-y max-h-[70vh] overflow-y-auto">
              {chats.map((chat) => {
                const id = chat._id || chat.id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setActiveId(id)}
                    className={`w-full text-left px-4 py-3 ${activeId === id ? 'bg-primary/10' : ''}`}
                  >
                    <p className="text-sm font-outfit font-bold truncate">{chat.title || chat.name || 'Conversation'}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{chat.lastMessage || chat.type}</p>
                  </button>
                );
              })}
            </div>
          }
          detail={
            <div className="rounded-3xl border border-border bg-card flex flex-col min-h-[60vh]">
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {msgError ? <p className="text-sm text-destructive">{msgError}</p> : null}
                {messages.map((message, i) => (
                  <div key={message._id || i} className="rounded-2xl bg-muted/50 px-3 py-2 text-sm">
                    <p className="text-[10px] text-muted-foreground">{message.senderName || message.role || 'Member'}</p>
                    {message.text || message.content || message.message}
                  </div>
                ))}
              </div>
              <form
                className="p-3 border-t flex gap-2"
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!activeId || !draft.trim()) return;
                  sendChatMessage(activeId, draft.trim());
                  try {
                    await providerApi.sendChatMessage(activeId, draft.trim());
                  } catch {
                    /* socket may already deliver */
                  }
                  setDraft('');
                  setMessages(await providerApi.getChatMessages(activeId));
                }}
              >
                <Input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Message" className="rounded-2xl" />
                <Button type="submit" className="rounded-2xl">Send</Button>
              </form>
            </div>
          }
        />
      )}
    </div>
  );
}
