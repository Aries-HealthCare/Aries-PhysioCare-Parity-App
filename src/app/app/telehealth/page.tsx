'use client';

import React, { useState, useEffect } from 'react';
import { useProviderAuth } from '@/services/provider-auth-context';
import {
  Video,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  MessageSquare,
  FileText,
  Clock,
  Send,
  User,
  ShieldCheck,
  CheckCircle2,
  Share2,
  Sparkles,
  Stethoscope,
  Plus,
  Trash2,
  Save,
  Volume2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ProviderTelehealthPage() {
  const { user } = useProviderAuth();
  const [isInCall, setIsInCall] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDurationSeconds, setCallDurationSeconds] = useState(0);
  const [activeDrawer, setActiveDrawer] = useState<'RECORD' | 'PRESCRIPTION' | 'CHAT'>('RECORD');
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'therapist' | 'patient'; text: string; time: string }>>([]);
  const [chatInput, setChatInput] = useState('');

  // Prescription items
  const [exercises, setExercises] = useState<Array<{ name: string; sets: string; reps: string; hold: string }>>([]);
  const [newExName, setNewExName] = useState('');

  // Call timer
  useEffect(() => {
    if (!isInCall) return;
    const timer = setInterval(() => setCallDurationSeconds((prev) => prev + 1), 1000);
    return () => clearInterval(timer);
  }, [isInCall]);

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleStartCall = () => {
    setIsInCall(true);
    setCallDurationSeconds(0);
  };

  const handleEndCall = () => {
    setIsInCall(false);
    alert('Telehealth consultation completed. Session summary and exercise prescription transmitted to patient WhatsApp & Aries App.');
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setChatMessages([
      ...chatMessages,
      { sender: 'therapist', text: chatInput, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
    ]);
    setChatInput('');
  };

  const handleAddExercise = () => {
    if (!newExName.trim()) return;
    setExercises([...exercises, { name: newExName.trim(), sets: '3 Sets', reps: '10 Reps', hold: '5 sec hold' }]);
    setNewExName('');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Video className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-outfit font-extrabold tracking-tight">Telehealth Video Suite</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Encrypted HD video consultation suite with live exercise prescription and real-time SOAP assessment notes.
          </p>
        </div>

        {isInCall && (
          <div className="flex items-center gap-2 bg-destructive/10 text-destructive border border-destructive/20 px-3 py-1.5 rounded-2xl text-xs font-mono font-bold animate-pulse">
            <span className="w-2 h-2 rounded-full bg-destructive animate-ping" />
            <span>SESSION LIVE • {formatTimer(callDurationSeconds)}</span>
          </div>
        )}
      </div>

      {!isInCall ? (
        /* Pre-Call Lobby / Patient Queued Card */
        <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 max-w-2xl mx-auto text-center">
          <div className="w-16 h-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mx-auto shadow-inner">
            <Video className="w-8 h-8" />
          </div>

          <div>
            <span className="text-[10px] font-mono font-bold text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              Patient Ready in Waiting Room
            </span>
            <h2 className="text-xl sm:text-2xl font-outfit font-black text-foreground mt-2">
              Tele-Rehab Consultation: Mrs. Sunita Sharma
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Condition: <strong className="text-foreground">Cervical Spondylosis & Ergonomic Postural Guidance</strong> • 30 Min Session
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 p-4 bg-muted/30 rounded-2xl text-xs text-left">
            <div>
              <p className="text-muted-foreground">Patient Age & Gender:</p>
              <p className="font-bold text-foreground mt-0.5">48y, Female (Mumbai)</p>
            </div>
            <div>
              <p className="text-muted-foreground">Session Number:</p>
              <p className="font-bold text-primary mt-0.5">Session 2 of 5</p>
            </div>
          </div>

          <Button
            onClick={handleStartCall}
            className="w-full h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-outfit font-extrabold text-sm shadow-xl shadow-emerald-600/20"
          >
            Launch Video Consultation Room ➔
          </Button>
        </div>
      ) : (
        /* Live Video Room Grid */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Video Viewport (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="relative aspect-video rounded-3xl bg-slate-950 border-2 border-primary/40 overflow-hidden shadow-2xl flex items-center justify-center">
              {/* Remote Patient Video Simulation */}
              <div className="text-center space-y-2">
                <div className="w-24 h-24 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-3xl font-bold mx-auto border-2 border-slate-700">
                  SS
                </div>
                <p className="text-sm font-outfit font-extrabold text-white">Mrs. Sunita Sharma</p>
                <p className="text-xs text-emerald-400 font-mono">● 1080p HD Audio & Video Active</p>
              </div>

              {/* Local Therapist Floating Camera */}
              <div className="absolute top-4 right-4 w-36 sm:w-44 aspect-video rounded-2xl bg-slate-900 border-2 border-white/20 overflow-hidden shadow-lg flex items-center justify-center">
                {isVideoOff ? (
                  <div className="text-[11px] text-slate-400 font-bold">Camera Off</div>
                ) : (
                  <div className="text-center p-2">
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold mx-auto">
                      {user?.fullName?.[0] || 'D'}
                    </div>
                    <p className="text-[10px] text-slate-300 font-bold mt-1 truncate">You (Dr. {user?.fullName || 'Therapist'})</p>
                  </div>
                )}
              </div>

              {/* Call Controls Bar */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/60 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 shadow-2xl">
                <button
                  type="button"
                  onClick={() => setIsMicMuted(!isMicMuted)}
                  className={`p-3 rounded-xl transition-all ${
                    isMicMuted ? 'bg-destructive text-white' : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                  title={isMicMuted ? 'Unmute' : 'Mute'}
                >
                  {isMicMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>

                <button
                  type="button"
                  onClick={() => setIsVideoOff(!isVideoOff)}
                  className={`p-3 rounded-xl transition-all ${
                    isVideoOff ? 'bg-destructive text-white' : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                  title={isVideoOff ? 'Turn Camera On' : 'Turn Camera Off'}
                >
                  {isVideoOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                </button>

                <button
                  type="button"
                  onClick={handleEndCall}
                  className="px-4 py-3 rounded-xl bg-destructive hover:bg-destructive/90 text-white font-outfit font-extrabold text-xs flex items-center gap-2 shadow-lg"
                >
                  <PhoneOff className="w-4 h-4" />
                  <span>End Session</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Clinical Drawer (1 col) */}
          <div className="bg-card border border-border/80 rounded-3xl p-5 shadow-sm flex flex-col space-y-4 h-[520px]">
            {/* Drawer Tabs */}
            <div className="flex gap-1 p-1 bg-muted/40 rounded-2xl border border-border/60 shrink-0">
              <button
                onClick={() => setActiveDrawer('RECORD')}
                className={`flex-1 py-1.5 text-xs font-outfit font-bold rounded-xl transition-all ${
                  activeDrawer === 'RECORD' ? 'bg-primary text-white shadow-sm' : 'text-muted-foreground'
                }`}
              >
                Patient File
              </button>
              <button
                onClick={() => setActiveDrawer('PRESCRIPTION')}
                className={`flex-1 py-1.5 text-xs font-outfit font-bold rounded-xl transition-all ${
                  activeDrawer === 'PRESCRIPTION' ? 'bg-primary text-white shadow-sm' : 'text-muted-foreground'
                }`}
              >
                Prescription
              </button>
              <button
                onClick={() => setActiveDrawer('CHAT')}
                className={`flex-1 py-1.5 text-xs font-outfit font-bold rounded-xl transition-all ${
                  activeDrawer === 'CHAT' ? 'bg-primary text-white shadow-sm' : 'text-muted-foreground'
                }`}
              >
                In-Call Chat
              </button>
            </div>

            {/* TAB 1: PATIENT FILE */}
            {activeDrawer === 'RECORD' && (
              <div className="flex-1 overflow-y-auto space-y-3 text-xs">
                <div className="p-3.5 bg-muted/30 rounded-2xl space-y-1">
                  <p className="font-bold text-foreground">Clinical Diagnosis</p>
                  <p className="text-muted-foreground">Cervical Spondylosis with upper trapezius spasm.</p>
                </div>
                <div className="p-3.5 bg-muted/30 rounded-2xl space-y-1">
                  <p className="font-bold text-foreground">Baseline VAS Pain Score</p>
                  <p className="text-amber-500 font-mono font-extrabold">6 / 10 (Moderate to Severe)</p>
                </div>
                <div className="p-3.5 bg-muted/30 rounded-2xl space-y-1">
                  <p className="font-bold text-foreground">Session 1 Notes</p>
                  <p className="text-muted-foreground">
                    Performed active-assisted chin tucks and levator scapulae gentle stretching. Recommended ergonomic display height.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 2: LIVE PRESCRIPTION GENERATOR */}
            {activeDrawer === 'PRESCRIPTION' && (
              <div className="flex-1 flex flex-col space-y-3 overflow-hidden text-xs">
                <div className="flex gap-2 shrink-0">
                  <Input
                    placeholder="Add exercise name..."
                    value={newExName}
                    onChange={(e) => setNewExName(e.target.value)}
                    className="h-9 rounded-xl text-xs"
                  />
                  <Button onClick={handleAddExercise} size="sm" className="h-9 px-3 rounded-xl font-bold">
                    <Plus className="w-3.5 h-3.5" />
                  </Button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2">
                  {exercises.map((ex, idx) => (
                    <div key={idx} className="p-3 bg-muted/30 rounded-2xl border border-border/60 space-y-1">
                      <div className="flex items-center justify-between font-bold text-foreground">
                        <span>{ex.name}</span>
                        <button
                          onClick={() => setExercises(exercises.filter((_, i) => i !== idx))}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          ✕
                        </button>
                      </div>
                      <p className="text-[11px] text-primary font-mono font-bold">
                        {ex.sets} • {ex.reps} • {ex.hold}
                      </p>
                    </div>
                  ))}
                </div>

                <Button size="sm" className="w-full h-9 rounded-xl bg-primary text-white font-bold text-xs shrink-0">
                  <Save className="w-3.5 h-3.5 mr-1" />
                  <span>Transmit to Patient App</span>
                </Button>
              </div>
            )}

            {/* TAB 3: IN-CALL CHAT */}
            {activeDrawer === 'CHAT' && (
              <div className="flex-1 flex flex-col space-y-3 overflow-hidden text-xs">
                <div className="flex-1 overflow-y-auto space-y-2">
                  {chatMessages.map((msg, i) => (
                    <div
                      key={i}
                      className={`p-2.5 rounded-2xl max-w-[85%] ${
                        msg.sender === 'therapist'
                          ? 'ml-auto bg-primary text-white font-medium'
                          : 'bg-muted/40 text-foreground border border-border/60'
                      }`}
                    >
                      <p>{msg.text}</p>
                      <span className="text-[9px] opacity-70 block text-right mt-0.5">{msg.time}</span>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSendChat} className="flex gap-2 shrink-0">
                  <Input
                    placeholder="Type message to patient..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    className="h-9 rounded-xl text-xs"
                  />
                  <Button type="submit" size="sm" className="h-9 px-3 rounded-xl">
                    <Send className="w-3.5 h-3.5" />
                  </Button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
