'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  Building2,
  Camera,
  CameraOff,
  CheckCircle2,
  Clock,
  Crosshair,
  ExternalLink,
  HeartPulse,
  KeyRound,
  Loader2,
  MapPin,
  MessageSquare,
  Navigation,
  PhoneCall,
  Pill,
  RefreshCw,
  Send,
  Shield,
  ShieldAlert,
  Stethoscope,
  Users,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { EmbeddedMapFrame } from '@/components/map/embedded-map-frame';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { haversineDistanceKm } from '@/lib/dashboard-analytics';
import { providerApi } from '@/services/provider-api';
import { useProviderRealtime, useRealtimeEvent } from '@/services/provider-realtime';
import { cn } from '@/lib/utils';

const TELEMETRY_INTERVAL_MS = 10_000;
const OVERPASS_TIMEOUT_MS = 8_000;

type SosAlertType = 'PATIENT_EMERGENCY' | 'THERAPIST_THREAT';
type FacilityCategory = 'all' | 'hospital' | 'police' | 'clinic' | 'pharmacy';

interface ActiveSession {
  id: string;
  type: SosAlertType | string;
  lat?: number;
  lng?: number;
  accuracy?: number;
  startedAt: string;
}

interface NearbyFacility {
  id: string;
  name: string;
  category: Exclude<FacilityCategory, 'all'>;
  lat: number;
  lng: number;
  distanceKm: number;
  address?: string;
  phone?: string;
}

const STANDARD_NATIONAL_HELPLINES = [
  {
    id: 'nat-112',
    title: 'National Emergency Response',
    number: '112',
    subtitle: 'Police · Fire · Medical',
  },
  {
    id: 'nat-108',
    title: 'Emergency Ambulance',
    number: '108',
    subtitle: '24×7 Medical Dispatch',
  },
];

function formatElapsed(startedAtIso: string, nowMs: number): string {
  const startedMs = new Date(startedAtIso).getTime();
  if (!Number.isFinite(startedMs)) return '00:00';
  const totalSec = Math.max(0, Math.floor((nowMs - startedMs) / 1000));
  const mins = Math.floor(totalSec / 60);
  const secs = totalSec % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function sanitizePhoneForWhatsApp(phone?: string): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) return `91${digits}`;
  return digits;
}

function getFacilityBadgeMeta(category: NearbyFacility['category']) {
  switch (category) {
    case 'hospital':
      return {
        label: 'Hospital',
        icon: Building2,
        badgeClass: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20',
      };
    case 'police':
      return {
        label: 'Police',
        icon: Shield,
        badgeClass: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
      };
    case 'clinic':
      return {
        label: 'Clinic',
        icon: Stethoscope,
        badgeClass: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
      };
    case 'pharmacy':
      return {
        label: 'Pharmacy',
        icon: Pill,
        badgeClass: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
      };
  }
}

