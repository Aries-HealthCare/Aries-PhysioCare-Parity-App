'use client';

import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { PageHeader, EmptyState, ErrorState, PageSkeleton, SplitPane } from '@/components/ds';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useBackendQuery } from '@/hooks/use-backend-query';
import { useToast } from '@/hooks/use-toast';
import { providerApi } from '@/services/provider-api';
import { useProviderAuth } from '@/services/provider-auth-context';
import { useProviderRealtime } from '@/services/provider-realtime';
import {
  ArrowLeft,
  CreditCard,
  Headphones,
  Loader2,
  MapPin,
  MessageSquare,
  Plus,
  Search,
  Send,
  ShieldCheck,
  Smartphone,
  Stethoscope,
  Trash2,
  Users,
  XCircle,
} from 'lucide-react';

interface SupportCategory {
  department: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const SUPPORT_CATEGORIES: SupportCategory[] = [
  {
    department: 'Payment Support',
    description: 'Wallet payouts, visit settlements, registration fees, and transaction inquiries.',
    icon: CreditCard,
  },
  {
    department: 'Patient Support',
    description: 'Appointment cancellations, rescheduling coordination, and patient escalations.',
    icon: Users,
  },
  {
    department: 'Mobile App Support',
    description: 'Login issues, notification delivery, forms, and technical troubleshooting.',
    icon: Smartphone,
  },
  {
    department: 'Location Support',
    description: 'Service pincodes, territory radius updates, and GPS navigation concerns.',
    icon: MapPin,
  },
  {
    department: 'Protocol Support',
    description: 'Clinical assessment forms, treatment SOPs, add-ons, and QA review guidance.',
    icon: Stethoscope,
  },
];

function resolveChatId(chat: any): string {
  return String(chat?._id || chat?.id || '');
}

function resolveChatTitle(chat: any): string {
  return (
    chat?.title ||
    chat?.department ||
    chat?.name ||
    chat?.participantName ||
    (chat?.isEscalation || chat?.type === 'escalation' ? 'Operations Support' : 'Conversation')
  );
}

function isSupportChatRoom(chat: any): boolean {
  return Boolean(chat?.department || chat?.isEscalation || chat?.type === 'escalation');
}

function formatMessageTime(value: unknown): string {
  if (!value) return '';
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}

function extractMessageText(message: any): string {
  const text = message?.text ?? message?.content ?? message?.message ?? '';
  return typeof text === 'string' ? text : String(text);
}

function extractMessageSenderId(message: any): string {
  const raw =
    message?.sender?._id ??
    message?.sender?.id ??
    (typeof message?.sender === 'string' ? message.sender : undefined) ??
    message?.senderId?._id ??
    message?.senderId?.id ??
    (typeof message?.senderId === 'string' ? message.senderId : undefined);
  return raw ? String(raw) : '';
}

function mergeChatMessages(existing: any[], incoming: any[]): any[] {
  const byId = new Map<string, any>();
  const pendingOptimistic: any[] = [];

  for (const msg of [...existing, ...incoming]) {
    if (!msg || typeof msg !== 'object') continue;
    if (msg.__optimistic) {
      pendingOptimistic.push(msg);
      continue;
    }
    const id = msg._id || msg.id;
    if (id) {
      byId.set(String(id), msg);
    } else {
      const fallbackKey = `fallback:${extractMessageSenderId(msg)}:${extractMessageText(msg)}:${msg.createdAt || msg.timestamp || ''}`;
      byId.set(fallbackKey, msg);
    }
  }

  const confirmed = Array.from(byId.values());
  const remainingOptimistic = pendingOptimistic.filter((opt) => {
    const optText = extractMessageText(opt).trim();
    return !confirmed.some(
      (real) =>
        extractMessageText(real).trim() === optText &&
        Math.abs(
          new Date(real.createdAt || real.timestamp || Date.now()).getTime() -
            new Date(opt.createdAt || opt.timestamp || Date.now()).getTime()
        ) < 60_000
    );
  });

  return [...confirmed, ...remainingOptimistic].sort((a, b) => {
    const ta = new Date(a?.createdAt || a?.timestamp || 0).getTime();
    const tb = new Date(b?.createdAt || b?.timestamp || 0).getTime();
    return ta - tb;
  });
}

function matchDepartmentParam(rawDept: string | null): string | null {
  if (!rawDept || !rawDept.trim()) return null;
  const cleaned = rawDept.trim().toLowerCase();
  const exact = SUPPORT_CATEGORIES.find((c) => c.department.toLowerCase() === cleaned);
  if (exact) return exact.department;
  const partial = SUPPORT_CATEGORIES.find(
    (c) => c.department.toLowerCase().includes(cleaned) || cleaned.includes(c.department.toLowerCase().replace(' support', ''))
  );
  return partial ? partial.department : SUPPORT_CATEGORIES[0].department;
}

function ChatPageContent() {
  const searchParams = useSearchParams();
  const deptParam = searchParams.get('dept');
  const { user } = useProviderAuth();
  const { toast } = useToast();
  const { data, error, loading, reload } = useBackendQuery(() => providerApi.getChats(), []);
  const chats = useMemo(() => (Array.isArray(data) ? data : []), [data]);

  const [viewMode, setViewMode] = useState<'conversations' | 'new-support'>('conversations');
  const [selectedDepartment, setSelectedDepartment] = useState<string>(SUPPORT_CATEGORIES[0].department);
  const [isStartingSupport, setIsStartingSupport] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [mobileShowThread, setMobileShowThread] = useState(false);

  const [messages, setMessages] = useState<any[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [draft, setDraft] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [msgError, setMsgError] = useState<string | null>(null);

  const [confirmEndOpen, setConfirmEndOpen] = useState(false);
  const [isEndingRoom, setIsEndingRoom] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [isDeletingRoom, setIsDeletingRoom] = useState(false);

  const { joinChat, leaveChat, subscribe } = useProviderRealtime();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const currentUserIds = useMemo(() => {
    const ids = new Set<string>();
    [user?._id, user?.uid, user?.id, user?.therapistId].forEach((val) => {
      if (val) ids.add(String(val));
    });
    return ids;
  }, [user]);

  const isFounder = useMemo(
    () => String(user?.designation || '').trim().toLowerCase() === 'founder',
    [user?.designation]
  );

  // Honor ?dept= query param (e.g. from Appointments cancel guidance or Target Help)
  useEffect(() => {
    const matched = matchDepartmentParam(deptParam);
    if (matched) {
      setSelectedDepartment(matched);
      setViewMode('new-support');
    }
  }, [deptParam]);

  // Select first chat by default on desktop without forcing mobile thread view
  useEffect(() => {
    if (!chats.length) {
      setActiveId(null);
      return;
    }
    if (activeId && chats.some((c) => resolveChatId(c) === activeId)) return;
    setActiveId(resolveChatId(chats[0]));
  }, [chats, activeId]);

  const filteredChats = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return chats;
    return chats.filter((chat) => {
      const title = resolveChatTitle(chat).toLowerCase();
      const dept = String(chat?.department || '').toLowerCase();
      const preview = String(chat?.lastMessage?.text || chat?.lastMessage || '').toLowerCase();
      return title.includes(q) || dept.includes(q) || preview.includes(q);
    });
  }, [chats, searchQuery]);

