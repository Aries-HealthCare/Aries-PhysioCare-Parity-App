'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useProviderAuth } from '@/services/provider-auth-context';
import { providerApi } from '@/services/provider-api';
import { useToast } from '@/hooks/use-toast';
import {
  Bot,
  Send,
  Sparkles,
  ShieldCheck,
  User,
  Loader2,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Copy,
  Check,
  Flame,
  Zap,
  Smile,
  Coffee,
  HeartPulse,
  CloudRain,
  Brain,
  Activity,
  FileText,
  ChevronRight,
  MessageSquare,
  BarChart3,
  Compass,
  Plus,
  Trash2,
  Settings,
  AudioLines,
  CheckCircle2,
  Award,
  PartyPopper,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ChatMessage {
  id: string;
  sender: 'user' | 'buddy';
  text: string;
  timestamp: string;
}

interface BuddySession {
  sessionId: string;
  title: string;
  messages: any[];
  createdAt?: string;
}

type BuddyTab = 'HUB' | 'CHAT' | 'ANALYTICS' | 'MEMORY';
type AvatarEmotion = 'happy' | 'listening' | 'thinking' | 'speaking' | 'energized';

const SAMPLE_PROMPTS = [
  'Post-TKR Day 10 range-of-motion exercise progressions',
  'Red flags checklist for acute lumbar radiculopathy & cauda equina',
  'Differential diagnosis for acute lateral knee pain in a runner',
  'Dry needling safety precautions for upper trapezius trigger points',
  'Generate complete SOAP note for cervical disc herniation session',
  'Frozen shoulder stage 2 capsular stretching protocol',
];

const MOODS = [
  { id: 'fire', icon: Flame, label: 'Hyper-Motivated', color: 'text-amber-500 bg-amber-500/10 border-amber-500/30', feedback: 'Phenomenal drive! Let us deliver gold-standard clinical outcomes for your patients today.' },
  { id: 'zap', icon: Zap, label: 'High Energy', color: 'text-sky-500 bg-sky-500/10 border-sky-500/30', feedback: 'Your high energy elevates patient morale during active movement rehabilitation!' },
  { id: 'smile', icon: Smile, label: 'Focused & Calm', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30', feedback: 'A calm, methodical clinician yields the most accurate orthopedic assessments.' },
  { id: 'coffee', icon: Coffee, label: 'Need Boost', color: 'text-orange-500 bg-orange-500/10 border-orange-500/30', feedback: 'Take a deep breath and stay hydrated between doorstep clinical visits. You got this!' },
  { id: 'mindful', icon: HeartPulse, label: 'Mindful', color: 'text-purple-500 bg-purple-500/10 border-purple-500/30', feedback: 'Empathetic listening and patient rapport are the cornerstones of healing.' },
  { id: 'cloud', icon: CloudRain, label: 'High Caseload', color: 'text-rose-500 bg-rose-500/10 border-rose-500/30', feedback: 'I am here to streamline your SOAP notes and triage so you can focus 100% on hands-on care.' },
];

function normalizeSessionMessages(rawMessages: any[], fallbackGreeting: ChatMessage): ChatMessage[] {
  if (!Array.isArray(rawMessages) || rawMessages.length === 0) return [fallbackGreeting];
  return rawMessages
    .map((m: any, idx: number) => {
      const role = String(m?.role || m?.sender || '').toLowerCase();
      const sender: 'user' | 'buddy' =
        role === 'user' || role === 'therapist' || role === 'human' ? 'user' : 'buddy';
      const text = String(m?.content || m?.text || m?.message || '').trim();
      if (!text) return null;
      const ts = m?.timestamp || m?.createdAt;
      const timestamp = ts
        ? new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : '';
      return {
        id: m?._id || m?.id || `hist_${idx}`,
        sender,
        text,
        timestamp,
      };
    })
    .filter(Boolean) as ChatMessage[];
}

export default function ProviderAIBuddyPage() {
  const { user } = useProviderAuth();
  const { toast } = useToast();
  const therapistName = user?.fullName || user?.name || 'Doctor';
  const isFemaleUser = (user?.gender || '').toLowerCase().startsWith('f');
  const defaultCompanionName = isFemaleUser ? 'Rivan' : 'Tanya';
  const companionAvatarUrl = isFemaleUser ? '/images/avatar_m1.png' : '/images/avatar_f1.png';

  const [activeTab, setActiveTab] = useState<BuddyTab>('HUB');
  const [emotion, setEmotion] = useState<AvatarEmotion>('happy');
  const [selectedMood, setSelectedMood] = useState<string>('zap');
  const [moodFeedback, setMoodFeedback] = useState<string | null>(null);
  const [savingMood, setSavingMood] = useState(false);

  // Backend hydrated state
  const [hydrating, setHydrating] = useState(true);
  const [buddyProfile, setBuddyProfile] = useState<any | null>(null);
  const [buddyDashboard, setBuddyDashboard] = useState<any | null>(null);
  const [dynamicGreeting, setDynamicGreeting] = useState<string | null>(null);
  const [sessions, setSessions] = useState<BuddySession[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionBusy, setSessionBusy] = useState(false);
  const [missionBusyId, setMissionBusyId] = useState<string | null>(null);
  const [eventBusyId, setEventBusyId] = useState<string | null>(null);

  const companionName = buddyProfile?.aiCustomName || defaultCompanionName;

  const buildGreetingMessage = useCallback(
    (name: string, greeting?: string | null): ChatMessage => ({
      id: 'm_greeting',
      sender: 'buddy',
      text:
        greeting ||
        `Hello ${therapistName}! I am ${name}, your Aries AI Clinical Copilot & Coach.\n\nI can assist you with evidence-based exercise progressions, differential orthopedic diagnoses, red flag emergency screenings, and SOAP note synthesis. What patient case are we managing today?`,
      timestamp: 'Now',
    }),
    [therapistName]
  );

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    buildGreetingMessage(defaultCompanionName, null),
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Voice & Audio Speech State
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [isTtsSpeaking, setIsTtsSpeaking] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const recognitionRef = useRef<any>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const handleSendRef = useRef<(textToSend?: string) => void>(() => {});

  const loadBuddyState = useCallback(async () => {
    setHydrating(true);
    try {
      const [profileRes, dashboardRes] = await Promise.allSettled([
        providerApi.getBuddyProfile(),
        providerApi.getBuddyDashboard(),
      ]);

      let loadedProfile: any = null;
      let loadedGreeting: string | null = null;

      if (profileRes.status === 'fulfilled' && profileRes.value) {
        const val = profileRes.value;
        loadedProfile = val?.profile || val;
        loadedGreeting = typeof val?.greeting === 'string' ? val.greeting : val?.greeting?.message || null;
        setBuddyProfile(loadedProfile);
        setDynamicGreeting(loadedGreeting);

        const rawSessions: BuddySession[] = Array.isArray(loadedProfile?.chatSessions)
          ? loadedProfile.chatSessions.map((s: any, i: number) => ({
              sessionId: String(s.sessionId || s._id || `session_${i}`),
              title: s.title || `Conversation ${i + 1}`,
              messages: Array.isArray(s.messages) ? s.messages : [],
              createdAt: s.createdAt,
            }))
          : [];
        setSessions(rawSessions);

        const activeSid =
          loadedProfile?.activeSessionId ||
          rawSessions[0]?.sessionId ||
          null;
        setSessionId(activeSid);

        const activeSession = rawSessions.find((s) => s.sessionId === activeSid) || rawSessions[0];
        const effectiveName = loadedProfile?.aiCustomName || defaultCompanionName;
        const greetingMsg = buildGreetingMessage(effectiveName, loadedGreeting);
        setMessages(normalizeSessionMessages(activeSession?.messages || [], greetingMsg));

        const latestMood = Array.isArray(loadedProfile?.moodHistory) && loadedProfile.moodHistory.length > 0
          ? loadedProfile.moodHistory[loadedProfile.moodHistory.length - 1]
          : null;
        if (latestMood?.mood) {
          setSelectedMood(String(latestMood.mood));
        }
      }

      if (dashboardRes.status === 'fulfilled' && dashboardRes.value) {
        setBuddyDashboard(dashboardRes.value);
      }
    } catch {
      // Non-fatal: chat can still initialize a session on first send
    } finally {
      setHydrating(false);
    }
  }, [buildGreetingMessage, defaultCompanionName]);

  useEffect(() => {
    void loadBuddyState();
  }, [loadBuddyState]);

  // Scroll to bottom on new message
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Speech Recognition Setup + Clean Unmount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const reco = new SpeechRecognition();
        reco.continuous = false;
        reco.interimResults = false;
        reco.lang = 'en-IN';

        reco.onresult = (event: any) => {
          const transcript = event.results?.[0]?.[0]?.transcript;
          if (transcript) {
            setInputValue(transcript);
            handleSendRef.current(transcript);
          }
          setIsVoiceRecording(false);
          setEmotion('happy');
        };

        reco.onerror = () => {
          setIsVoiceRecording(false);
          setEmotion('happy');
        };

        reco.onend = () => {
          setIsVoiceRecording(false);
          setEmotion('happy');
        };

        recognitionRef.current = reco;
      }
    }

    return () => {
      try {
        recognitionRef.current?.abort?.();
      } catch {
        // ignore cleanup errors
      }
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const toggleVoiceRecording = () => {
    if (!recognitionRef.current) {
      toast({
        title: 'Voice dictation unavailable',
        description: 'Voice dictation requires Chrome, Edge, or Safari with microphone permissions.',
        variant: 'destructive',
      });
      return;
    }

    if (isVoiceRecording) {
      recognitionRef.current.stop();
      setIsVoiceRecording(false);
      setEmotion('happy');
    } else {
      try {
        recognitionRef.current.start();
        setIsVoiceRecording(true);
        setEmotion('listening');
      } catch {
        setIsVoiceRecording(false);
      }
    }
  };

  const speakText = (text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*#_`]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.05;
    utterance.lang = 'en-IN';

    utterance.onstart = () => {
      setIsTtsSpeaking(true);
      setEmotion('speaking');
    };

    utterance.onend = () => {
      setIsTtsSpeaking(false);
      setEmotion('happy');
    };

    utterance.onerror = () => {
      setIsTtsSpeaking(false);
      setEmotion('happy');
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend ?? inputValue).trim();
    if (!text) return;

    if (activeTab !== 'CHAT') setActiveTab('CHAT');

    const userMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue('');
    setIsLoading(true);
    setEmotion('thinking');

    try {
      const res = await providerApi.sendBuddyChat(text, sessionId || undefined);
      if (!res.success || !res.reply) {
        throw new Error(res.message || 'The clinical companion did not respond.');
      }
      if (res.sessionId && res.sessionId !== sessionId) setSessionId(res.sessionId);

      const buddyMsg: ChatMessage = {
        id: 'msg_b_' + Date.now(),
        sender: 'buddy',
        text: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, buddyMsg]);
      setEmotion('happy');
      setChatError(null);

      if (ttsEnabled) {
        speakText(res.reply);
      }
    } catch (err: any) {
      setChatError(
        err?.message || 'Could not reach the clinical companion. Your message was not sent.'
      );
      setEmotion('happy');
    } finally {
      setIsLoading(false);
    }
  };

  handleSendRef.current = handleSendMessage;

  const handleCopyMessage = (id: string, text: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      void navigator.clipboard.writeText(text);
    }
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSelectMood = async (mood: (typeof MOODS)[0]) => {
    setSelectedMood(mood.id);
    setMoodFeedback(mood.feedback);
    setEmotion('energized');
    setTimeout(() => setEmotion('happy'), 2500);
    setSavingMood(true);
    try {
      await providerApi.saveBuddyProfile({
        mood: {
          mood: mood.id,
          note: mood.label,
          timestamp: new Date().toISOString(),
        },
      });
      toast({
        title: `Mood logged: ${mood.label}`,
        description: 'Synced with your Aries Buddy profile.',
      });
    } catch (err: any) {
      toast({
        title: 'Mood recorded locally',
        description: err?.message || 'Could not sync mood check-in to server right now.',
        variant: 'destructive',
      });
    } finally {
      setSavingMood(false);
    }
  };

  const handleNewSession = async () => {
    setSessionBusy(true);
    try {
      const created = await providerApi.startBuddySession();
      const newSid = created?.sessionId || created?.activeSessionId || created?.session?.sessionId;
      await loadBuddyState();
      if (newSid) setSessionId(String(newSid));
      setActiveTab('CHAT');
      toast({ title: 'Started a fresh conversation' });
    } catch (err: any) {
      toast({
        title: 'Could not start session',
        description: err?.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSessionBusy(false);
    }
  };

  const handleSwitchSession = async (target: BuddySession) => {
    setSessionBusy(true);
    try {
      await providerApi.setActiveBuddySession(target.sessionId);
      setSessionId(target.sessionId);
      setMessages(
        normalizeSessionMessages(
          target.messages,
          buildGreetingMessage(companionName, dynamicGreeting)
        )
      );
      setChatError(null);
    } catch (err: any) {
      toast({
        title: 'Could not switch conversation',
        description: err?.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSessionBusy(false);
    }
  };

  const handleDeleteSession = async (targetSid: string) => {
    setSessionBusy(true);
    try {
      await providerApi.deleteBuddySession(targetSid);
      await loadBuddyState();
      toast({ title: 'Conversation removed' });
    } catch (err: any) {
      toast({
        title: 'Could not delete conversation',
        description: err?.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSessionBusy(false);
    }
  };

  const handleCompleteMission = async (taskId: string) => {
    setMissionBusyId(taskId);
    try {
      const res = await providerApi.completeBuddyMission(taskId);
      if (!res.success) throw new Error('Mission could not be checked off');
      await loadBuddyState();
      toast({
        title: 'Daily mission completed!',
        description: 'Your Arena coins and companion bond have been updated.',
      });
    } catch (err: any) {
      toast({
        title: 'Mission update failed',
        description: err?.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setMissionBusyId(null);
    }
  };

  const handleCelebrateEvent = async (eventId: string) => {
    setEventBusyId(eventId);
    try {
      await providerApi.markLifeEventCelebrated(eventId);
      await loadBuddyState();
      toast({ title: 'Milestone celebrated!' });
    } catch (err: any) {
      toast({
        title: 'Could not mark celebration',
        description: err?.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setEventBusyId(null);
    }
  };

  const missions: any[] = Array.isArray(buddyDashboard?.missions) ? buddyDashboard.missions : [];
  const memories: any[] = Array.isArray(buddyDashboard?.memories) ? buddyDashboard.memories : [];
  const lifeEvents: any[] = Array.isArray(buddyDashboard?.timeline)
    ? buddyDashboard.timeline
    : Array.isArray(buddyDashboard?.approvedCelebrations)
      ? buddyDashboard.approvedCelebrations
      : [];
  const opportunities: any[] = Array.isArray(buddyDashboard?.opportunities) ? buddyDashboard.opportunities : [];
  const relationship = buddyDashboard?.relationship || null;
  const audit = buddyDashboard?.audit || null;
  const moodHistory: any[] = Array.isArray(buddyProfile?.moodHistory) ? buddyProfile.moodHistory : [];
  const completedMissionsCount = missions.filter((m) => m.completed).length;

  return (
    <div className="space-y-4 max-w-7xl mx-auto flex flex-col min-h-[calc(100vh-8rem)]">
      {/* ── Top Header & Interactive Avatar Bar ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-4 bg-card/90 backdrop-blur-md border border-border/80 rounded-3xl shadow-sm shrink-0">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="relative group cursor-pointer shrink-0" onClick={() => setEmotion('energized')}>
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl overflow-hidden border-2 border-primary/40 shadow-lg bg-gradient-to-tr from-primary/30 to-accent/20 flex items-center justify-center p-0.5">
              <img
                src={companionAvatarUrl}
                alt={companionName}
                className="w-full h-full object-cover rounded-xl transition-transform group-hover:scale-105"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
              <Bot className="w-7 h-7 text-primary hidden" />
            </div>
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-card flex items-center justify-center shadow-sm">
              <span className="w-full h-full rounded-full bg-emerald-400 animate-ping opacity-75" />
            </span>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg font-outfit font-extrabold tracking-tight text-foreground truncate">
                {companionName}
              </h1>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                Aries AI Copilot
              </span>
              {buddyProfile?.relationshipType ? (
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground capitalize">
                  {String(buddyProfile.relationshipType)}
                </span>
              ) : null}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="truncate">
                {emotion === 'speaking'
                  ? 'Speaking response aloud…'
                  : emotion === 'listening'
                  ? 'Listening to voice dictation…'
                  : emotion === 'thinking'
                  ? 'Synthesizing clinical guidance…'
                  : emotion === 'energized'
                  ? 'Synced with Aries Clinical Companion'
                  : 'Active & Ready for Clinical Cases'}
              </span>
            </p>
          </div>
        </div>

        {/* Controls, Quick Links & Tab Switcher */}
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <Link
            href="/app/ai/avatar"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-primary/30 bg-primary/10 text-primary text-xs font-bold hover:bg-primary/15 transition-colors"
          >
            <AudioLines className="w-3.5 h-3.5" />
            <span>Voice Studio</span>
          </Link>

          <Link
            href="/app/settings/buddy"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-muted/40 text-foreground text-xs font-bold hover:bg-muted transition-colors"
            title="Buddy Persona & Preferences"
          >
            <Settings className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">Persona</span>
          </Link>

          <button
            type="button"
            onClick={() => {
              if (isTtsSpeaking && typeof window !== 'undefined' && window.speechSynthesis) {
                window.speechSynthesis.cancel();
                setIsTtsSpeaking(false);
              }
              setTtsEnabled(!ttsEnabled);
            }}
            className={`p-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
              ttsEnabled
                ? 'bg-primary/10 border-primary/30 text-primary'
                : 'bg-muted/40 border-border text-muted-foreground'
            }`}
            title={ttsEnabled ? 'Voice Readout Enabled' : 'Voice Readout Muted'}
          >
            {ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden md:inline text-[11px]">{ttsEnabled ? 'Voice ON' : 'Muted'}</span>
          </button>

          <div className="flex p-1 bg-muted/60 rounded-2xl border border-border/60">
            {(
              [
                { id: 'HUB', label: 'Coach Hub', icon: Compass },
                { id: 'CHAT', label: 'Copilot Chat', icon: MessageSquare },
                { id: 'ANALYTICS', label: 'Ecosystem', icon: BarChart3 },
                { id: 'MEMORY', label: 'Memory Vault', icon: Brain },
              ] as const
            ).map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-card text-foreground shadow-sm border border-border/80'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── TAB 1: AI COACH HUB ── */}
      {activeTab === 'HUB' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
          <div className="lg:col-span-7 space-y-4">
            {/* Dynamic Greeting & Focus Card */}
            <div className="bg-gradient-to-r from-primary/15 via-accent/10 to-card border border-primary/20 rounded-3xl p-5 sm:p-6 shadow-sm space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-bold text-primary">
                  <Sparkles className="w-4 h-4" />
                  <span>Today&apos;s Companion Briefing</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => void loadBuddyState()}
                  disabled={hydrating}
                  className="h-7 px-2 text-xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 mr-1 ${hydrating ? 'animate-spin' : ''}`} />
                  Sync
                </Button>
              </div>

              <p className="text-sm font-outfit font-bold text-foreground leading-relaxed">
                {dynamicGreeting ||
                  `Welcome back, ${therapistName}. Ask ${companionName} for SOAP synthesis, differential diagnosis checks, or progressive rehab plans at any point during your shift.`}
              </p>

              <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-1">
                <span className="text-[11px] text-muted-foreground">
                  Synced across AriesXpert Mobile & Web Workstation
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => setActiveTab('CHAT')}
                    className="h-8 px-3 rounded-xl bg-primary text-primary-foreground text-xs font-bold"
                  >
                    Open Copilot Chat
                    <ChevronRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Daily Missions from Backend */}
            <div className="bg-card border border-border/80 rounded-3xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-outfit font-extrabold text-foreground">
                    Today&apos;s Companion Missions
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    {missions.length > 0
                      ? `${completedMissionsCount} of ${missions.length} daily goals checked off`
                      : 'Daily missions from your clinical ecosystem appear here'}
                  </p>
                </div>
                <Award className="w-5 h-5 text-amber-500" />
              </div>

              {hydrating ? (
                <div className="flex items-center gap-2 py-4 text-xs text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  Loading daily missions…
                </div>
              ) : missions.length === 0 ? (
                <p className="text-xs text-muted-foreground py-2">
                  No active daily missions assigned yet today. Complete visits or chat with {companionName} to unlock new targets.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {missions.map((m: any, idx: number) => {
                    const tid = String(m.taskId || m._id || idx);
                    const done = Boolean(m.completed);
                    return (
                      <div
                        key={tid}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl border border-border/70 bg-muted/20"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-foreground">
                              {m.title || m.label || 'Daily Clinical Goal'}
                            </span>
                            {m.coinReward ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                +{m.coinReward} coins
                              </span>
                            ) : null}
                          </div>
                          {m.description ? (
                            <p className="text-[11px] text-muted-foreground">{m.description}</p>
                          ) : null}
                        </div>
                        <Button
                          size="sm"
                          variant={done ? 'outline' : 'default'}
                          disabled={done || missionBusyId === tid}
                          onClick={() => void handleCompleteMission(tid)}
                          className="h-8 rounded-xl text-xs font-bold shrink-0"
                        >
                          {done ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-500" />
                              Completed
                            </>
                          ) : missionBusyId === tid ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            'Check Off'
                          )}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Rapid Clinical Action Launchers */}
            <div className="space-y-2">
              <h3 className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider px-1">
                Rapid Clinical Action Launchers
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    icon: FileText,
                    color: 'bg-emerald-500/10 text-emerald-500',
                    ctaColor: 'text-emerald-600 dark:text-emerald-400',
                    title: 'SOAP Assessment Generator',
                    desc: 'Synthesize structured Subjective, Objective, Assessment & Plan notes.',
                    cta: 'Launch Generator',
                    prompt: 'Generate a structured SOAP note template for a lumbar disc herniation follow-up session',
                  },
                  {
                    icon: ShieldCheck,
                    color: 'bg-rose-500/10 text-rose-500',
                    ctaColor: 'text-rose-600 dark:text-rose-400',
                    title: 'Emergency Red Flag Triage',
                    desc: 'Screen for Cauda Equina, DVT, progressive motor deficit, and systemic pathology.',
                    cta: 'Open Safety Checklist',
                    prompt: 'Provide the urgent red flags checklist for acute spinal and neurological physiotherapy visits',
                  },
                  {
                    icon: Activity,
                    color: 'bg-sky-500/10 text-sky-500',
                    ctaColor: 'text-sky-600 dark:text-sky-400',
                    title: 'Joint-Specific Progression',
                    desc: 'Phase 1 to Phase 4 rehab pathways with exact sets, reps, and hold times.',
                    cta: 'Build Prescription',
                    prompt: 'Post-TKR Day 10 range-of-motion and strength exercise progressions',
                  },
                  {
                    icon: Brain,
                    color: 'bg-amber-500/10 text-amber-500',
                    ctaColor: 'text-amber-600 dark:text-amber-400',
                    title: 'Differential Diagnosis Matrix',
                    desc: 'Evaluate orthopedic special test clusters (McMurray, Lachman, Ober, Spurling).',
                    cta: 'Check Diagnostic Matrix',
                    prompt: 'Differential diagnosis and special test cluster for acute lateral knee pain in a runner',
                  },
                ].map((card) => {
                  const Icon = card.icon;
                  return (
                    <button
                      key={card.title}
                      type="button"
                      onClick={() => void handleSendMessage(card.prompt)}
                      className="text-left p-4 rounded-3xl border border-border/80 bg-card hover:border-primary/50 transition-all hover:shadow-md space-y-2 group"
                    >
                      <div className={`w-9 h-9 rounded-2xl ${card.color} flex items-center justify-center group-hover:scale-105 transition-transform`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-foreground">{card.title}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">{card.desc}</p>
                      </div>
                      <div className={`flex items-center gap-1 text-[11px] font-bold ${card.ctaColor}`}>
                        <span>{card.cta}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Mood Check-in + Milestones / Celebrations */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-card border border-border/80 rounded-3xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-outfit font-extrabold text-foreground">
                    Clinician Energy & State Check-in
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Saved directly to your Buddy profile
                  </p>
                </div>
                {savingMood ? <Loader2 className="w-4 h-4 animate-spin text-primary" /> : null}
              </div>

              <div className="grid grid-cols-3 gap-2">
                {MOODS.map((m) => {
                  const Icon = m.icon;
                  const isSelected = selectedMood === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => void handleSelectMood(m)}
                      className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                        isSelected
                          ? `${m.color} shadow-sm`
                          : 'border-border/60 bg-muted/20 text-muted-foreground hover:border-primary/40 hover:text-foreground'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-[10px] font-bold leading-tight">{m.label}</span>
                    </button>
                  );
                })}
              </div>

              {moodFeedback && (
                <div className="p-3 bg-primary/10 border border-primary/20 text-foreground text-xs font-medium rounded-2xl flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary shrink-0" />
                  <span>{moodFeedback}</span>
                </div>
              )}
            </div>

            {/* Life Events & Milestones */}
            <div className="bg-card border border-border/80 rounded-3xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-outfit font-extrabold text-foreground">
                    Milestones & Celebrations
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Recent wins tracked by {companionName}
                  </p>
                </div>
                <PartyPopper className="w-5 h-5 text-primary" />
              </div>

              {lifeEvents.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No pending milestone celebrations right now. New reviews, streaks, and referrals will appear here automatically.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {lifeEvents.slice(0, 5).map((ev: any, idx: number) => {
                    const eid = String(ev._id || ev.id || idx);
                    const celebrated = Boolean(ev.celebrated);
                    return (
                      <div
                        key={eid}
                        className="p-3.5 rounded-2xl border border-border/70 bg-muted/20 flex items-start justify-between gap-3"
                      >
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-foreground">
                            {ev.title || ev.eventType || 'Clinical Milestone'}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {ev.celebrationMessage || ev.description || 'Great milestone achieved!'}
                          </p>
                        </div>
                        {!celebrated && ev._id ? (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={eventBusyId === eid}
                            onClick={() => void handleCelebrateEvent(eid)}
                            className="h-7 px-2.5 rounded-xl text-[11px] font-bold shrink-0"
                          >
                            {eventBusyId === eid ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Celebrate'}
                          </Button>
                        ) : (
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                            Celebrated
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {opportunities.length > 0 && (
              <div className="bg-card border border-border/80 rounded-3xl p-5 shadow-sm space-y-2.5">
                <h3 className="text-sm font-outfit font-extrabold text-foreground">
                  Growth Opportunities
                </h3>
                {opportunities.slice(0, 4).map((opp: any, i: number) => (
                  <div key={opp._id || i} className="p-3 rounded-2xl bg-muted/20 border border-border/60 text-xs">
                    <p className="font-bold text-foreground">{opp.title || opp.category || 'Opportunity'}</p>
                    {opp.description || opp.suggestion ? (
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {opp.description || opp.suggestion}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 2: LIVE COPILOT CHAT (Desktop Split Sessions + Stream) ── */}
      {activeTab === 'CHAT' && (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-[560px]">
          {/* Sessions Sidebar */}
          <aside className="lg:col-span-3 bg-card border border-border/80 rounded-3xl p-4 shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
                Conversations ({sessions.length})
              </h2>
              <Button
                type="button"
                size="sm"
                onClick={() => void handleNewSession()}
                disabled={sessionBusy}
                className="h-8 px-2.5 rounded-xl text-xs font-bold"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                New
              </Button>
            </div>

            <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto lg:max-h-[480px] pb-1">
              {sessions.length === 0 ? (
                <p className="text-xs text-muted-foreground py-2">
                  Send your first message to begin a synced session.
                </p>
              ) : (
                sessions.map((s) => {
                  const active = s.sessionId === sessionId;
                  return (
                    <div
                      key={s.sessionId}
                      className={`group flex items-center justify-between gap-2 px-3 py-2.5 rounded-2xl border text-xs transition-all shrink-0 lg:shrink ${
                        active
                          ? 'bg-primary/10 border-primary/40 text-foreground font-bold'
                          : 'bg-muted/20 border-border/60 text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => void handleSwitchSession(s)}
                        disabled={sessionBusy}
                        className="text-left truncate flex-1"
                      >
                        <span className="block truncate">{s.title || 'Conversation'}</span>
                        <span className="text-[10px] opacity-70 font-normal">
                          {s.messages.length} msgs
                        </span>
                      </button>
                      {sessions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => void handleDeleteSession(s.sessionId)}
                          disabled={sessionBusy}
                          className="p-1 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          title="Delete conversation"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </aside>

          {/* Main Chat Column */}
          <div className="lg:col-span-9 flex flex-col min-h-[520px] max-h-[72vh] bg-card border border-border/80 rounded-3xl shadow-sm overflow-hidden">
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
              {messages.map((m) => {
                const isBuddy = m.sender === 'buddy';
                const isCopied = copiedId === m.id;
                return (
                  <div key={m.id} className={`flex items-start gap-3 ${isBuddy ? '' : 'flex-row-reverse'}`}>
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-sm overflow-hidden ${
                        isBuddy
                          ? 'bg-gradient-to-tr from-primary to-accent text-white'
                          : 'bg-primary text-primary-foreground font-bold'
                      }`}
                    >
                      {isBuddy ? (
                        <img
                          src={companionAvatarUrl}
                          alt={companionName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <User className="w-4 h-4" />
                      )}
                    </div>

                    <div
                      className={`max-w-[85%] sm:max-w-[78%] rounded-3xl p-4 text-xs sm:text-sm leading-relaxed transition-all ${
                        isBuddy
                          ? 'bg-muted/30 text-foreground border border-border/70 shadow-sm'
                          : 'bg-primary text-primary-foreground font-medium shadow-md'
                      }`}
                    >
                      <div className="whitespace-pre-line font-normal">{m.text}</div>

                      <div className="flex items-center justify-between gap-3 mt-2 pt-2 border-t border-border/40 text-[10px]">
                        <span className={`font-mono ${isBuddy ? 'text-muted-foreground' : 'text-primary-foreground/80'}`}>
                          {m.timestamp}
                        </span>

                        {isBuddy && (
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => speakText(m.text)}
                              className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                              title="Listen aloud"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                              <span>Listen</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleCopyMessage(m.id, m.text)}
                              className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                              title="Copy text"
                            >
                              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                              <span>{isCopied ? 'Copied' : 'Copy'}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex items-center gap-3 p-3.5 bg-primary/5 border border-primary/20 rounded-2xl w-fit">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <span className="text-xs font-bold text-foreground">
                    {companionName} is synthesizing clinical protocol…
                  </span>
                </div>
              )}

              {chatError && (
                <div className="p-3.5 bg-destructive/10 border border-destructive/30 rounded-2xl text-xs font-bold text-destructive">
                  {chatError}
                </div>
              )}

              <div ref={chatBottomRef} />
            </div>

            {/* Suggested Quick Prompt Pills */}
            <div className="px-4 py-2 bg-muted/20 border-t border-border/60 flex items-center gap-2 overflow-x-auto">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider shrink-0">
                Suggested:
              </span>
              {SAMPLE_PROMPTS.slice(0, 4).map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => void handleSendMessage(prompt)}
                  className="px-3 py-1 bg-card hover:bg-primary/10 border border-border/80 hover:border-primary/30 rounded-full text-[11px] text-muted-foreground hover:text-foreground font-medium whitespace-nowrap transition-all shrink-0"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Chat Input Bar with Voice Support */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void handleSendMessage();
              }}
              className="p-3 bg-card border-t border-border/80 flex items-center gap-2"
            >
              <button
                type="button"
                onClick={toggleVoiceRecording}
                className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all shrink-0 ${
                  isVoiceRecording
                    ? 'bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-500/30'
                    : 'bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground border border-border'
                }`}
                title={isVoiceRecording ? 'Stop voice recording' : 'Dictate with voice'}
              >
                {isVoiceRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={`Ask ${companionName} about diagnosis, SOAP notes, red flags, or exercise protocols…`}
                className="h-11 rounded-2xl text-xs sm:text-sm bg-muted/30 focus-visible:ring-primary/40 border-border"
                disabled={isLoading || isVoiceRecording}
              />

              <Button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                className="h-11 w-11 p-0 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20 shrink-0 flex items-center justify-center"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* ── TAB 3: ECOSYSTEM STATS (Live Backend Data) ── */}
      {activeTab === 'ANALYTICS' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-card border border-border/80 p-5 rounded-3xl shadow-sm">
              <span className="text-xs font-bold text-muted-foreground">Companion Bond Score</span>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-primary mt-2">
                {relationship?.relationshipScore ?? buddyProfile?.friendshipLevel ?? 0}
              </div>
              <div className="text-[11px] text-muted-foreground mt-1">
                {relationship?.stage || relationship?.tier || 'Active Companion'}
              </div>
            </div>

            <div className="bg-card border border-border/80 p-5 rounded-3xl shadow-sm">
              <span className="text-xs font-bold text-muted-foreground">Synced Conversations</span>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-500 mt-2">
                {sessions.length}
              </div>
              <div className="text-[11px] text-muted-foreground mt-1">Shared across web & mobile</div>
            </div>

            <div className="bg-card border border-border/80 p-5 rounded-3xl shadow-sm">
              <span className="text-xs font-bold text-muted-foreground">Daily Missions Done</span>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-sky-500 mt-2">
                {completedMissionsCount}/{missions.length}
              </div>
              <div className="text-[11px] text-muted-foreground mt-1">Today&apos;s companion goals</div>
            </div>

            <div className="bg-card border border-border/80 p-5 rounded-3xl shadow-sm">
              <span className="text-xs font-bold text-muted-foreground">Mood Check-ins</span>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-amber-500 mt-2">
                {moodHistory.length}
              </div>
              <div className="text-[11px] text-muted-foreground mt-1">Recorded reflections</div>
            </div>
          </div>

          <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-outfit font-extrabold text-foreground">
              Live Therapist Ecosystem Snapshot
            </h3>
            {audit ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                {Object.entries(audit)
                  .filter(([, v]) => typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean')
                  .slice(0, 9)
                  .map(([key, val]) => (
                    <div key={key} className="p-3.5 rounded-2xl bg-muted/20 border border-border/60">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </p>
                      <p className="text-sm font-bold text-foreground mt-1 break-words">
                        {typeof val === 'boolean' ? (val ? 'Yes' : 'No') : String(val)}
                      </p>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                Ecosystem telemetry will populate here once your Buddy profile completes its next shift audit.
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 4: MEMORY VAULT ── */}
      {activeTab === 'MEMORY' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-7 bg-card border border-border/80 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-outfit font-extrabold text-foreground">
                  Companion Memories ({memories.length})
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Clinical context and personal milestones remembered by {companionName}.
                </p>
              </div>
              <Link
                href="/app/settings/buddy"
                className="text-xs font-bold text-primary hover:underline"
              >
                Edit Preferences
              </Link>
            </div>

            {memories.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4">
                No saved companion memories yet. As you chat with {companionName}, important clinical preferences and goals will be captured here.
              </p>
            ) : (
              <div className="space-y-2.5">
                {memories.map((mem: any, idx: number) => (
                  <div
                    key={mem._id || idx}
                    className="p-4 bg-muted/20 rounded-2xl border border-border/60 flex items-start justify-between gap-3 text-xs"
                  >
                    <div>
                      <p className="font-bold text-foreground">
                        {mem.title || mem.category || 'Saved Memory'}
                      </p>
                      <p className="text-muted-foreground mt-0.5">
                        {mem.content || mem.summary || mem.value || ''}
                      </p>
                    </div>
                    {mem.category ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary shrink-0 capitalize">
                        {mem.category}
                      </span>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-5 bg-card border border-border/80 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-outfit font-extrabold text-foreground">
              Active Profile Preferences
            </h3>
            <div className="space-y-3 text-xs">
              <div className="p-4 bg-muted/20 rounded-2xl border border-border/60">
                <p className="font-bold text-foreground">Clinical Specialization</p>
                <p className="text-muted-foreground text-[11px] mt-0.5">
                  {user?.specialization || 'Physiotherapy & Rehabilitation'}
                </p>
              </div>
              <div className="p-4 bg-muted/20 rounded-2xl border border-border/60">
                <p className="font-bold text-foreground">Companion Identity</p>
                <p className="text-muted-foreground text-[11px] mt-0.5">
                  {companionName} ({buddyProfile?.relationshipType || 'Clinical Coach'})
                </p>
              </div>
              <div className="p-4 bg-muted/20 rounded-2xl border border-border/60">
                <p className="font-bold text-foreground">Recent Mood History</p>
                {moodHistory.length === 0 ? (
                  <p className="text-muted-foreground text-[11px] mt-0.5">No check-ins logged yet.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {moodHistory.slice(-6).reverse().map((mh: any, i: number) => (
                      <span
                        key={i}
                        className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-card border border-border text-foreground"
                      >
                        {mh.note || mh.mood}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