export default function ProviderSOSHubPage() {
  const { toast } = useToast();
  const { joinSosSession, leaveSosSession } = useProviderRealtime();

  const [session, setSession] = useState<ActiveSession | null>(null);
  const [pendingType, setPendingType] = useState<SosAlertType>('THERAPIST_THREAT');
  const [countdown, setCountdown] = useState<number | null>(null);
  const [sirenPlaying, setSirenPlaying] = useState(false);
  const [isTriggering, setIsTriggering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resolvePin, setResolvePin] = useState('');
  const [isResolving, setIsResolving] = useState(false);
  const [pinReady, setPinReady] = useState(false);
  const [nowMs, setNowMs] = useState<number>(() => Date.now());

  // Camera & Mic Live Safety Monitor
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraStarting, setCameraStarting] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);

  // Roster & maps config
  const [contacts, setContacts] = useState<any[]>([]);
  const [quickDials, setQuickDials] = useState<any[]>([]);
  const [rosterLoading, setRosterLoading] = useState(true);
  const [rosterError, setRosterError] = useState<string | null>(null);
  const [mapsConfig, setMapsConfig] = useState<any | null>(null);

  // Socket alerts
  const [backupDispatch, setBackupDispatch] = useState<any | null>(null);
  const [peerAlert, setPeerAlert] = useState<any | null>(null);

  // Geolocation & Nearby Emergency Facilities
  const [liveCoords, setLiveCoords] = useState<{ lat: number; lng: number; accuracy?: number } | null>(null);
  const [geoDenied, setGeoDenied] = useState(false);
  const [facilities, setFacilities] = useState<NearbyFacility[]>([]);
  const [facilitiesLoading, setFacilitiesLoading] = useState(false);
  const [facilitiesError, setFacilitiesError] = useState<string | null>(null);
  const [facilityFilter, setFacilityFilter] = useState<FacilityCategory>('all');
  const [expandedFacilityId, setExpandedFacilityId] = useState<string | null>(null);

  const sirenRef = useRef<{
    ctx: AudioContext;
    osc: OscillatorNode;
    gain: GainNode;
    wobble: ReturnType<typeof setInterval>;
  } | null>(null);
  const pinInputRef = useRef<HTMLInputElement | null>(null);
  const overpassAbortRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);
  const activeSessionIdRef = useRef<string | null>(null);
  const cameraRequestIdRef = useRef(0);
  activeSessionIdRef.current = session?.id ?? null;

  const stopSafetyCamera = useCallback(() => {
    cameraRequestIdRef.current += 1;
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          /* ignore */
        }
      });
      cameraStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setCameraStarting(false);
  }, []);

  const stopSiren = useCallback(() => {
    if (sirenRef.current) {
      clearInterval(sirenRef.current.wobble);
      try {
        sirenRef.current.osc.stop();
      } catch {
        /* already stopped */
      }
      sirenRef.current.ctx.close().catch(() => {});
      sirenRef.current = null;
    }
  }, []);

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

  // ── Fetch nearby emergency facilities via OpenStreetMap Overpass API ──────────
  const loadNearbyFacilities = useCallback(async (lat: number, lng: number) => {
    overpassAbortRef.current?.abort();
    const controller = new AbortController();
    overpassAbortRef.current = controller;

    setFacilitiesLoading(true);
    setFacilitiesError(null);

    let didTimeout = false;
    const timeoutId = setTimeout(() => {
      didTimeout = true;
      controller.abort();
    }, OVERPASS_TIMEOUT_MS);

    try {
      const overpassQuery = `
[out:json][timeout:8];
(
  node["amenity"~"^(hospital|police|clinic|pharmacy)$"](around:5000,${lat},${lng});
  way["amenity"~"^(hospital|police|clinic|pharmacy)$"](around:5000,${lat},${lng});
);
out center 50;
      `.trim();

      const res = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
        body: `data=${encodeURIComponent(overpassQuery)}`,
        signal: controller.signal,
      });

      if (!res.ok) {
        throw new Error(`Directory service returned status ${res.status}`);
      }

      const data = await res.json();
      if (overpassAbortRef.current !== controller) return;
      const elements: any[] = Array.isArray(data?.elements) ? data.elements : [];

      const seen = new Set<string>();
      const parsed: NearbyFacility[] = [];

      for (const el of elements) {
        const tags = el?.tags || {};
        const amenity = String(tags.amenity || '').toLowerCase();
        if (!['hospital', 'police', 'clinic', 'pharmacy'].includes(amenity)) continue;

        const elLat = typeof el.lat === 'number' ? el.lat : el.center?.lat;
        const elLng = typeof el.lon === 'number' ? el.lon : el.center?.lon;
        if (typeof elLat !== 'number' || typeof elLng !== 'number') continue;

        const rawName = String(tags.name || tags['name:en'] || '').trim();
        if (!rawName) continue;

        const dedupeKey = `${amenity}:${rawName.toLowerCase()}`;
        if (seen.has(dedupeKey)) continue;
        seen.add(dedupeKey);

        const addressParts = [
          tags['addr:housenumber'],
          tags['addr:street'],
          tags['addr:suburb'] || tags['addr:neighbourhood'],
          tags['addr:city'],
        ].filter(Boolean);

        parsed.push({
          id: `${el.type || 'node'}-${el.id}`,
          name: rawName,
          category: amenity as NearbyFacility['category'],
          lat: elLat,
          lng: elLng,
          distanceKm: haversineDistanceKm(lat, lng, elLat, elLng),
          address: addressParts.length > 0 ? addressParts.join(', ') : undefined,
          phone: tags.phone || tags['contact:phone'] || undefined,
        });
      }

      parsed.sort((a, b) => a.distanceKm - b.distanceKm);
      setFacilities(parsed.slice(0, 20));
    } catch (err: any) {
      if (overpassAbortRef.current !== controller) return;
      if (didTimeout || err?.name === 'AbortError') {
        setFacilitiesError('Nearby facility lookup timed out. Tap Retry or use Quick Dials directly.');
      } else {
        setFacilitiesError('Could not load nearby hospitals & police stations right now.');
      }
    } finally {
      clearTimeout(timeoutId);
      if (overpassAbortRef.current !== controller) return;
      setFacilitiesLoading(false);
    }
  }, []);

  const locateAndFetchFacilities = useCallback(async () => {
    setGeoDenied(false);
    const pos = await readPosition();
    if (!pos) {
      setGeoDenied(true);
      return;
    }
    const coords = {
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
      accuracy: pos.coords.accuracy,
    };
    setLiveCoords(coords);
    void loadNearbyFacilities(coords.lat, coords.lng);
  }, [loadNearbyFacilities, readPosition]);

  // ── Initial load: recover active SOS, roster, mapsConfig, geolocation ─────────
  useEffect(() => {
    let cancelled = false;

    providerApi
      .getMySOS()
      .then((sessions) => {
        if (cancelled) return;
        const active = sessions.find(
          (s: any) => !s.status || ['ACTIVE', 'PIN_READY'].includes(String(s.status).toUpperCase())
        );
        if (active) {
          setSession({
            id: String(active._id || active.id),
            type: active.type || 'THERAPIST_THREAT',
            lat: active.lastLocation?.latitude ?? active.location?.latitude,
            lng: active.lastLocation?.longitude ?? active.location?.longitude,
            accuracy: active.lastLocation?.accuracy ?? active.location?.accuracy,
            startedAt: active.createdAt || new Date().toISOString(),
          });
          if (String(active.status || '').toUpperCase() === 'PIN_READY') {
            setPinReady(true);
          }
        }
      })
      .catch(() => {
        /* no active session — trigger still works */
      });

    Promise.allSettled([
      providerApi.fetchEmergencyContacts(),
      providerApi.getQuickDials(),
      providerApi.getMapsConfig().catch(() => null),
    ]).then(([contactsRes, dialsRes, mapsRes]) => {
      if (cancelled) return;
      if (contactsRes.status === 'fulfilled') setContacts(contactsRes.value);
      if (dialsRes.status === 'fulfilled') setQuickDials(dialsRes.value);
      if (mapsRes.status === 'fulfilled') setMapsConfig(mapsRes.value);
      if (contactsRes.status === 'rejected' && dialsRes.status === 'rejected') {
        setRosterError('Could not load your saved emergency roster right now.');
      }
      setRosterLoading(false);
    });

    void locateAndFetchFacilities();

    return () => {
      cancelled = true;
      overpassAbortRef.current?.abort();
    };
  }, [locateAndFetchFacilities]);

  // ── Ensure camera & siren are always cleaned up on unmount ────────────────────
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      stopSafetyCamera();
      stopSiren();
    };
  }, [stopSafetyCamera, stopSiren]);

  // ── Attach video stream once the <video> element mounts ───────────────────────
  useEffect(() => {
    if (cameraActive && videoRef.current && cameraStreamRef.current) {
      videoRef.current.srcObject = cameraStreamRef.current;
    }
  }, [cameraActive]);

  // ── Live elapsed timer while SOS is active ────────────────────────────────────
  useEffect(() => {
    if (!session?.id) return;
    setNowMs(Date.now());
    const tick = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(tick);
  }, [session?.id]);

  // ── Join /sos socket namespace while session is active ────────────────────────
  useEffect(() => {
    if (!session?.id) return;
    joinSosSession(session.id);
    return () => {
      leaveSosSession();
    };
  }, [session?.id, joinSosSession, leaveSosSession]);

  // ── Real-time socket listeners ────────────────────────────────────────────────
  useRealtimeEvent('sos_backup_dispatch', (payload) => setBackupDispatch(payload));
  useRealtimeEvent('peer_sos_alert', (payload) => setPeerAlert(payload));

  useRealtimeEvent('sos_status_change', (payload) => {
    if (!session?.id) return;
    const incomingId = payload?.sosId || payload?._id || payload?.id;
    if (incomingId && String(incomingId) !== String(session.id)) return;

    const status = String(payload?.status || '').toUpperCase();
    if (status === 'PIN_READY') {
      setPinReady(true);
      toast({
        title: 'Resolution PIN Ready',
        description: 'The dispatch desk has issued your safety PIN. Enter it below when you are safe.',
      });
      setTimeout(() => pinInputRef.current?.focus(), 100);
    } else if (status === 'RESOLVED') {
      setSession(null);
      setPinReady(false);
      setResolvePin('');
      setSirenPlaying(false);
      stopSafetyCamera();
      leaveSosSession();
      providerApi.setTherapistSOS(false).catch(() => {});
      toast({
        title: 'SOS Alert Resolved',
        description: 'Your emergency session has been closed and live tracking has stopped.',
      });
    }
  });

  // ── Live 10s GPS telemetry while SOS session is active ────────────────────────
  useEffect(() => {
    if (!session?.id) return;
    let cancelled = false;

    const pushTelemetry = async () => {
      const position = await readPosition();
      if (cancelled || !position) return;

      const coords = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
      };
      setLiveCoords(coords);

      const battery = await (navigator as any).getBattery?.().catch(() => null);
      try {
        await providerApi.updateSOSLocation(session.id, {
          lat: coords.lat,
          lng: coords.lng,
          accuracy: coords.accuracy,
          batteryLevel: battery ? Math.round(battery.level * 100) : undefined,
          networkStrength: typeof navigator !== 'undefined' && navigator.onLine ? 'Online' : 'Offline',
        });
        if (!cancelled) {
          setSession((prev) =>
            prev
              ? { ...prev, lat: coords.lat, lng: coords.lng, accuracy: coords.accuracy }
              : prev
          );
        }
      } catch {
        /* a dropped telemetry ping must not end the session */
      }
    };

    void pushTelemetry();
    const timer = setInterval(pushTelemetry, TELEMETRY_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [session?.id, readPosition]);

  // ── Web Audio Siren ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!sirenPlaying) {
      stopSiren();
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(660, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      osc.connect(gain).connect(ctx.destination);
      osc.start();

      const wobble = setInterval(() => {
        const now = ctx.currentTime;
        osc.frequency.setValueAtTime(osc.frequency.value > 700 ? 660 : 880, now);
      }, 600);

      sirenRef.current = { ctx, osc, gain, wobble };
      return () => {
        stopSiren();
      };
    } catch {
      setSirenPlaying(false);
    }
  }, [sirenPlaying, stopSiren]);

  // ── Camera & Mic Safety Monitor toggle ────────────────────────────────────────
  const toggleSafetyCamera = async () => {
    if (cameraActive || cameraStarting) {
      stopSafetyCamera();
      return;
    }

    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      const msg = 'Camera and microphone monitoring is not supported in this browser.';
      setCameraError(msg);
      toast({ variant: 'destructive', title: 'Camera unavailable', description: msg });
      return;
    }

    const requestId = ++cameraRequestIdRef.current;
    setCameraStarting(true);
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (
        !isMountedRef.current ||
        !activeSessionIdRef.current ||
        cameraRequestIdRef.current !== requestId
      ) {
        stream.getTracks().forEach((t) => {
          try {
            t.stop();
          } catch {
            /* ignore */
          }
        });
        return;
      }
      cameraStreamRef.current = stream;
      setCameraActive(true);
      toast({
        title: 'Safety Monitor Active',
        description: 'Local camera & mic preview is running. Tracks stop automatically when resolved.',
      });
    } catch (err: any) {
      if (!isMountedRef.current || cameraRequestIdRef.current !== requestId) return;
      const msg =
        err?.name === 'NotAllowedError'
          ? 'Camera or microphone permission was denied. Your GPS SOS alert remains active.'
          : 'Could not start camera & mic preview. Your GPS SOS alert remains active.';
      setCameraError(msg);
      toast({ variant: 'destructive', title: 'Safety monitor unavailable', description: msg });
    } finally {
      if (isMountedRef.current && cameraRequestIdRef.current === requestId) {
        setCameraStarting(false);
      }
    }
  };

  // ── Start 3-second abortable countdown for chosen SOS priority type ───────────
  const startSOSTrigger = (type: SosAlertType) => {
    setError(null);
    setPendingType(type);
    setCountdown(3);
  };

  const transmit = useCallback(
    async (sosType: SosAlertType) => {
      setIsTriggering(true);
      setError(null);
      const position = await readPosition();
      const coords = position
        ? {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
          }
        : liveCoords || undefined;

      if (coords) {
        setLiveCoords(coords);
      }

      try {
        const res = await providerApi.startSOS(coords, sosType);
        if (!res.success || !res.sosSessionId) {
          setError(
            res.message || 'The dispatch centre did not accept the alert. Call an emergency helpline now.'
          );
          return;
        }
        setSession({
          id: String(res.sosSessionId),
          type: sosType,
          lat: coords?.lat,
          lng: coords?.lng,
          accuracy: coords?.accuracy,
          startedAt: new Date().toISOString(),
        });
        setPinReady(false);
        setSirenPlaying(true);
        providerApi.setTherapistSOS(true).catch(() => {});
        toast({
          variant: 'destructive',
          title: sosType === 'PATIENT_EMERGENCY' ? 'Patient SOS Transmitted' : 'Safety SOS Transmitted',
          description: 'Live GPS telemetry is now streaming to the Clinical Escalation Desk.',
        });
      } catch (err: any) {
        setError(
          err?.message || 'Could not reach the dispatch centre. Call an emergency helpline immediately.'
        );
      } finally {
        setIsTriggering(false);
      }
    },
    [liveCoords, readPosition, toast]
  );

  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      setCountdown(null);
      void transmit(pendingType);
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => (c !== null ? c - 1 : null)), 1000);
    return () => clearTimeout(timer);
  }, [countdown, pendingType, transmit]);

  const abortCountdown = () => {
    setCountdown(null);
    setError(null);
  };

  const handleResolve = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!session?.id || resolvePin.trim().length === 0) return;

    setIsResolving(true);
    setError(null);
    try {
      const res = await providerApi.resolveSOS(session.id, resolvePin.trim());
      if (!res.success) {
        setError(res.message || 'That resolution PIN was rejected. The alert remains active.');
        return;
      }
      setSession(null);
      setPinReady(false);
      setSirenPlaying(false);
      stopSafetyCamera();
      leaveSosSession();
      setResolvePin('');
      providerApi.setTherapistSOS(false).catch(() => {});
      toast({
        title: 'SOS Alert Resolved',
        description: 'Live GPS broadcast, siren, and safety monitor have been safely stopped.',
      });
    } catch (err: any) {
      setError(err?.message || 'Could not resolve the alert. It remains active.');
    } finally {
      setIsResolving(false);
    }
  };

  const activeCoords = useMemo(() => {
    if (session?.lat !== undefined && session?.lng !== undefined) {
      return { lat: session.lat, lng: session.lng, accuracy: session.accuracy };
    }
    return liveCoords;
  }, [liveCoords, session]);

  const alertShareMessage = useMemo(() => {
    const typeLabel =
      session?.type === 'PATIENT_EMERGENCY'
        ? 'PATIENT MEDICAL EMERGENCY'
        : 'THERAPIST SAFETY EMERGENCY';
    const pinLink = activeCoords
      ? `https://maps.google.com/?q=${activeCoords.lat},${activeCoords.lng}`
      : 'Location pending';
    return `URGENT SOS (${typeLabel}) — I need immediate assistance. Live location pin: ${pinLink}`;
  }, [activeCoords, session?.type]);

  const primaryContactPhone = contacts[0]?.phone ? sanitizePhoneForWhatsApp(contacts[0].phone) : '';
  const whatsappShareUrl = primaryContactPhone
    ? `https://wa.me/${primaryContactPhone}?text=${encodeURIComponent(alertShareMessage)}`
    : `https://wa.me/?text=${encodeURIComponent(alertShareMessage)}`;
  const smsShareUrl = contacts[0]?.phone
    ? `sms:${contacts[0].phone}?body=${encodeURIComponent(alertShareMessage)}`
    : `sms:?body=${encodeURIComponent(alertShareMessage)}`;

  const mapsApiKey: string | undefined =
    mapsConfig?.browserKey ||
    mapsConfig?.apiKey ||
    mapsConfig?.googleMapsApiKey ||
    mapsConfig?.webApiKey ||
    undefined;

  const visibleFacilities = useMemo(() => {
    if (facilityFilter === 'all') return facilities;
    return facilities.filter((f) => f.category === facilityFilter);
  }, [facilities, facilityFilter]);

  const isTransmitting = countdown !== null || isTriggering;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-destructive/15 text-destructive">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-outfit text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                Emergency SOS Command Hub
              </h1>
            </div>
          </div>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Immediate patient medical or therapist safety escalation, live GPS telemetry, and nearby emergency support.
          </p>
        </div>

        {activeCoords && !session && (
          <div className="inline-flex items-center gap-2 self-start rounded-2xl border border-border/80 bg-card px-3.5 py-2 text-xs shadow-sm sm:self-auto">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="font-semibold text-foreground">GPS Ready</span>
            <span className="font-mono text-[11px] text-muted-foreground">
              {activeCoords.lat.toFixed(4)}, {activeCoords.lng.toFixed(4)}
            </span>
          </div>
        )}
      </div>

      {/* Banners */}
      {error && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs font-bold text-destructive">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {peerAlert && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs font-bold text-amber-700 dark:text-amber-400">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>
            Peer SOS alert in your territory
            {peerAlert.therapistName ? `: ${peerAlert.therapistName}` : ''}. Stand by for backup dispatch updates.
          </span>
        </div>
      )}

      {backupDispatch && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs font-bold text-destructive">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          <span>
            You have been dispatched as backup
            {backupDispatch.therapistName ? ` for ${backupDispatch.therapistName}` : ''}. Review your notifications for details.
          </span>
        </div>
      )}

      {/* PRIMARY SOS ZONE: Active Command Panel OR Countdown OR Two Priority Trigger Cards */}
      {session ? (
        <div className="overflow-hidden rounded-3xl border-2 border-red-500 bg-gradient-to-br from-red-700 via-red-600 to-rose-700 p-5 text-white shadow-2xl shadow-red-600/20 sm:p-7">
          {/* Top Status Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/20 pb-4">
            <div className="flex items-center gap-3">
              <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
                <span className="absolute inset-0 animate-ping rounded-2xl bg-white/25" />
                <ShieldAlert className="relative h-6 w-6 text-white" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-white px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-red-700">
                    SOS ACTIVE
                  </span>
                  <span className="rounded-full border border-white/30 bg-white/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                    {session.type === 'PATIENT_EMERGENCY' ? 'Patient Medical SOS' : 'Therapist Safety SOS'}
                  </span>
                </div>
                <h2 className="mt-1 font-outfit text-xl font-black tracking-tight sm:text-2xl">
                  Emergency Dispatch Active
                </h2>
              </div>
            </div>

            {/* Live Elapsed Timer */}
            <div className="flex items-center gap-2 rounded-2xl border border-white/25 bg-black/25 px-4 py-2.5">
              <Clock className="h-4 w-4 text-red-200" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-red-100/80">
                  Elapsed
                </p>
                <p className="font-mono text-xl font-black leading-none text-white">
                  {formatElapsed(session.startedAt, nowMs)}
                </p>
              </div>
            </div>
          </div>

          {pinReady && (
            <div className="mt-4 flex items-center gap-3 rounded-2xl border border-amber-300/60 bg-amber-400/20 p-3.5 text-xs font-bold text-white backdrop-blur-sm">
              <KeyRound className="h-5 w-5 shrink-0 text-amber-200" />
              <span>
                Dispatcher marked your resolution PIN as ready. Enter the PIN below once you are safe to close this alert.
              </span>
            </div>
          )}

          {/* Active Command Grid */}
          <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-12">
            {/* Left 7 cols: Telemetry, Controls, Contact Alert, PIN Resolution */}
            <div className="space-y-4 lg:col-span-7">
              {/* Live GPS Telemetry Box */}
              <div className="rounded-2xl border border-white/20 bg-black/20 p-4 space-y-2.5">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="flex items-center gap-1.5 font-bold text-white">
                    <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                    Live GPS streaming every {TELEMETRY_INTERVAL_MS / 1000}s
                  </span>
                  <span className="font-mono text-[10px] text-red-100/80">
                    Session {session.id.slice(-8)}
                  </span>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-red-50">
                  {activeCoords ? (
                    <span className="font-mono font-bold">
                      {activeCoords.lat.toFixed(5)}, {activeCoords.lng.toFixed(5)}
                      {activeCoords.accuracy ? ` (±${Math.round(activeCoords.accuracy)}m)` : ''}
                    </span>
                  ) : (
                    <span>Acquiring GPS lock — allow browser location so dispatch can pinpoint you.</span>
                  )}
                  {activeCoords && (
                    <a
                      href={`https://maps.google.com/?q=${activeCoords.lat},${activeCoords.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-bold text-white underline underline-offset-2"
                    >
                      View Pin
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>

              {/* Action Controls: Siren + Safety Camera */}
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <Button
                  type="button"
                  onClick={() => setSirenPlaying((v) => !v)}
                  className="h-12 rounded-2xl border border-white/30 bg-white/15 font-outfit text-xs font-extrabold text-white hover:bg-white/25"
                >
                  {sirenPlaying ? (
                    <VolumeX className="mr-2 h-4 w-4" />
                  ) : (
                    <Volume2 className="mr-2 h-4 w-4" />
                  )}
                  {sirenPlaying ? 'Mute Siren' : 'Play Siren'}
                </Button>

                <Button
                  type="button"
                  onClick={() => void toggleSafetyCamera()}
                  className="h-12 rounded-2xl border border-white/30 bg-white/15 font-outfit text-xs font-extrabold text-white hover:bg-white/25"
                >
                  {cameraStarting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : cameraActive ? (
                    <CameraOff className="mr-2 h-4 w-4" />
                  ) : (
                    <Camera className="mr-2 h-4 w-4" />
                  )}
                  {cameraStarting
                    ? 'Stop Camera Start'
                    : cameraActive
                      ? 'Stop Safety Monitor'
                      : 'Start Camera & Mic Monitor'}
                </Button>
              </div>

              {/* One-Click Alert Contacts via WhatsApp / SMS */}
              <div className="rounded-2xl border border-white/20 bg-black/15 p-3.5 space-y-2.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-red-100">
                  Alert Contacts with Live Google Maps Pin
                </p>
                <div className="flex flex-wrap gap-2">
                  <a
                    href={whatsappShareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-3.5 text-xs font-extrabold text-white shadow-sm transition-colors hover:bg-emerald-400"
                  >
                    <Send className="h-3.5 w-3.5" />
                    Alert via WhatsApp
                  </a>
                  <a
                    href={smsShareUrl}
                    className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/15 px-3.5 text-xs font-extrabold text-white transition-colors hover:bg-white/25"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    Alert via SMS
                  </a>
                </div>
              </div>

              {/* PIN-Gated Resolution Form */}
              <form
                onSubmit={handleResolve}
                className="rounded-2xl border border-white/25 bg-black/25 p-4 space-y-2.5"
              >
                <label
                  htmlFor="sos-resolve-pin"
                  className="flex items-center gap-1.5 text-xs font-bold text-white"
                >
                  <KeyRound className="h-3.5 w-3.5 text-amber-200" />
                  Resolution PIN (provided by dispatcher once safe)
                </label>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    id="sos-resolve-pin"
                    ref={pinInputRef}
                    value={resolvePin}
                    onChange={(e) => setResolvePin(e.target.value)}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="Enter resolution PIN"
                    className="h-11 flex-1 rounded-xl border border-white/30 bg-white px-3.5 font-mono text-sm font-bold tracking-widest text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-300"
                  />
                  <Button
                    type="submit"
                    disabled={isResolving || resolvePin.trim().length === 0}
                    className="h-11 rounded-xl bg-slate-950 px-5 font-outfit text-xs font-extrabold text-white hover:bg-slate-900 disabled:opacity-50"
                  >
                    {isResolving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Resolve Alert'
                    )}
                  </Button>
                </div>
              </form>
            </div>

            {/* Right 5 cols: Optional Live Safety Monitor Preview */}
            <div className="flex flex-col justify-between gap-3 rounded-2xl border border-white/20 bg-black/25 p-4 lg:col-span-5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-extrabold uppercase tracking-wider text-white">
                  Live Camera & Mic Safety Monitor
                </p>
                {cameraActive && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500 px-2.5 py-0.5 text-[10px] font-black uppercase text-white">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                    LIVE
                  </span>
                )}
              </div>

              {cameraActive ? (
                <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-black">
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="h-48 w-full object-cover sm:h-56"
                  />
                </div>
              ) : (
                <div className="flex h-44 flex-col items-center justify-center rounded-2xl border border-dashed border-white/25 bg-black/20 p-4 text-center sm:h-52">
                  <Camera className="mb-2 h-8 w-8 text-white/60" />
                  <p className="text-xs font-bold text-white">Safety preview is off</p>
                  <p className="mt-1 text-[11px] text-red-100/80">
                    Optional browser camera & mic monitor. Starts only when you tap the button and stops automatically upon resolution.
                  </p>
                </div>
              )}

              {cameraError && (
                <p className="rounded-xl bg-black/30 px-3 py-2 text-[11px] font-semibold text-amber-200">
                  {cameraError}
                </p>
              )}

              <p className="text-[11px] text-red-100/80">
                Keep this tab open so live GPS telemetry continues reaching the Clinical Escalation Desk.
              </p>
            </div>
          </div>
        </div>
      ) : isTransmitting ? (
        <div className="rounded-3xl border-2 border-destructive/40 bg-gradient-to-br from-card via-card to-destructive/10 p-8 text-center shadow-lg">
          <div className="mx-auto max-w-md space-y-4">
            {countdown !== null ? (
              <>
                <span className="inline-block rounded-full bg-destructive/15 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-destructive">
                  {pendingType === 'PATIENT_EMERGENCY' ? 'Patient Medical SOS' : 'Therapist Safety SOS'}
                </span>
                <div className="animate-bounce font-mono text-7xl font-black text-destructive">
                  {countdown}
                </div>
                <h2 className="font-outfit text-xl font-extrabold text-foreground">
                  Transmitting SOS alert in {countdown}s…
                </h2>
                <p className="text-xs text-muted-foreground">
                  Dispatch will receive your live GPS location and initiate immediate escalation.
                </p>
                <Button
                  type="button"
                  onClick={abortCountdown}
                  className="h-12 rounded-2xl bg-muted px-8 font-outfit text-sm font-extrabold text-foreground hover:bg-muted/80"
                >
                  Cancel / Abort SOS
                </Button>
              </>
            ) : (
              <div className="flex flex-col items-center gap-3 py-6">
                <Loader2 className="h-9 w-9 animate-spin text-destructive" />
                <p className="font-outfit text-sm font-bold text-foreground">
                  Contacting the Clinical Escalation Desk…
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Two Priority Trigger Cards */
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Card 1: Patient SOS (PATIENT_EMERGENCY) */}
          <div className="flex flex-col justify-between rounded-3xl border-2 border-rose-500/30 bg-gradient-to-br from-card via-card to-rose-500/10 p-6 shadow-sm transition-shadow hover:shadow-md">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-600 dark:text-rose-400">
                  <HeartPulse className="h-6 w-6" />
                </div>
                <span className="rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                  Clinical Priority
                </span>
              </div>
              <div>
                <h2 className="font-outfit text-xl font-black text-foreground">Patient SOS</h2>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Use during a sudden patient medical emergency (collapse, acute chest pain, fall, or severe distress) during a doorstep visit. Alerts the Clinical Escalation Desk with your live GPS location.
                </p>
              </div>
            </div>

            <Button
              type="button"
              onClick={() => startSOSTrigger('PATIENT_EMERGENCY')}
              className="mt-6 h-12 w-full rounded-2xl bg-rose-600 font-outfit text-sm font-black uppercase tracking-wider text-white shadow-lg shadow-rose-600/20 hover:bg-rose-700"
            >
              <HeartPulse className="mr-2 h-4 w-4" />
              Trigger Patient SOS (3s)
            </Button>
          </div>

          {/* Card 2: Safety SOS (THERAPIST_THREAT) */}
          <div className="flex flex-col justify-between rounded-3xl border-2 border-destructive/40 bg-gradient-to-br from-card via-card to-destructive/10 p-6 shadow-sm transition-shadow hover:shadow-md">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/15 text-destructive">
                  <ShieldAlert className="h-6 w-6" />
                </div>
                <span className="rounded-full border border-destructive/30 bg-destructive/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-destructive">
                  Personal Safety
                </span>
              </div>
              <div>
                <h2 className="font-outfit text-xl font-black text-foreground">Safety SOS</h2>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Use immediately if you feel unsafe, threatened, or require rapid backup on site. Starts live 10s GPS telemetry, audible siren, and high-priority safety escalation.
                </p>
              </div>
            </div>

            <Button
              type="button"
              onClick={() => startSOSTrigger('THERAPIST_THREAT')}
              className="mt-6 h-12 w-full rounded-2xl bg-destructive font-outfit text-sm font-black uppercase tracking-wider text-white shadow-lg shadow-destructive/25 hover:bg-destructive/90"
            >
              <ShieldAlert className="mr-2 h-4 w-4" />
              Trigger Safety SOS (3s)
            </Button>
          </div>
        </div>
      )}

      {/* SECONDARY SECTION: Contacts & Quick Dials (left) + Nearby Emergency Resources (right) */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        {/* Left Column (5 cols): Quick Dials + Emergency Contacts */}
        <div className="space-y-5 lg:col-span-5">
          {/* Quick Dial Grid */}
          <div className="rounded-3xl border border-border/80 bg-card p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
                <PhoneCall className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-outfit text-base font-extrabold text-foreground">
                  Quick Dial Helplines
                </h3>
                <p className="text-xs text-muted-foreground">
                  Priority clinical escalation & emergency numbers
                </p>
              </div>
            </div>

            {rosterLoading ? (
              <div className="flex items-center gap-2 py-2 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Loading dispatch numbers…</span>
              </div>
            ) : quickDials.length > 0 ? (
              <div className="space-y-2">
                {quickDials.map((dial: any, index: number) => {
                  const phone = dial.phone || dial.number || dial.mobileNo;
                  return (
                    <a
                      key={dial._id || dial.id || index}
                      href={`tel:${phone}`}
                      className="flex min-h-[48px] items-center justify-between gap-2 rounded-2xl border border-border/60 bg-muted/30 px-3.5 py-2.5 text-xs transition-colors hover:bg-muted/60"
                    >
                      <span className="font-bold text-foreground">
                        {dial.title || dial.name || 'Escalation Desk'}
                      </span>
                      <span className="font-mono font-extrabold text-destructive">{phone}</span>
                    </a>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-2.5">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Standard National Helplines
                </p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-1">
                  {STANDARD_NATIONAL_HELPLINES.map((item) => (
                    <a
                      key={item.id}
                      href={`tel:${item.number}`}
                      className="flex min-h-[52px] items-center justify-between gap-3 rounded-2xl border border-destructive/20 bg-destructive/5 px-3.5 py-2.5 transition-colors hover:bg-destructive/10"
                    >
                      <div>
                        <p className="text-xs font-extrabold text-foreground">{item.title}</p>
                        <p className="text-[11px] text-muted-foreground">{item.subtitle}</p>
                      </div>
                      <span className="rounded-xl bg-destructive px-3 py-1.5 font-mono text-xs font-black text-white">
                        {item.number}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* If ops quick dials exist, still show compact national helplines clearly labeled */}
            {!rosterLoading && quickDials.length > 0 && (
              <div className="border-t border-border/70 pt-3 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Standard National Helplines
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {STANDARD_NATIONAL_HELPLINES.map((item) => (
                    <a
                      key={item.id}
                      href={`tel:${item.number}`}
                      className="flex items-center justify-between rounded-xl border border-border/70 bg-muted/20 px-3 py-2 text-xs transition-colors hover:bg-muted/50"
                    >
                      <span className="truncate font-semibold text-foreground">
                        {item.number === '112' ? 'Emergency' : 'Ambulance'}
                      </span>
                      <span className="font-mono font-extrabold text-destructive">{item.number}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Emergency Contacts Roster */}
          <div className="rounded-3xl border border-border/80 bg-card p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-outfit text-base font-extrabold text-foreground">
                  Emergency Contacts Roster
                </h3>
                <p className="text-xs text-muted-foreground">
                  Share your live pin or call your trusted contacts in one tap
                </p>
              </div>
            </div>

            {rosterLoading ? (
              <div className="flex items-center gap-2 py-2 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Loading emergency contacts…</span>
              </div>
            ) : contacts.length === 0 ? (
              <p className="rounded-2xl bg-muted/30 p-3.5 text-xs text-muted-foreground">
                No emergency contacts saved yet. Add trusted contacts from your Profile settings so they appear here for one-tap alerts.
              </p>
            ) : (
              <div className="space-y-2.5">
                {contacts.map((contact: any, index: number) => {
                  const cleanWa = sanitizePhoneForWhatsApp(contact.phone);
                  const waHref = cleanWa
                    ? `https://wa.me/${cleanWa}?text=${encodeURIComponent(alertShareMessage)}`
                    : whatsappShareUrl;
                  return (
                    <div
                      key={contact._id || contact.id || index}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border/60 bg-muted/25 p-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-xs font-extrabold text-foreground">
                          {contact.name}
                          {contact.relation ? (
                            <span className="font-normal text-muted-foreground">
                              {' '}
                              · {contact.relation}
                            </span>
                          ) : null}
                        </p>
                        <p className="font-mono text-[11px] font-semibold text-muted-foreground">
                          {contact.phone}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <a
                          href={`tel:${contact.phone}`}
                          className="inline-flex h-8 items-center gap-1 rounded-xl border border-border bg-background px-2.5 text-[11px] font-bold text-foreground hover:bg-muted"
                        >
                          <PhoneCall className="h-3 w-3" />
                          Call
                        </a>
                        <a
                          href={waHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex h-8 items-center gap-1 rounded-xl bg-emerald-600 px-2.5 text-[11px] font-bold text-white hover:bg-emerald-700"
                        >
                          <Send className="h-3 w-3" />
                          Pin
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {rosterError && (
              <p className="flex items-center gap-1.5 text-[11px] font-bold text-destructive">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                <span>{rosterError}</span>
              </p>
            )}
          </div>
        </div>

        {/* Right Column (7 cols): Nearby Emergency Resources & Inline Route Map */}
        <div className="rounded-3xl border border-border/80 bg-card p-5 shadow-sm space-y-4 lg:col-span-7">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-outfit text-base font-extrabold text-foreground">
                  Nearby Emergency Resources
                </h3>
                <p className="text-xs text-muted-foreground">
                  Hospitals, police stations, clinics & pharmacies within 5 km
                </p>
              </div>
            </div>

            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                if (activeCoords) {
                  void loadNearbyFacilities(activeCoords.lat, activeCoords.lng);
                } else {
                  void locateAndFetchFacilities();
                }
              }}
              disabled={facilitiesLoading}
              className="rounded-xl text-xs"
            >
              <RefreshCw className={cn('mr-1.5 h-3.5 w-3.5', facilitiesLoading && 'animate-spin')} />
              Refresh
            </Button>
          </div>

          {/* Category Filter Chips */}
          <div className="flex flex-wrap gap-1.5">
            {(
              [
                { key: 'all', label: 'All' },
                { key: 'hospital', label: 'Hospitals' },
                { key: 'police', label: 'Police' },
                { key: 'clinic', label: 'Clinics' },
                { key: 'pharmacy', label: 'Pharmacies' },
              ] as const
            ).map((chip) => {
              const active = facilityFilter === chip.key;
              return (
                <button
                  key={chip.key}
                  type="button"
                  onClick={() => setFacilityFilter(chip.key)}
                  className={cn(
                    'rounded-xl border px-3 py-1.5 text-xs font-bold transition-colors',
                    active
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-background text-muted-foreground hover:text-foreground'
                  )}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>

          {/* Facility List States */}
          {geoDenied && !activeCoords ? (
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 text-center space-y-3">
              <Crosshair className="mx-auto h-7 w-7 text-amber-600 dark:text-amber-400" />
              <div>
                <p className="text-xs font-extrabold text-foreground">
                  Location access needed to find nearby hospitals & police stations
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Allow browser location permissions and tap Retry. You can still trigger SOS or use Quick Dials at any time.
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => void locateAndFetchFacilities()}
                className="rounded-xl"
              >
                <Crosshair className="mr-1.5 h-3.5 w-3.5" />
                Enable & Search Nearby
              </Button>
            </div>
          ) : facilitiesLoading ? (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="text-xs font-medium">Searching emergency facilities within 5 km…</p>
            </div>
          ) : facilitiesError ? (
            <div className="rounded-2xl border border-border bg-muted/30 p-5 text-center space-y-3">
              <AlertTriangle className="mx-auto h-6 w-6 text-amber-500" />
              <p className="text-xs font-semibold text-foreground">{facilitiesError}</p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() =>
                  activeCoords
                    ? void loadNearbyFacilities(activeCoords.lat, activeCoords.lng)
                    : void locateAndFetchFacilities()
                }
                className="rounded-xl"
              >
                <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                Retry Lookup
              </Button>
            </div>
          ) : visibleFacilities.length === 0 ? (
            <div className="rounded-2xl border border-border bg-muted/20 p-6 text-center text-xs text-muted-foreground">
              No matching emergency facilities found within 5 km for this filter. Try switching to &ldquo;All&rdquo; or use Quick Dials above.
            </div>
          ) : (
            <div className="space-y-3">
              {visibleFacilities.map((facility) => {
                const meta = getFacilityBadgeMeta(facility.category);
                const BadgeIcon = meta.icon;
                const isExpanded = expandedFacilityId === facility.id;
                const turnByTurnParams = new URLSearchParams({
                  api: '1',
                  destination: `${facility.lat},${facility.lng}`,
                });
                if (activeCoords) {
                  turnByTurnParams.set('origin', `${activeCoords.lat},${activeCoords.lng}`);
                }
                const turnByTurnUrl = `https://www.google.com/maps/dir/?${turnByTurnParams.toString()}`;

                return (
                  <div
                    key={facility.id}
                    className={cn(
                      'rounded-2xl border p-3.5 transition-all',
                      isExpanded
                        ? 'border-primary/50 bg-primary/5'
                        : 'border-border/70 bg-background/60 hover:border-border'
                    )}
                  >
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={cn(
                              'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider',
                              meta.badgeClass
                            )}
                          >
                            <BadgeIcon className="h-3 w-3" />
                            {meta.label}
                          </span>
                          <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-bold text-foreground">
                            {facility.distanceKm} km
                          </span>
                        </div>
                        <p className="truncate font-outfit text-sm font-extrabold text-foreground">
                          {facility.name}
                        </p>
                        {facility.address && (
                          <p className="truncate text-[11px] text-muted-foreground">
                            {facility.address}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                        {facility.phone && (
                          <Button asChild size="sm" variant="outline" className="h-9 rounded-xl text-[11px]">
                            <a href={`tel:${facility.phone}`}>
                              <PhoneCall className="mr-1 h-3.5 w-3.5" />
                              Call
                            </a>
                          </Button>
                        )}
                        <Button
                          type="button"
                          size="sm"
                          variant={isExpanded ? 'default' : 'outline'}
                          onClick={() =>
                            setExpandedFacilityId((prev) => (prev === facility.id ? null : facility.id))
                          }
                          className="h-9 rounded-xl text-[11px] font-bold"
                        >
                          <MapPin className="mr-1 h-3.5 w-3.5" />
                          {isExpanded ? 'Hide Route' : 'View Route'}
                        </Button>
                        <Button asChild size="sm" className="h-9 rounded-xl text-[11px] font-bold">
                          <a href={turnByTurnUrl} target="_blank" rel="noopener noreferrer">
                            <Navigation className="mr-1 h-3.5 w-3.5" />
                            Open Turn-by-Turn
                            <ExternalLink className="ml-1 h-3 w-3 opacity-75" />
                          </a>
                        </Button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-border/60">
                        <EmbeddedMapFrame
                          lat={facility.lat}
                          lng={facility.lng}
                          originLat={activeCoords?.lat}
                          originLng={activeCoords?.lng}
                          label={`${facility.name} (${facility.distanceKm} km)`}
                          mapsApiKey={mapsApiKey}
                          heightClass="h-[260px] sm:h-[320px]"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