  const activeChat = useMemo(
    () => chats.find((c) => resolveChatId(c) === activeId) || null,
    [chats, activeId]
  );

  const activeIsSupport = isSupportChatRoom(activeChat);
  const activeIsEnded = String(activeChat?.status || '').toLowerCase() === 'ended';

  const fetchMessages = useCallback(async (roomId: string, showSpinner = false) => {
    if (showSpinner) setLoadingMessages(true);
    try {
      const list = await providerApi.getChatMessages(roomId);
      setMessages((prev) => mergeChatMessages(prev.filter((m) => m.__optimistic), Array.isArray(list) ? list : []));
      setMsgError(null);
    } catch (err: any) {
      setMsgError(err?.message || 'Could not load messages for this conversation.');
    } finally {
      if (showSpinner) setLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    if (!activeId) {
      setMessages([]);
      return;
    }
    setMessages([]);
    setMsgError(null);
    joinChat(activeId);
    void fetchMessages(activeId, true);

    const off = subscribe('new_message', (payload: any) => {
      const incomingMsg = payload?.message && typeof payload.message === 'object' ? payload.message : payload;
      const payloadRoomId = String(
        payload?.roomId ||
          payload?.chatId ||
          payload?.chat ||
          incomingMsg?.roomId ||
          incomingMsg?.chatId ||
          incomingMsg?.chat ||
          ''
      );
      if (payloadRoomId && payloadRoomId !== activeId) return;

      if (incomingMsg && (incomingMsg._id || incomingMsg.id || extractMessageText(incomingMsg))) {
        setMessages((prev) => mergeChatMessages(prev, [incomingMsg]));
      }
      void fetchMessages(activeId, false);
    });

    return () => {
      leaveChat(activeId);
      off();
    };
  }, [activeId, joinChat, leaveChat, subscribe, fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, activeId]);

  const isOwnMessage = useCallback(
    (msg: any): boolean => {
      if (msg?.__optimistic) return true;
      const senderId = extractMessageSenderId(msg);
      if (senderId && currentUserIds.has(senderId)) return true;
      const role = String(msg?.senderRole || msg?.role || '').trim().toLowerCase();
      return role === 'therapist' || role === 'expert';
    },
    [currentUserIds]
  );

  const handleStartSupportChat = async () => {
    setIsStartingSupport(true);
    try {
      const created = await providerApi.initializeSupportChat(selectedDepartment);
      const createdId = String(
        created?._id ||
          created?.id ||
          created?.room?._id ||
          created?.room?.id ||
          created?.chat?._id ||
          created?.chat?.id ||
          ''
      );
      await reload();
      if (createdId) {
        setActiveId(createdId);
        setMobileShowThread(true);
      }
      setViewMode('conversations');
      toast({
        title: 'Support Chat Ready',
        description: `Connected to ${selectedDepartment}.`,
      });
    } catch (err: any) {
      toast({
        title: 'Unable to Start Support Chat',
        description: err?.message || 'Please try again in a moment.',
        variant: 'destructive',
      });
    } finally {
      setIsStartingSupport(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!activeId || !text || isSending || activeIsEnded) return;

    const optimisticId = `optimistic-${Date.now()}`;
    const optimisticMessage = {
      _id: optimisticId,
      __optimistic: true,
      text,
      senderId: user?._id || user?.uid || user?.id,
      senderName: user?.fullName || user?.name || 'You',
      senderRole: 'therapist',
      createdAt: new Date().toISOString(),
    };

    setDraft('');
    setIsSending(true);
    setMsgError(null);
    setMessages((prev) => mergeChatMessages(prev, [optimisticMessage]));

    try {
      const sent = await providerApi.sendChatMessage(activeId, text);
      if (sent && typeof sent === 'object' && (sent._id || sent.id)) {
        setMessages((prev) =>
          mergeChatMessages(
            prev.filter((m) => m._id !== optimisticId),
            [sent]
          )
        );
      } else {
        await fetchMessages(activeId, false);
      }
    } catch (err: any) {
      setMessages((prev) => prev.filter((m) => m._id !== optimisticId));
      setDraft(text);
      const errMessage = err?.message || 'Message could not be sent.';
      setMsgError(errMessage);
      toast({
        title: 'Send Failed',
        description: errMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleEndSupportSession = async () => {
    if (!activeId) return;
    setIsEndingRoom(true);
    try {
      const res = await providerApi.endSupportChat(activeId);
      if (!res.success) {
        throw new Error(res.message || 'Could not end support session.');
      }
      setConfirmEndOpen(false);
      toast({
        title: 'Support Session Ended',
        description: 'This support ticket has been marked as resolved.',
      });
      await reload();
    } catch (err: any) {
      toast({
        title: 'Action Failed',
        description: err?.message || 'Unable to end this support session.',
        variant: 'destructive',
      });
    } finally {
      setIsEndingRoom(false);
    }
  };

  const handleDeleteRoom = async () => {
    if (!activeId) return;
    setIsDeletingRoom(true);
    try {
      const res = await providerApi.deleteSupportChat(activeId);
      if (!res.success) {
        throw new Error(res.message || 'Could not delete chat room.');
      }
      setConfirmDeleteOpen(false);
      setActiveId(null);
      setMobileShowThread(false);
      setMessages([]);
      toast({
        title: 'Room Deleted',
        description: 'The support room has been permanently removed.',
      });
      await reload();
    } catch (err: any) {
      toast({
        title: 'Delete Failed',
        description: err?.message || 'Unable to delete this chat room.',
        variant: 'destructive',
      });
    } finally {
      setIsDeletingRoom(false);
    }
  };

  if (loading) return <PageSkeleton />;
  if (error) return <ErrorState error={error} onRetry={reload} />;

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto">
      <PageHeader
        eyebrow="Communications"
        title="Clinical & Support Chat"
        description="Message Operations Support, care coordinators, and active clinical threads."
        actions={
          <div className="inline-flex items-center rounded-2xl border border-border bg-muted/40 p-1">
            <button
              type="button"
              onClick={() => setViewMode('conversations')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                viewMode === 'conversations'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Conversations
              {chats.length > 0 ? (
                <span className="ml-1.5 text-[10px] opacity-80">({chats.length})</span>
              ) : null}
            </button>
            <button
              type="button"
              onClick={() => setViewMode('new-support')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                viewMode === 'new-support'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Support Chat</span>
            </button>
          </div>
        }
      />

      {viewMode === 'new-support' ? (
        <div className="rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-outfit font-extrabold text-foreground">
                  Operations Support
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Choose the support team best suited for your request to open a dedicated thread.
                </p>
              </div>
            </div>
            {chats.length > 0 ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setViewMode('conversations')}
                className="rounded-xl text-xs font-bold self-start sm:self-auto"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                Back to Conversations
              </Button>
            ) : null}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {SUPPORT_CATEGORIES.map((category) => {
              const Icon = category.icon;
              const selected = selectedDepartment === category.department;
              return (
                <button
                  key={category.department}
                  type="button"
                  onClick={() => setSelectedDepartment(category.department)}
                  className={`text-left p-4 rounded-2xl border transition-all flex items-start gap-3 ${
                    selected
                      ? 'border-primary bg-primary/10 ring-2 ring-primary/30'
                      : 'border-border/80 bg-muted/20 hover:bg-muted/40'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      selected ? 'bg-primary text-white' : 'bg-background text-primary border border-border/60'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-outfit font-bold text-foreground">
                      {category.department}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {category.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-border/60">
            <p className="text-xs text-muted-foreground">
              Selected department:{' '}
              <span className="font-bold text-foreground">{selectedDepartment}</span>
            </p>
            <Button
              type="button"
              onClick={handleStartSupportChat}
              disabled={isStartingSupport}
              className="rounded-2xl h-11 px-6 font-bold text-xs"
            >
              {isStartingSupport ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <MessageSquare className="w-4 h-4 mr-2" />
              )}
              <span>{isStartingSupport ? 'Opening Support Thread…' : 'Start Support Chat'}</span>
            </Button>
          </div>
        </div>
      ) : !chats.length ? (
        <EmptyState
          icon={MessageSquare}
          title="No conversations yet"
          description="Support tickets and clinical care threads appear here once started."
          actionLabel="New Support Chat"
          onAction={() => setViewMode('new-support')}
        />
      ) : (
        <SplitPane
          listWidthClass={
            mobileShowThread && activeId
              ? 'hidden lg:block lg:w-[350px] xl:w-[380px]'
              : 'lg:w-[350px] xl:w-[380px]'
          }
          list={
            <div className="rounded-3xl border border-border bg-card flex flex-col h-[calc(100vh-14rem)] min-h-[460px] overflow-hidden">
              <div className="p-3 border-b border-border/80 space-y-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search conversations…"
                    className="pl-9 h-10 rounded-2xl text-xs"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-border/60">
                {filteredChats.length === 0 ? (
                  <div className="p-6 text-center text-xs text-muted-foreground">
                    No threads match &ldquo;{searchQuery}&rdquo;.
                  </div>
                ) : (
                  filteredChats.map((chat) => {
                    const id = resolveChatId(chat);
                    const selected = activeId === id;
                    const support = isSupportChatRoom(chat);
                    const ended = String(chat?.status || '').toLowerCase() === 'ended';
                    const preview =
                      typeof chat?.lastMessage === 'string'
                        ? chat.lastMessage
                        : chat?.lastMessage?.text || chat?.lastMessage?.content || chat?.department || 'Tap to view messages';
                    const timeLabel = formatMessageTime(chat?.updatedAt || chat?.lastMessageAt || chat?.createdAt);

                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => {
                          setActiveId(id);
                          setMobileShowThread(true);
                        }}
                        className={`w-full text-left px-4 py-3.5 transition-colors flex items-start gap-3 ${
                          selected ? 'bg-primary/10' : 'hover:bg-muted/40'
                        }`}
                      >
                        <div
                          className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 ${
                            support ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {support ? <Headphones className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-outfit font-bold truncate text-foreground">
                              {resolveChatTitle(chat)}
                            </p>
                            {timeLabel ? (
                              <span className="text-[10px] font-mono text-muted-foreground shrink-0">
                                {timeLabel}
                              </span>
                            ) : null}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {support ? (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-primary/10 text-primary shrink-0">
                                Support
                              </span>
                            ) : null}
                            {ended ? (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground shrink-0">
                                Ended
                              </span>
                            ) : null}
                            <p className="text-[11px] text-muted-foreground truncate">{preview}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          }
          detail={
            <div
              className={`rounded-3xl border border-border bg-card flex-col h-[calc(100vh-14rem)] min-h-[460px] overflow-hidden ${
                mobileShowThread && activeId ? 'flex' : 'hidden lg:flex'
              }`}
            >
              {/* Thread header */}
              <div className="px-4 py-3 border-b border-border/80 flex items-center justify-between gap-3 bg-muted/10">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setMobileShowThread(false)}
                    className="lg:hidden h-9 px-2.5 rounded-xl text-xs font-bold shrink-0"
                    aria-label="Back to conversations"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back
                  </Button>
                  <div className="w-9 h-9 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    {activeIsSupport ? <Headphones className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-sm font-outfit font-extrabold text-foreground truncate">
                      {activeChat ? resolveChatTitle(activeChat) : 'Select a conversation'}
                    </h2>
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      {activeIsSupport ? (
                        <span className="inline-flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-primary" />
                          {activeChat?.department || 'Operations Support'}
                        </span>
                      ) : (
                        <span>Clinical Thread</span>
                      )}
                      {activeIsEnded ? <span className="text-amber-500 font-semibold">· Session Ended</span> : null}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {activeChat && activeIsSupport && !activeIsEnded ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setConfirmEndOpen(true)}
                      className="h-9 px-3 rounded-xl text-xs font-bold border-amber-500/40 text-amber-600 hover:bg-amber-500/10"
                    >
                      <XCircle className="w-3.5 h-3.5 mr-1.5" />
                      <span>End Session</span>
                    </Button>
                  ) : null}

                  {activeChat && isFounder ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setConfirmDeleteOpen(true)}
                      className="h-9 px-3 rounded-xl text-xs font-bold border-destructive/40 text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                      <span>Delete Room</span>
                    </Button>
                  ) : null}
                </div>
              </div>

              {/* Message list */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {msgError ? (
                  <div className="p-3 rounded-2xl bg-destructive/10 border border-destructive/30 text-xs text-destructive font-semibold">
                    {msgError}
                  </div>
                ) : null}

                {loadingMessages ? (
                  <div className="flex items-center justify-center py-12 text-xs text-muted-foreground gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    <span>Loading messages…</span>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                    <MessageSquare className="w-8 h-8 opacity-30 mb-2" />
                    <p className="text-xs font-semibold text-foreground">No messages in this thread yet</p>
                    <p className="text-[11px] mt-0.5">Send a message below to start the conversation.</p>
                  </div>
                ) : (
                  messages.map((message, index) => {
                    const own = isOwnMessage(message);
                    const senderLabel =
                      message?.senderName ||
                      message?.sender?.fullName ||
                      message?.sender?.name ||
                      (own ? 'You' : message?.senderRole || message?.role || 'Support');
                    const timestamp = formatMessageTime(message?.createdAt || message?.timestamp);
                    const key = message?._id || message?.id || `msg-${index}`;

                    return (
                      <div
                        key={key}
                        className={`flex flex-col max-w-[85%] sm:max-w-[72%] ${
                          own ? 'ml-auto items-end' : 'mr-auto items-start'
                        }`}
                      >
                        <div className="flex items-center gap-2 px-1 mb-1 text-[10px] text-muted-foreground">
                          <span className="font-semibold">{senderLabel}</span>
                          {timestamp ? <span className="font-mono">{timestamp}</span> : null}
                        </div>
                        <div
                          className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed break-words whitespace-pre-wrap ${
                            own
                              ? 'bg-primary text-white rounded-br-md'
                              : 'bg-muted/70 text-foreground rounded-bl-md'
                          } ${message?.__optimistic ? 'opacity-75' : ''}`}
                        >
                          {extractMessageText(message)}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Composer */}
              {activeIsEnded ? (
                <div className="px-4 py-3 border-t border-border/80 bg-muted/20 text-xs text-muted-foreground flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span>This support session has ended. Start a new support chat if you need further help.</span>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setViewMode('new-support')}
                    className="rounded-xl text-xs font-bold shrink-0"
                  >
                    New Support Chat
                  </Button>
                </div>
              ) : (
                <form className="p-3 border-t border-border/80 flex gap-2 bg-background/50" onSubmit={handleSendMessage}>
                  <Input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Type a message…"
                    disabled={!activeId || isSending}
                    className="rounded-2xl h-11"
                  />
                  <Button
                    type="submit"
                    disabled={!activeId || !draft.trim() || isSending}
                    className="rounded-2xl h-11 px-4 font-bold"
                  >
                    {isSending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4 sm:mr-1.5" />
                        <span className="hidden sm:inline">Send</span>
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>
          }
        />
      )}

      {/* End Support Session Modal */}
      <AlertDialog open={confirmEndOpen} onOpenChange={setConfirmEndOpen}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>End Support Session?</AlertDialogTitle>
            <AlertDialogDescription>
              This will close the active support ticket for{' '}
              <strong>{activeChat ? resolveChatTitle(activeChat) : 'this thread'}</strong>. You can
              always open a new support chat later if needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isEndingRoom} className="rounded-xl">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isEndingRoom}
              onClick={(e) => {
                e.preventDefault();
                void handleEndSupportSession();
              }}
              className="rounded-xl bg-amber-600 hover:bg-amber-700 text-white"
            >
              {isEndingRoom ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : null}
              End Session
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Founder-Only Delete Room Modal */}
      <AlertDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Support Room?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes this chat room and its history. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingRoom} className="rounded-xl">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeletingRoom}
              onClick={(e) => {
                e.preventDefault();
                void handleDeleteRoom();
              }}
              className="rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {isDeletingRoom ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : null}
              Delete Room
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ChatPageContent />
    </Suspense>
  );
}
