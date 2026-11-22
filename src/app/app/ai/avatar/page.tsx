'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useProviderAuth } from '@/services/provider-auth-context';
import { providerApi } from '@/services/provider-api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Square,
  Send,
  Copy,
  Check,
  Sparkles,
  Bot,
  Settings,
  ArrowLeft,
  Loader2,
  AudioLines,
  MessageSquare,
} from 'lucide-react';

type StudioState = 'idle' | 'listening' | 'thinking' | 'speaking';

interface StudioTurn {
  id: string;
  sender: 'user' | 'avatar';
  text: string;
  timestamp: string;
}

const VOICE_STARTERS = [
  'Walk me through a 5-minute shoulder impingement home plan',
  'Quick red-flag screen for an elderly patient with acute back pain',
  'Help me explain lumbar disc bulge recovery to an anxious patient',
  'Summarize post-ACL Week 4 milestones',
];

const SPEECH_RATES = [0.9, 1.0, 1.15, 1.25] as const;

export default function WebAIAvatarStudioPage() {
  const { user } = useProviderAuth();
  const { toast } = useToast();

  const therapistName = user?.fullName || user?.name || 'Doctor';
  const isFemaleUser = (user?.gender || '').toLowerCase().startsWith('f');
  const defaultName = isFemaleUser ? 'Rivan' : 'Tanya';
  const avatarImage = isFemaleUser ? '/images/avatar_m1.png' : '/images/avatar_f1.png';

  const [companionName, setCompanionName] = useState(defaultName);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [studioState, setStudioState] = useState<StudioState>('idle');
  const [muted, setMuted] = useState(false);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceUri, setSelectedVoiceUri] = useState<string>('');
  const [speechSupported, setSpeechSupported] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [textInput, setTextInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [turns, setTurns] = useState<StudioTurn[]>([
    {
      id: 'welcome',
      sender: 'avatar',
      text: `Hi ${therapistName}! Tap the microphone or type below to start a hands-free clinical conversation.`,
      timestamp: 'Ready',
    },
  ]);

  const recognitionRef = useRef<any>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const submitTurnRef = useRef<(spokenText: string) => void>(() => {});

  // Hydrate companion identity & active session
  useEffect(() => {
    let active = true;
    providerApi
      .getBuddyProfile()
      .then((res) => {
        if (!active || !res) return;
        const prof = res.profile || res;
        if (prof?.aiCustomName) setCompanionName(String(prof.aiCustomName));
        if (prof?.activeSessionId) setSessionId(String(prof.activeSessionId));
      })
      .catch(() => {
        // Fallback to default identity
      });
    return () => {
      active = false;
    };
  }, []);

  // Load browser SpeechSynthesis voices
  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    const syncVoices = () => {
      const list = window.speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith('en'));
      setVoices(list);
      if (list.length > 0) {
        const preferred = list.find((v) => v.lang === 'en-IN') || list[0];
        if (preferred) {
          setSelectedVoiceUri((prev) => prev || preferred.voiceURI);
        }
      }
    };
    syncVoices();
    window.speechSynthesis.onvoiceschanged = syncVoices;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  // Auto-scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [turns, interimTranscript, studioState]);

  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setStudioState((prev) => (prev === 'speaking' ? 'idle' : prev));
  }, []);

  const speakResponse = useCallback(
    (text: string) => {
      if (muted || typeof window === 'undefined' || !window.speechSynthesis) {
        setStudioState('idle');
        return;
      }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text.replace(/[*#_`]/g, ''));
      utterance.rate = speechRate;
      utterance.lang = 'en-IN';
      if (selectedVoiceUri) {
        const match = voices.find((v) => v.voiceURI === selectedVoiceUri);
        if (match) utterance.voice = match;
      }
      utterance.onstart = () => setStudioState('speaking');
      utterance.onend = () => setStudioState('idle');
      utterance.onerror = () => setStudioState('idle');
      window.speechSynthesis.speak(utterance);
    },
    [muted, speechRate, selectedVoiceUri, voices]
  );

  const submitTurn = useCallback(
    async (rawText: string) => {
      const clean = rawText.trim();
      if (!clean) return;

      stopSpeaking();
      const userTurn: StudioTurn = {
        id: `u_${Date.now()}`,
        sender: 'user',
        text: clean,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setTurns((prev) => [...prev, userTurn]);
      setTextInput('');
      setInterimTranscript('');
      setStudioState('thinking');

      try {
        let replyText = '';
        try {
          const buddyRes = await providerApi.sendBuddyChat(clean, sessionId || undefined);
          if (buddyRes.sessionId) setSessionId(buddyRes.sessionId);
          replyText = buddyRes.reply || '';
        } catch {
          const consultRes = await providerApi.aiConsult(clean, { domain: 'general' });
          replyText = consultRes?.reply || consultRes?.answer || consultRes?.response || '';
        }

        if (!replyText) {
          throw new Error('No response was returned by the clinical companion service.');
        }

        const avatarTurn: StudioTurn = {
          id: `a_${Date.now()}`,
          sender: 'avatar',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setTurns((prev) => [...prev, avatarTurn]);
        speakResponse(replyText);
      } catch (err: any) {
        setStudioState('idle');
        toast({
          title: 'Companion did not respond',
          description: err?.message || 'Check your connection and try again.',
          variant: 'destructive',
        });
      }
    },
    [sessionId, speakResponse, stopSpeaking, toast]
  );

  submitTurnRef.current = submitTurn;

  // Initialize Web Speech API recognition + clean unmount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    setSpeechSupported(true);
    const reco = new SpeechRecognition();
    reco.continuous = false;
    reco.interimResults = true;
    reco.lang = 'en-IN';

    reco.onresult = (event: any) => {
      let interim = '';
      let finalChunk = '';
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const piece = event.results[i][0]?.transcript || '';
        if (event.results[i].isFinal) {
          finalChunk += piece;
        } else {
          interim += piece;
        }
      }
      if (interim) setInterimTranscript(interim);
      if (finalChunk.trim()) {
        setInterimTranscript('');
        void submitTurnRef.current(finalChunk.trim());
      }
    };

    reco.onerror = (ev: any) => {
      setStudioState('idle');
      setInterimTranscript('');
      if (ev?.error === 'not-allowed') {
        toast({
          title: 'Microphone access blocked',
          description: 'Allow microphone permission in Browser Permissions to speak hands-free.',
          variant: 'destructive',
        });
      }
    };

    reco.onend = () => {
      setStudioState((prev) => (prev === 'listening' ? 'idle' : prev));
    };

    recognitionRef.current = reco;

    return () => {
      try {
        reco.abort();
      } catch {
        // ignore
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [toast]);

  const toggleMic = () => {
    if (!speechSupported || !recognitionRef.current) {
      toast({
        title: 'Speech dictation not supported in this browser',
        description: 'Use Chrome, Edge, or Safari for voice input, or type in the transcript box.',
      });
      return;
    }

    if (studioState === 'listening') {
      recognitionRef.current.stop();
      setStudioState('idle');
      return;
    }

    // Barge-in: cancel ongoing speech before listening
    stopSpeaking();
    setInterimTranscript('');
    try {
      recognitionRef.current.start();
      setStudioState('listening');
    } catch {
      setStudioState('idle');
    }
  };

  const handleCopy = (id: string, text: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      void navigator.clipboard.writeText(text);
    }
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const stateBadge =
    studioState === 'listening'
      ? { label: 'Listening…', tone: 'bg-rose-500/15 text-rose-500 border-rose-500/30' }
      : studioState === 'thinking'
      ? { label: 'Synthesizing…', tone: 'bg-amber-500/15 text-amber-500 border-amber-500/30' }
      : studioState === 'speaking'
      ? { label: 'Speaking Aloud', tone: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30' }
      : { label: 'Ready for Voice', tone: 'bg-primary/10 text-primary border-primary/25' };

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {/* Studio Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-border bg-card px-5 py-3.5 shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            href="/app/buddy"
            className="p-2 rounded-xl border border-border hover:bg-muted transition-colors"
            title="Back to Buddy Hub"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-outfit font-extrabold text-foreground">
                {companionName} — Web AI Avatar Studio
              </h1>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${stateBadge.tone}`}>
                {stateBadge.label}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Hands-free voice clinical companion powered by Web Speech API & Aries Buddy
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/app/ai"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border text-xs font-bold hover:bg-muted transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            Intelligence
          </Link>
          <Link
            href="/app/settings/buddy"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border text-xs font-bold hover:bg-muted transition-colors"
          >
            <Settings className="w-3.5 h-3.5" />
            Persona
          </Link>
        </div>
      </div>

      {/* Main Responsive Split Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left: Interactive Avatar Stage & Audio Controls */}
        <section className="lg:col-span-5 rounded-3xl border border-border bg-gradient-to-b from-primary/10 via-card to-card p-6 shadow-sm flex flex-col items-center justify-between gap-6">
          {/* Avatar Visualizer Stage */}
          <div className="flex flex-col items-center justify-center py-6 relative w-full">
            <div className="relative flex items-center justify-center">
              {/* Outer reactive ring */}
              <div
                className={`absolute w-56 h-56 rounded-full transition-all duration-500 ${
                  studioState === 'listening'
                    ? 'bg-rose-500/15 ring-2 ring-rose-500/40 animate-ping'
                    : studioState === 'speaking'
                    ? 'bg-emerald-500/15 ring-2 ring-emerald-500/40 animate-pulse'
                    : studioState === 'thinking'
                    ? 'bg-amber-500/15 ring-2 ring-amber-500/40 animate-pulse'
                    : 'bg-primary/10 ring-1 ring-primary/20'
                }`}
              />
              {/* Inner halo */}
              <div
                className={`absolute w-44 h-44 rounded-full transition-all duration-300 ${
                  studioState === 'speaking'
                    ? 'bg-emerald-500/20 scale-105'
                    : studioState === 'listening'
                    ? 'bg-rose-500/20 scale-105'
                    : 'bg-primary/10'
                }`}
              />
              {/* Companion Portrait */}
              <div className="relative w-36 h-36 sm:w-40 sm:h-40 rounded-full overflow-hidden border-4 border-card shadow-2xl bg-gradient-to-tr from-primary/30 to-accent/30 flex items-center justify-center">
                <img
                  src={avatarImage}
                  alt={companionName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = 'none';
                  }}
                />
                <Bot className="w-14 h-14 text-primary hidden" />
              </div>
            </div>

            <div className="mt-6 text-center space-y-1 max-w-xs">
              <p className="text-base font-extrabold text-foreground">{companionName}</p>
              <p className="text-xs text-muted-foreground min-h-[2.25rem]">
                {interimTranscript
                  ? `“${interimTranscript}”`
                  : studioState === 'listening'
                  ? 'Speak naturally — I am listening…'
                  : studioState === 'thinking'
                  ? 'Reviewing clinical protocols…'
                  : studioState === 'speaking'
                  ? 'Tap Stop or Mic anytime to interrupt'
                  : 'Tap the mic below to talk, or pick a prompt on the right'}
              </p>
            </div>
          </div>

          {/* Primary Studio Controls */}
          <div className="w-full space-y-4">
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  if (!muted) stopSpeaking();
                  setMuted(!muted);
                }}
                className={`h-12 w-12 rounded-2xl border flex items-center justify-center transition-colors ${
                  muted
                    ? 'bg-muted border-border text-muted-foreground'
                    : 'bg-primary/10 border-primary/30 text-primary'
                }`}
                title={muted ? 'Unmute avatar voice' : 'Mute avatar voice'}
              >
                {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>

              <button
                type="button"
                onClick={toggleMic}
                disabled={studioState === 'thinking'}
                className={`h-16 w-16 rounded-full flex items-center justify-center shadow-lg transition-all ${
                  studioState === 'listening'
                    ? 'bg-rose-500 text-white scale-105 shadow-rose-500/40'
                    : 'bg-primary text-primary-foreground hover:scale-105 shadow-primary/30'
                }`}
                title={studioState === 'listening' ? 'Stop listening' : 'Tap to speak'}
              >
                {studioState === 'thinking' ? (
                  <Loader2 className="w-7 h-7 animate-spin" />
                ) : studioState === 'listening' ? (
                  <MicOff className="w-7 h-7" />
                ) : (
                  <Mic className="w-7 h-7" />
                )}
              </button>

              <button
                type="button"
                onClick={stopSpeaking}
                disabled={studioState !== 'speaking'}
                className="h-12 w-12 rounded-2xl border border-border bg-card text-foreground disabled:opacity-40 flex items-center justify-center hover:bg-muted transition-colors"
                title="Stop speaking (barge-in)"
              >
                <Square className="w-4 h-4 fill-current" />
              </button>
            </div>

            {/* Speech Speed & Voice Picker */}
            <div className="rounded-2xl border border-border/70 bg-muted/20 p-3.5 space-y-3 text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-muted-foreground flex items-center gap-1.5">
                  <AudioLines className="w-3.5 h-3.5 text-primary" />
                  Voice Speed
                </span>
                <div className="flex items-center gap-1">
                  {SPEECH_RATES.map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => setSpeechRate(rate)}
                      className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                        speechRate === rate
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-card border border-border text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>
              </div>

              {voices.length > 0 && (
                <div className="flex items-center justify-between gap-2">
                  <label htmlFor="avatar-voice-select" className="font-bold text-muted-foreground shrink-0">
                    Browser Voice
                  </label>
                  <select
                    id="avatar-voice-select"
                    value={selectedVoiceUri}
                    onChange={(e) => setSelectedVoiceUri(e.target.value)}
                    className="h-8 rounded-xl border border-border bg-card px-2 text-[11px] max-w-[200px] truncate"
                  >
                    {voices.slice(0, 12).map((v) => (
                      <option key={v.voiceURI} value={v.voiceURI}>
                        {v.name} ({v.lang})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {!speechSupported && (
                <p className="text-[11px] text-amber-600 dark:text-amber-400">
                  Browser speech recognition is unavailable here — use the text box on the right and audio playback still works.
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Right: Live Transcript & Text Fallback */}
        <section className="lg:col-span-7 rounded-3xl border border-border bg-card shadow-sm flex flex-col min-h-[520px] max-h-[76vh] overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border/70 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-extrabold text-foreground">
              <MessageSquare className="w-4 h-4 text-primary" />
              Live Studio Transcript
            </div>
            <span className="text-[11px] text-muted-foreground">
              {turns.length} turn{turns.length === 1 ? '' : 's'}
            </span>
          </div>

          <div className="flex-1 p-5 overflow-y-auto space-y-4">
            {turns.map((t) => {
              const isAvatar = t.sender === 'avatar';
              return (
                <div key={t.id} className={`flex flex-col ${isAvatar ? 'items-start' : 'items-end'}`}>
                  <div
                    className={`max-w-[88%] rounded-3xl px-4 py-3 text-sm leading-relaxed ${
                      isAvatar
                        ? 'bg-muted/35 border border-border/70 text-foreground'
                        : 'bg-primary text-primary-foreground'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{t.text}</p>
                    <div className="flex items-center justify-between gap-4 mt-2 pt-1.5 border-t border-border/30 text-[10px]">
                      <span className={isAvatar ? 'text-muted-foreground font-mono' : 'text-primary-foreground/80 font-mono'}>
                        {isAvatar ? companionName : 'You'} • {t.timestamp}
                      </span>
                      {isAvatar && (
                        <div className="flex items-center gap-2.5">
                          <button
                            type="button"
                            onClick={() => speakResponse(t.text)}
                            className="text-muted-foreground hover:text-primary flex items-center gap-1"
                          >
                            <Volume2 className="w-3 h-3" />
                            Replay
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCopy(t.id, t.text)}
                            className="text-muted-foreground hover:text-primary flex items-center gap-1"
                          >
                            {copiedId === t.id ? (
                              <Check className="w-3 h-3 text-emerald-500" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                            {copiedId === t.id ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {studioState === 'thinking' && (
              <div className="inline-flex items-center gap-2 rounded-2xl bg-primary/10 border border-primary/20 px-3.5 py-2 text-xs font-bold text-primary">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                {companionName} is thinking…
              </div>
            )}
            <div ref={transcriptEndRef} />
          </div>

          {/* Voice Starter Chips */}
          <div className="px-4 py-2 border-t border-border/60 bg-muted/20 flex items-center gap-2 overflow-x-auto">
            {VOICE_STARTERS.map((starter) => (
              <button
                key={starter}
                type="button"
                disabled={studioState === 'thinking'}
                onClick={() => void submitTurn(starter)}
                className="px-3 py-1 rounded-full bg-card border border-border hover:border-primary/40 text-[11px] text-muted-foreground hover:text-foreground whitespace-nowrap shrink-0 transition-colors"
              >
                {starter}
              </button>
            ))}
          </div>

          {/* Text Composer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void submitTurn(textInput);
            }}
            className="p-3.5 border-t border-border/80 flex items-center gap-2"
          >
            <Input
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder={`Speak with mic or type to ${companionName}…`}
              disabled={studioState === 'thinking'}
              className="h-11 rounded-2xl text-sm"
            />
            <Button
              type="submit"
              disabled={studioState === 'thinking' || !textInput.trim()}
              className="h-11 px-4 rounded-2xl font-bold text-xs shrink-0"
            >
              <Send className="w-4 h-4 mr-1.5" />
              Send
            </Button>
          </form>
        </section>
      </div>
    </div>
  );
}
