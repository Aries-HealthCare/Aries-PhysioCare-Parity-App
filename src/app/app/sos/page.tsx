'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { providerApi } from '@/services/provider-api';
import { useRealtimeEvent } from '@/services/provider-realtime';
import {
  ShieldAlert,
  PhoneCall,
  Volume2,
  VolumeX,
  CheckCircle2,
  AlertTriangle,
  Users,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Emergency SOS Hub — wired to the same backend session the mobile `SosService` drives:
 *   POST  /api/app/sos/start            (trigger, returns sosSessionId)
 *   GET   /api/app/sos/my               (recover an already-active session)
 *   PATCH /api/app/sos/:id/location     (live telemetry, every 10s while active)
 *   POST  /api/app/sos/:id/resolve      (PIN-gated resolution)
 * Emergency contacts and quick-dial numbers come from the provider's own records, not
 * from hard-coded values, so the roster matches what the phone shows.
 */

const TELEMETRY_INTERVAL_MS = 10_000;

interface ActiveSession {
  id: string;
  lat?: number;
  lng?: number;
  startedAt: string;
}

export default function ProviderSOSHubPage() {
  const [session, setSession] = useState<ActiveSession | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [sirenPlaying, setSirenPlaying] = useState(false);
  const [isTriggering, setIsTriggering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resolvePin, setResolvePin] = useState('');
  const [isResolving, setIsResolving] = useState(false);

  const [contacts, setContacts] = useState<any[]>([]);
  const [quickDials, setQuickDials] = useState<any[]>([]);
  const [rosterLoading, setRosterLoading] = useState(true);
  const [rosterError, setRosterError] = useState<string | null>(null);

  const [backupDispatch, setBackupDispatch] = useState<any | null>(null);
  const [peerAlert, setPeerAlert] = useState<any | null>(null);

  const sirenRef = useRef<{ ctx: AudioContext; osc: OscillatorNode; gain: GainNode } | null>(null);

  const readPosition = useCallback(
    () =>
      new Promise<GeolocationPosition | null>((resolve) => {
        if (typeof navigator === 'undefined' || !navigator.geolocation) return resolve(null);
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve(pos),
          () => resolve(null),
          { enableHighAccuracy: true, timeout: 8000 }
        );
      }),
    []
  );

  // ── Recover any session already open on the backend (e.g. started on the phone) ──
  useEffect(() => {
    let cancelled = false;
    providerApi
      .getMySOS()
      .then((sessions) => {
        if (cancelled) return;
        const active = sessions.find(
          (s: any) => !s.status || String(s.status).toUpperCase() === 'ACTIVE'
        );
        if (active) {
          setSession({
            id: active._id || active.id,
            lat: active.lastLocation?.latitude,
            lng: active.lastLocation?.longitude,
            startedAt: active.createdAt || new Date().toISOString(),
          });
        }
      })
      .catch(() => {
        /* no active session, or the endpoint is unreachable — the trigger still works */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // ── Emergency roster (real records, not placeholders) ──────────────────────────
  useEffect(() => {
    let cancelled = false;
    Promise.allSettled([providerApi.fetchEmergencyContacts(), providerApi.getQuickDials()])
      .then(([contactsRes, dialsRes]) => {
        if (cancelled) return;
        if (contactsRes.status === 'fulfilled') setContacts(contactsRes.value);
        if (dialsRes.status === 'fulfilled') setQuickDials(dialsRes.value);
        if (contactsRes.status === 'rejected' && dialsRes.status === 'rejected') {
          setRosterError('Could not load your emergency roster from the server.');
        }
        setRosterLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // ── Real-time: the backend dispatches backup and peer alerts over the socket ────
  useRealtimeEvent('sos_backup_dispatch', (payload) => setBackupDispatch(payload));
  useRealtimeEvent('peer_sos_alert', (payload) => setPeerAlert(payload));

  // ── Live telemetry while a session is active ───────────────────────────────────
  useEffect(() => {
    if (!session?.id) return;
    let cancelled = false;

    const push = async () => {
      const position = await readPosition();
      if (cancelled || !position) return;
      const battery = await (navigator as any).getBattery?.().catch(() => null);
      try {
        await providerApi.updateSOSLocation(session.id, {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          batteryLevel: battery ? Math.round(battery.level * 100) : undefined,
          networkStrength: navigator.onLine ? 'Online' : 'Offline',
        });
        if (!cancelled) {
          setSession((prev) =>
            prev ? { ...prev, lat: position.coords.latitude, lng: position.coords.longitude } : prev
          );
        }
      } catch {
        /* a dropped telemetry ping must not end the session */
      }
    };

    void push();
    const timer = setInterval(push, TELEMETRY_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [session?.id, readPosition]);

  // ── Siren (Web Audio; no asset needed) ─────────────────────────────────────────
  useEffect(() => {
    if (!sirenPlaying) {
      sirenRef.current?.osc.stop();
      sirenRef.current?.ctx.close().catch(() => {});
      sirenRef.current = null;
      return;
    }
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(660, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      sirenRef.current = { ctx, osc, gain };

      const wobble = setInterval(() => {
        const now = ctx.currentTime;
        osc.frequency.setValueAtTime(osc.frequency.value > 700 ? 660 : 880, now);
      }, 600);
      return () => clearInterval(wobble);
    } catch {
      setSirenPlaying(false);
    }
  }, [sirenPlaying]);

  const startSOSTrigger = () => {
    setError(null);
    setCountdown(3);
  };

  const transmit = useCallback(async () => {
    setIsTriggering(true);
    setError(null);
    const position = await readPosition();
    const coords = position
      ? {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        }
      : undefined;

    try {
      const res = await providerApi.startSOS(coords);
      if (!res.success || !res.sosSessionId) {
        setError(res.message || 'The dispatch centre did not accept the alert. Call the hotline now.');
        return;
      }
      setSession({
        id: res.sosSessionId,
        lat: coords?.lat,
        lng: coords?.lng,
        startedAt: new Date().toISOString(),
      });
      setSirenPlaying(true);
      providerApi.setTherapistSOS(true).catch(() => {});
    } catch (err: any) {
      setError(err?.message || 'Could not reach the dispatch centre. Call the hotline now.');
    } finally {
      setIsTriggering(false);
    }
  }, [readPosition]);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      setCountdown(null);
      void transmit();
      return;
    }
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, transmit]);

  const abortCountdown = () => {
    setCountdown(null);
    setError(null);
  };

  const handleResolve = async () => {
    if (!session?.id || resolvePin.trim().length === 0) return;
    setIsResolving(true);
    setError(null);
    try {
      const res = await providerApi.resolveSOS(session.id, resolvePin.trim());
      if (!res.success) {
        setError(res.message || 'That resolution PIN was rejected. The alert is still active.');
        return;
      }
      setSession(null);
      setSirenPlaying(false);
      setResolvePin('');
      providerApi.setTherapistSOS(false).catch(() => {});
    } catch (err: any) {
      setError(err?.message || 'Could not resolve the alert. It remains active.');
    } finally {
      setIsResolving(false);
    }
  };

  const isTransmitting = countdown !== null || isTriggering;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-outfit font-extrabold tracking-tight">Emergency SOS Command Hub</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Rapid clinical emergency escalation, live GPS telemetry broadcast, and priority dispatcher support.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3.5 bg-destructive/10 border border-destructive/30 text-destructive text-xs font-bold rounded-2xl flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {peerAlert && (
        <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold rounded-2xl flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>
            Peer SOS in your territory
            {peerAlert.therapistName ? `: ${peerAlert.therapistName}` : ''}. Stand by for a backup request.
          </span>
        </div>
      )}

      {backupDispatch && (
        <div className="p-3.5 bg-destructive/10 border border-destructive/30 text-destructive text-xs font-bold rounded-2xl flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>
            You have been dispatched as backup
            {backupDispatch.therapistName ? ` for ${backupDispatch.therapistName}` : ''}. Check your notifications.
          </span>
        </div>
      )}

      {/* Main panic button */}
      <div className="bg-gradient-to-br from-card via-card to-destructive/10 border-2 border-destructive/30 rounded-3xl p-6 sm:p-8 shadow-lg text-center space-y-6">
        {!session && !isTransmitting ? (
          <div className="space-y-5 max-w-md mx-auto">
            <div className="w-24 h-24 rounded-full bg-destructive/15 text-destructive flex items-center justify-center mx-auto shadow-inner border-2 border-destructive/30 animate-pulse">
              <ShieldAlert className="w-12 h-12" />
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-outfit font-black text-foreground">
                Doorstep Emergency Panic Alarm
              </h2>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Broadcasts your live GPS coordinates, alerts your emergency contacts, and notifies the Aries
                Clinical Escalation Desk.
              </p>
            </div>

            <Button
              onClick={startSOSTrigger}
              className="w-full h-14 rounded-2xl bg-destructive hover:bg-destructive/90 text-white font-outfit font-black text-base shadow-2xl shadow-destructive/30 uppercase tracking-wider"
            >
              🚨 TRIGGER EMERGENCY SOS 🚨
            </Button>
          </div>
        ) : isTransmitting ? (
          <div className="space-y-3 max-w-md mx-auto">
            {countdown !== null ? (
              <>
                <div className="text-6xl font-black font-mono text-destructive animate-bounce">{countdown}</div>
                <h3 className="text-lg font-outfit font-extrabold text-foreground">
                  Transmitting SOS dispatch in {countdown}s…
                </h3>
                <Button
                  onClick={abortCountdown}
                  className="h-11 px-8 rounded-2xl bg-muted hover:bg-muted/80 text-foreground font-outfit font-extrabold text-xs"
                >
                  Cancel / Abort SOS
                </Button>
              </>
            ) : (
              <div className="flex flex-col items-center gap-3 py-6">
                <Loader2 className="w-8 h-8 animate-spin text-destructive" />
                <p className="text-xs font-bold text-muted-foreground">Contacting the dispatch centre…</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in max-w-md mx-auto">
            <div className="w-20 h-20 rounded-full bg-destructive text-white flex items-center justify-center mx-auto shadow-2xl animate-ping">
              <ShieldAlert className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold text-destructive uppercase tracking-widest bg-destructive/10 px-3 py-1 rounded-full border border-destructive/30">
                SOS ACTIVE • BROADCASTING GPS
              </span>
              <h3 className="text-2xl font-outfit font-black text-destructive">EMERGENCY DISPATCH INITIATED</h3>
              <p className="text-xs text-muted-foreground">
                {session?.lat !== undefined && session?.lng !== undefined ? (
                  <>
                    Live GPS broadcast:{' '}
                    <strong className="text-foreground font-mono">
                      {session.lat.toFixed(5)}, {session.lng.toFixed(5)}
                    </strong>
                  </>
                ) : (
                  'Alert transmitted without GPS — grant location access so dispatch can find you.'
                )}
              </p>
              {session?.id && (
                <p className="text-[10px] font-mono text-muted-foreground">Dispatch session {session.id}</p>
              )}
            </div>

            <div className="p-4 bg-destructive/10 rounded-2xl border border-destructive/30 text-xs text-left space-y-2">
              <div className="flex items-center gap-2 text-destructive font-bold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Dispatch session open on the Clinical Escalation Desk.</span>
              </div>
              <div className="flex items-center gap-2 text-destructive font-bold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Location telemetry streaming every {TELEMETRY_INTERVAL_MS / 1000}s.</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => setSirenPlaying(!sirenPlaying)}
                variant="outline"
                className="flex-1 h-11 rounded-2xl text-xs font-bold border-destructive/40 text-destructive"
              >
                {sirenPlaying ? <VolumeX className="w-4 h-4 mr-1.5" /> : <Volume2 className="w-4 h-4 mr-1.5" />}
                <span>{sirenPlaying ? 'Mute Siren' : 'Play Siren'}</span>
              </Button>
            </div>

            <div className="pt-2 border-t border-destructive/20 space-y-2 text-left">
              <label className="text-[11px] font-bold text-muted-foreground block">
                Resolution PIN (provided by the dispatcher)
              </label>
              <div className="flex gap-2">
                <input
                  value={resolvePin}
                  onChange={(e) => setResolvePin(e.target.value)}
                  inputMode="numeric"
                  placeholder="• • • •"
                  className="flex-1 h-11 px-3 rounded-2xl bg-background border border-input text-sm font-mono font-bold tracking-widest"
                />
                <Button
                  onClick={handleResolve}
                  disabled={isResolving || resolvePin.trim().length === 0}
                  className="h-11 px-5 rounded-2xl bg-muted hover:bg-muted/80 text-foreground font-bold text-xs"
                >
                  {isResolving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Resolve Alert'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Emergency roster & fast contact channels */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center">
            <PhoneCall className="w-5 h-5" />
          </div>
          <h3 className="text-base font-outfit font-extrabold text-foreground">Clinical Escalation Desk</h3>
          <p className="text-xs text-muted-foreground">
            Priority numbers configured by operations for urgent case complications.
          </p>

          {rosterLoading ? (
            <div className="text-xs text-muted-foreground flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Loading dispatch numbers…</span>
            </div>
          ) : quickDials.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">
              No escalation numbers are configured for your region yet.
            </p>
          ) : (
            <div className="space-y-2">
              {quickDials.map((dial: any, index: number) => (
                <a
                  key={dial._id || dial.id || index}
                  href={`tel:${dial.phone || dial.number || dial.mobileNo}`}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-2xl text-xs hover:bg-muted/50 transition-colors"
                >
                  <span className="font-bold text-foreground">{dial.title || dial.name || 'Escalation Desk'}</span>
                  <span className="font-mono font-bold text-destructive">
                    {dial.phone || dial.number || dial.mobileNo}
                  </span>
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="text-base font-outfit font-extrabold text-foreground">Emergency Contacts Roster</h3>
          <p className="text-xs text-muted-foreground">
            These contacts are notified with your live location pin during any SOS alert.
          </p>

          {rosterLoading ? (
            <div className="text-xs text-muted-foreground flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Loading contacts…</span>
            </div>
          ) : contacts.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">
              No emergency contacts saved yet — add one from your profile so dispatch can reach someone.
            </p>
          ) : (
            <div className="space-y-2">
              {contacts.map((contact: any, index: number) => (
                <div
                  key={contact._id || contact.id || index}
                  className="p-3 bg-muted/30 rounded-2xl text-xs flex justify-between items-center"
                >
                  <span className="font-bold text-foreground">
                    {contact.name}
                    {contact.relation ? ` · ${contact.relation}` : ''}
                  </span>
                  <span className="font-mono text-muted-foreground font-bold">{contact.phone}</span>
                </div>
              ))}
            </div>
          )}

          {rosterError && (
            <p className="text-[11px] text-destructive font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{rosterError}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
