'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useProviderAuth } from '@/services/provider-auth-context';
import {
  Bot,
  Send,
  Sparkles,
  Stethoscope,
  ShieldCheck,
  User,
  Lightbulb,
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
  Layers,
  FileText,
  ChevronRight,
  RotateCcw,
  Sparkle,
  MessageSquare,
  BarChart3,
  Bookmark,
  Compass,
  Play,
  Share2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ChatMessage {
  id: string;
  sender: 'user' | 'buddy';
  text: string;
  timestamp: string;
  isSpeaking?: boolean;
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

export default function ProviderAIBuddyPage() {
  const { user } = useProviderAuth();
  const therapistName = user?.fullName || user?.name || 'Doctor';
  const isFemaleUser = (user?.gender || '').toLowerCase().startsWith('f');
  const companionName = isFemaleUser ? 'Rivan' : 'Tanya';
  const companionAvatarUrl = isFemaleUser ? '/images/avatar_m1.png' : '/images/avatar_f1.png';

  const [activeTab, setActiveTab] = useState<BuddyTab>('HUB');
  const [emotion, setEmotion] = useState<AvatarEmotion>('happy');
  const [selectedMood, setSelectedMood] = useState<string>('zap');
  const [moodFeedback, setMoodFeedback] = useState<string | null>(null);

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm_01',
      sender: 'buddy',
      text: `Hello ${therapistName}! 👋 I am ${companionName}, your Aries AI Clinical Copilot & Coach.\n\nI can assist you with evidence-based exercise progressions, differential orthopedic diagnoses, red flag emergency screenings, and SOAP note synthesis. What patient case are we managing today?`,
      timestamp: 'Just Now',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Voice & Audio Speech State
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [isTtsSpeaking, setIsTtsSpeaking] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const recognitionRef = useRef<any>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new message
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Speech Recognition Setup
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const reco = new SpeechRecognition();
        reco.continuous = false;
        reco.interimResults = false;
        reco.lang = 'en-IN';

        reco.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            setInputValue(transcript);
            handleSendMessage(transcript);
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
  }, [therapistName]);

  const toggleVoiceRecording = () => {
    if (!recognitionRef.current) {
      alert('Voice dictation is supported on Chrome, Edge, and Safari browsers.');
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
    const cleanText = text.replace(/[*#_]/g, '');
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
    const text = textToSend || inputValue;
    if (!text.trim()) return;

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
      const res = await fetch('/api/app/ai-copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: text,
          therapistName,
        }),
      });
      const data = await res.json();
      const replyText = data.reply || `Hello ${therapistName}! How can I assist with your clinical cases or doorstep exercise prescriptions today?`;

      const buddyMsg: ChatMessage = {
        id: 'msg_b_' + Date.now(),
        sender: 'buddy',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, buddyMsg]);
      setEmotion('happy');

      if (ttsEnabled) {
        speakText(replyText);
      }
    } catch {
      const buddyMsg: ChatMessage = {
        id: 'msg_b_' + Date.now(),
        sender: 'buddy',
        text: `Hello ${therapistName}! I'm ready to assist with your patient cases. Could you please share the diagnosis or protocol you would like to discuss?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, buddyMsg]);
      setEmotion('happy');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSelectMood = (mood: (typeof MOODS)[0]) => {
    setSelectedMood(mood.id);
    setMoodFeedback(mood.feedback);
    setEmotion('energized');
    setTimeout(() => setEmotion('happy'), 3000);
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto flex flex-col h-[calc(100vh-7.5rem)]">
      {/* ── Top Header & Interactive Avatar Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-card/90 backdrop-blur-md border border-border/80 rounded-3xl shadow-sm shrink-0">
        <div className="flex items-center gap-3.5">
          {/* Animated Interactive Avatar */}
          <div className="relative group cursor-pointer" onClick={() => setEmotion('energized')}>
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl overflow-hidden border-2 border-primary/40 shadow-lg animate-avatar-breath bg-gradient-to-tr from-primary/30 to-accent/20 flex items-center justify-center p-0.5">
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

            {/* Live Indicator Radar Halo */}
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-card flex items-center justify-center shadow-sm">
              <span className="w-full h-full rounded-full bg-emerald-400 animate-ping opacity-75" />
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg font-outfit font-extrabold tracking-tight text-foreground flex items-center gap-1.5">
                <span>{companionName}</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  Aries AI Copilot
                </span>
              </h1>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>
                {emotion === 'speaking'
                  ? '🗣️ Speaking aloud...'
                  : emotion === 'listening'
                  ? '🎙️ Listening to voice...'
                  : emotion === 'thinking'
                  ? '🧠 Analyzing clinical literature...'
                  : emotion === 'energized'
                  ? '⚡ Powered with Clinical Governance'
                  : '🟢 Active & Ready for Cases'}
              </span>
            </p>
          </div>
        </div>

        {/* Tab Switcher & Voice/Audio Controls */}
        <div className="flex items-center gap-2 flex-wrap self-end sm:self-auto">
          {/* Audio TTS Toggle */}
          <button
            onClick={() => setTtsEnabled(!ttsEnabled)}
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

          {/* Navigation Pill Tabs */}
          <div className="flex p-1 bg-muted/60 rounded-2xl border border-border/60">
            {(
              [
                { id: 'HUB', label: 'AI Coach Hub', icon: Compass },
                { id: 'CHAT', label: 'Copilot Chat', icon: MessageSquare },
                { id: 'ANALYTICS', label: 'Clinical Stats', icon: BarChart3 },
                { id: 'MEMORY', label: 'Memory Vault', icon: Brain },
              ] as const
            ).map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
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
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {/* Daily Motivation Card */}
          <div className="bg-gradient-to-r from-primary/15 via-accent/10 to-card border border-primary/20 rounded-3xl p-5 sm:p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-primary">
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Today's Clinical Insight & Focus</span>
              </div>
              <span className="text-[10px] font-mono text-muted-foreground bg-card/60 px-2 py-0.5 rounded-full border border-border/60">
                Evidence Level 1A
              </span>
            </div>

            <p className="text-sm font-outfit font-extrabold text-foreground leading-relaxed">
              &quot;Precise graded isometric tendon loading prior to heavy eccentrics stimulates tenocyte collagen remodeling while preserving patient pain thresholds below 3/10.&quot;
            </p>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-[11px] text-muted-foreground">Tailored for your doorstep orthopedics caseload</span>
              <Button
                size="sm"
                onClick={() => handleSendMessage('Explain progressive isometric to eccentric loading protocols for patellar tendinopathy')}
                className="h-8 px-3 rounded-xl bg-primary text-white text-xs font-bold"
              >
                <span>Explore Protocol</span>
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </div>

          {/* Daily Clinician Mood & Energy Check-in */}
          <div className="bg-card border border-border/80 rounded-3xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-outfit font-extrabold text-foreground">Clinician Energy & State Check-in</h3>
                <p className="text-[11px] text-muted-foreground">How are you feeling heading into today's patient sessions?</p>
              </div>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {MOODS.map((m) => {
                const Icon = m.icon;
                const isSelected = selectedMood === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => handleSelectMood(m)}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                      isSelected
                        ? `${m.color} shadow-sm scale-102`
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
              <div className="p-3 bg-primary/10 border border-primary/20 text-foreground text-xs font-medium rounded-2xl flex items-center gap-2 animate-in fade-in">
                <Sparkles className="w-4 h-4 text-primary shrink-0" />
                <span>{moodFeedback}</span>
              </div>
            )}
          </div>

          {/* Rapid Clinical Action Cards */}
          <div className="space-y-2">
            <h3 className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider px-1">
              Rapid Clinical Action Launchers
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                onClick={() => handleSendMessage('Generate complete SOAP note template for lumbar disc herniation')}
                className="p-4 rounded-3xl border border-border/80 bg-card hover:border-primary/50 cursor-pointer transition-all hover:shadow-md space-y-2 group"
              >
                <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-foreground">SOAP Assessment Generator</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Instantly synthesize structured Subjective, Objective, Assessment & Plan documentation.
                  </p>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  <span>Launch Generator</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>

              <div
                onClick={() => handleSendMessage('What are the urgent red flags checklist for acute spinal and neurological conditions?')}
                className="p-4 rounded-3xl border border-border/80 bg-card hover:border-rose-500/50 cursor-pointer transition-all hover:shadow-md space-y-2 group"
              >
                <div className="w-9 h-9 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-foreground">Emergency Red Flag Triage</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Screen for Cauda Equina, DVT, progressive motor deficit, and systemic pathology.
                  </p>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400">
                  <span>Open Safety Checklist</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>

              <div
                onClick={() => handleSendMessage('Post-TKR Day 10 range-of-motion exercise progressions')}
                className="p-4 rounded-3xl border border-border/80 bg-card hover:border-sky-500/50 cursor-pointer transition-all hover:shadow-md space-y-2 group"
              >
                <div className="w-9 h-9 rounded-2xl bg-sky-500/10 text-sky-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-foreground">Joint-Specific Exercise Progression</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Phase 1 to Phase 4 rehab pathways with exact sets, reps, and hold times.
                  </p>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-bold text-sky-600 dark:text-sky-400">
                  <span>Build Prescription</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>

              <div
                onClick={() => handleSendMessage('Differential diagnosis for acute lateral knee pain in a runner')}
                className="p-4 rounded-3xl border border-border/80 bg-card hover:border-amber-500/50 cursor-pointer transition-all hover:shadow-md space-y-2 group"
              >
                <div className="w-9 h-9 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Brain className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-foreground">Differential Diagnosis Matrix</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Evaluate special orthopedic test clusters (McMurray, Lachman, Ober, Spurling).
                  </p>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                  <span>Check Diagnostic Matrix</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: LIVE COPILOT CHAT ── */}
      {activeTab === 'CHAT' && (
        <div className="flex-1 flex flex-col min-h-0 bg-card border border-border/80 rounded-3xl shadow-sm overflow-hidden">
          {/* Chat Messages Stream */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
            {messages.map((m) => {
              const isBuddy = m.sender === 'buddy';
              const isCopied = copiedId === m.id;
              return (
                <div key={m.id} className={`flex items-start gap-3 ${isBuddy ? '' : 'flex-row-reverse'}`}>
                  {/* Avatar Thumbnail */}
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-sm overflow-hidden ${
                      isBuddy
                        ? 'bg-gradient-to-tr from-primary to-accent text-white'
                        : 'bg-primary text-white font-bold'
                    }`}
                  >
                    {isBuddy ? (
                      <img src={companionAvatarUrl} alt={companionName} className="w-full h-full object-cover" onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }} />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`max-w-[85%] sm:max-w-[78%] rounded-3xl p-4 text-xs leading-relaxed transition-all ${
                      isBuddy
                        ? 'bg-muted/30 text-foreground border border-border/70 shadow-sm'
                        : 'bg-primary text-white font-medium shadow-md'
                    }`}
                  >
                    <div className="whitespace-pre-line font-normal">{m.text}</div>

                    {/* Bottom Action Footer for AI Messages */}
                    <div className="flex items-center justify-between gap-3 mt-2 pt-2 border-t border-border/40 text-[10px]">
                      <span className={`font-mono ${isBuddy ? 'text-muted-foreground' : 'text-white/70'}`}>
                        {m.timestamp}
                      </span>

                      {isBuddy && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => speakText(m.text)}
                            className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                            title="Listen aloud"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>Listen</span>
                          </button>

                          <button
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
              <div className="flex items-center gap-3 p-3.5 bg-primary/5 border border-primary/20 rounded-2xl w-fit animate-in fade-in">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span className="text-xs font-bold text-foreground">
                  {companionName} is synthesizing clinical protocol...
                </span>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Suggested Quick Prompt Pills */}
          <div className="px-4 py-2 bg-muted/20 border-t border-border/60 flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider shrink-0">
              Suggested:
            </span>
            {SAMPLE_PROMPTS.slice(0, 4).map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(prompt)}
                className="px-3 py-1 bg-card hover:bg-primary/10 border border-border/80 hover:border-primary/30 rounded-full text-[11px] text-muted-foreground hover:text-foreground font-medium whitespace-nowrap transition-all shadow-2xs shrink-0"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Chat Input Bar with Voice Support */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-card border-t border-border/80 flex items-center gap-2"
          >
            {/* Voice Dictation Button */}
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
              placeholder={`Ask ${companionName} regarding diagnosis, SOAP notes, red flags, or exercise protocols...`}
              className="h-11 rounded-2xl text-xs bg-muted/30 focus-visible:ring-primary/40 border-border"
              disabled={isLoading || isVoiceRecording}
            />

            <Button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="h-11 w-11 p-0 rounded-2xl bg-primary hover:bg-primary/90 text-white shadow-md shadow-primary/20 shrink-0 flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      )}

      {/* ── TAB 3: CLINICAL ANALYTICS ── */}
      {activeTab === 'ANALYTICS' && (
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-card border border-border/80 p-5 rounded-3xl shadow-sm">
              <span className="text-xs font-bold text-muted-foreground">Diagnostic Precision</span>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-500 mt-2">98.4%</div>
              <div className="text-[11px] text-muted-foreground mt-1">Audit score by Clinical Director</div>
            </div>

            <div className="bg-card border border-border/80 p-5 rounded-3xl shadow-sm">
              <span className="text-xs font-bold text-muted-foreground">AI Clinical Assists</span>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-primary mt-2">142</div>
              <div className="text-[11px] text-muted-foreground mt-1">Exercise & SOAP queries</div>
            </div>

            <div className="bg-card border border-border/80 p-5 rounded-3xl shadow-sm">
              <span className="text-xs font-bold text-muted-foreground">SOAP Compliance</span>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-sky-500 mt-2">99.1%</div>
              <div className="text-[11px] text-muted-foreground mt-1">Doorstep session parity</div>
            </div>

            <div className="bg-card border border-border/80 p-5 rounded-3xl shadow-sm">
              <span className="text-xs font-bold text-muted-foreground">Red Flag Screenings</span>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-amber-500 mt-2">100%</div>
              <div className="text-[11px] text-muted-foreground mt-1">Zero missed acute referrals</div>
            </div>
          </div>

          <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-outfit font-extrabold text-foreground">Weekly Clinical Query Distribution</h3>
            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between font-bold mb-1">
                  <span>Orthopedics & Post-Op Joint Mobilization</span>
                  <span className="font-mono text-primary">54%</span>
                </div>
                <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: '54%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-bold mb-1">
                  <span>Spine Biomechanics & Lumbar Radiculopathy</span>
                  <span className="font-mono text-emerald-500">26%</span>
                </div>
                <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '26%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-bold mb-1">
                  <span>Neuro Gait & Stroke Motor Re-Education</span>
                  <span className="font-mono text-sky-500">14%</span>
                </div>
                <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-sky-500 rounded-full" style={{ width: '14%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-bold mb-1">
                  <span>Sports Injury & Return-to-Play Testing</span>
                  <span className="font-mono text-amber-500">6%</span>
                </div>
                <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: '6%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 4: MEMORY VAULT ── */}
      {activeTab === 'MEMORY' && (
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-outfit font-extrabold text-foreground">Clinical Memory & Preferences</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Customized treatment parameters and clinical preferences remembered by {companionName}.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-4 bg-muted/20 rounded-2xl border border-border/60 flex items-center justify-between">
                <div>
                  <p className="font-bold text-foreground">Clinical Specialization Focus</p>
                  <p className="text-muted-foreground text-[11px]">{user?.specialization || 'Orthopedic & Neuro Physical Therapy'}</p>
                </div>
                <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  Active
                </span>
              </div>

              <div className="p-4 bg-muted/20 rounded-2xl border border-border/60 flex items-center justify-between">
                <div>
                  <p className="font-bold text-foreground">Voice Assistant Speed & Speech Tone</p>
                  <p className="text-muted-foreground text-[11px]">Indian Clinical English (Friendly + Professional)</p>
                </div>
                <span className="text-[10px] font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
                  Configured
                </span>
              </div>

              <div className="p-4 bg-muted/20 rounded-2xl border border-border/60 flex items-center justify-between">
                <div>
                  <p className="font-bold text-foreground">Preferred Modality Combinations</p>
                  <p className="text-muted-foreground text-[11px]">Manual Joint Mobilization + Graded Eccentric Exercise + Dry Needling</p>
                </div>
                <span className="text-[10px] font-bold text-purple-500 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20">
                  Preferred
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
