'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { providerApi } from '@/services/provider-api';
import {
  Video,
  Clock,
  Plus,
  Trash2,
  Send,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  PhoneOff,
  User,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

/**
 * Telehealth Video Suite.
 *
 * The backend provisions the actual consultation room:
 *   POST /api/app/appointment/:id/start-telehealth → { meetLink, roomId, provider, agoraAppId }
 *        (also sends the patient their WhatsApp / email invite)
 *   PUT  /api/app/appointment/:id/assessment       → exercise prescription + notes
 *   POST /api/app/appointment/:id/end-telehealth
 *
 * The session list is the provider's real appointment list filtered to tele-consults, so
 * the queue matches the mobile telehealth screen. Nothing about the patient, the session
 * number or the room is simulated here.
 */

interface Exercise {
  name: string;
  sets: string;
  reps: string;
  hold: string;
}

interface ActiveSession {
  appointmentId: string;
  meetLink?: string;
  roomId?: string;
  provider?: string;
  startedAt: number;
}

function patientNameOf(appointment: any) {
  return (
    appointment?.patient?.fullName ||
    appointment?.patient?.name ||
    appointment?.patientName ||
    [appointment?.patient?.firstName, appointment?.patient?.lastName].filter(Boolean).join(' ') ||
    'Patient'
  );
}

export default function ProviderTelehealthPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [session, setSession] = useState<ActiveSession | null>(null);
  const [activeAppointment, setActiveAppointment] = useState<any | null>(null);
  const [isStarting, setIsStarting] = useState<string | null>(null);
  const [isEnding, setIsEnding] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [newExName, setNewExName] = useState('');
  const [notes, setNotes] = useState('');
  const [isSavingPlan, setIsSavingPlan] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const list = await providerApi.getTelehealthAppointments();
      setAppointments(list);
      setError(null);
    } catch (err: any) {
      setError(err?.message || 'Could not load your telehealth queue from the server.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!session) return;
    const timer = setInterval(() => setElapsed(Math.floor((Date.now() - session.startedAt) / 1000)), 1000);
    return () => clearInterval(timer);
  }, [session]);

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleStart = async (appointment: any) => {
    const id = appointment._id || appointment.id;
    setIsStarting(id);
    setError(null);
    setNotice(null);
    try {
      const res = await providerApi.startTelehealth(id);
      if (!res.success) {
        setError(res.message || 'The telehealth room could not be provisioned.');
        return;
      }
      const data = res.result || {};
      setSession({
        appointmentId: id,
        meetLink: data.meetLink,
        roomId: data.roomId,
        provider: data.provider,
        startedAt: Date.now(),
      });
      setActiveAppointment(appointment);
      setElapsed(0);
      setNotice(res.message || 'Session started — the patient has been sent their join link.');
      if (data.meetLink && typeof window !== 'undefined') {
        window.open(data.meetLink, '_blank', 'noopener,noreferrer');
      }
    } catch (err: any) {
      setError(err?.message || 'The telehealth room could not be provisioned.');
    } finally {
      setIsStarting(null);
    }
  };

  const handleSavePlan = async () => {
    if (!session) return;
    setIsSavingPlan(true);
    setError(null);
    try {
      const res = await providerApi.submitTelehealthAssessment(session.appointmentId, {
        exercises,
        notes,
      });
      if (!res.success) {
        setError(res.message || 'The prescription could not be saved.');
        return;
      }
      setNotice('Exercise prescription saved to the appointment record.');
    } catch (err: any) {
      setError(err?.message || 'The prescription could not be saved.');
    } finally {
      setIsSavingPlan(false);
    }
  };

  const handleEnd = async () => {
    if (!session) return;
    setIsEnding(true);
    setError(null);
    try {
      const res = await providerApi.endTelehealth(session.appointmentId);
      if (!res.success) {
        setError(res.message || 'The session could not be closed on the server.');
        return;
      }
      setSession(null);
      setActiveAppointment(null);
      setExercises([]);
      setNotes('');
      setNotice('Consultation ended and recorded against the appointment.');
      await load();
    } catch (err: any) {
      setError(err?.message || 'The session could not be closed on the server.');
    } finally {
      setIsEnding(false);
    }
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
            Provisioned consultation rooms with live exercise prescription, recorded against the appointment.
          </p>
        </div>

        {session && (
          <div className="flex items-center gap-2 bg-destructive/10 text-destructive border border-destructive/20 px-3 py-1.5 rounded-2xl text-xs font-mono font-bold">
            <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
            <span>SESSION LIVE • {formatTimer(elapsed)}</span>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-2xl text-xs font-bold flex items-center gap-2 bg-red-500/10 text-red-600 border border-red-500/30">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {notice && (
        <div className="p-4 rounded-2xl text-xs font-bold flex items-center gap-2 bg-emerald-500/10 text-emerald-600 border border-emerald-500/30">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {!session ? (
        /* Queue of telehealth-eligible appointments */
        <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-base font-outfit font-extrabold text-foreground">Tele-consultation Queue</h3>

          {isLoading ? (
            <div className="text-xs text-muted-foreground flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Loading your telehealth appointments…</span>
            </div>
          ) : appointments.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-border/80 rounded-3xl">
              <Video className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
              <p className="text-xs font-bold text-foreground">No tele-consultations scheduled</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Video appointments assigned to you will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {appointments.map((appointment: any) => {
                const id = appointment._id || appointment.id;
                return (
                  <div
                    key={id}
                    className="p-4 rounded-2xl border border-border/60 bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-extrabold text-foreground">{patientNameOf(appointment)}</div>
                        <div className="text-muted-foreground mt-0.5">
                          {appointment.treatmentType || appointment.condition || 'Tele-rehabilitation'}
                          {appointment.sessionNumber ? ` · session ${appointment.sessionNumber}` : ''}
                        </div>
                        {appointment.appointmentDate && (
                          <div className="text-[10px] text-muted-foreground font-mono mt-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>
                              {new Date(appointment.appointmentDate).toLocaleString('en-IN', {
                                dateStyle: 'medium',
                                timeStyle: 'short',
                              })}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <Button
                      onClick={() => handleStart(appointment)}
                      disabled={isStarting === id}
                      className="h-10 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shrink-0"
                    >
                      {isStarting === id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        'Start consultation'
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Live session workspace */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-500">
                <ShieldCheck className="w-4 h-4" />
                <span>
                  Room provisioned{session.provider ? ` via ${session.provider.toUpperCase()}` : ''}
                  {session.roomId ? ` · ${session.roomId}` : ''}
                </span>
              </div>

              <h2 className="text-xl font-outfit font-black text-foreground">
                {patientNameOf(activeAppointment)}
              </h2>
              <p className="text-xs text-muted-foreground">
                The patient has been sent their join link over WhatsApp and email by the backend.
                Open the room below to join the call.
              </p>

              {session.meetLink ? (
                <a href={session.meetLink} target="_blank" rel="noopener noreferrer">
                  <Button className="h-11 px-6 rounded-2xl font-extrabold text-xs">
                    <ExternalLink className="w-4 h-4 mr-1.5" />
                    <span>Open consultation room</span>
                  </Button>
                </a>
              ) : (
                <p className="text-xs text-amber-500 font-bold">
                  The server did not return a room link for this session.
                </p>
              )}

              <Button
                onClick={handleEnd}
                disabled={isEnding}
                variant="outline"
                className="h-11 px-6 rounded-2xl font-extrabold text-xs border-destructive/40 text-destructive"
              >
                {isEnding ? (
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                ) : (
                  <PhoneOff className="w-4 h-4 mr-1.5" />
                )}
                <span>End consultation</span>
              </Button>
            </div>
          </div>

          {/* Prescription panel */}
          <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-foreground">Exercise Prescription</h3>

            <div className="flex gap-2">
              <Input
                value={newExName}
                onChange={(e) => setNewExName(e.target.value)}
                placeholder="Add exercise name..."
                className="h-10 rounded-xl text-xs"
              />
              <Button onClick={handleAddExercise} className="h-10 px-3 rounded-xl">
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-2">
              {exercises.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">No exercises added yet.</p>
              ) : (
                exercises.map((exercise, idx) => (
                  <div
                    key={`${exercise.name}-${idx}`}
                    className="p-3 rounded-2xl bg-muted/20 border border-border/60 text-xs flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-foreground">{exercise.name}</div>
                      <div className="text-muted-foreground text-[11px]">
                        {exercise.sets} · {exercise.reps} · {exercise.hold}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setExercises(exercises.filter((_, i) => i !== idx))}
                      className="text-muted-foreground hover:text-destructive"
                      aria-label="Remove exercise"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Consultation notes for the patient record..."
              className="w-full p-3 bg-background border border-input rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary"
            />

            <Button
              onClick={handleSavePlan}
              disabled={isSavingPlan}
              className="w-full h-11 rounded-2xl font-extrabold text-xs"
            >
              {isSavingPlan ? (
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-1.5" />
              )}
              <span>Save prescription to record</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
