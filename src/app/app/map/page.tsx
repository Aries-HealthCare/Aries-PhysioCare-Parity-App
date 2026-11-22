'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  CalendarClock,
  Compass,
  Crosshair,
  ExternalLink,
  Info,
  Loader2,
  MapPin,
  Navigation,
  Phone,
  Play,
  Radio,
  RefreshCw,
  Search,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import { PageHeader, ErrorState, EmptyState } from '@/components/ds';
import { EmbeddedMapFrame } from '@/components/map/embedded-map-frame';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { haversineDistanceKm } from '@/lib/dashboard-analytics';
import { providerApi } from '@/services/provider-api';
import { cn } from '@/lib/utils';

type LayerFilter = 'all' | 'visits' | 'leads' | 'my_location';

interface GeoCoords {
  lat: number;
  lng: number;
  accuracy?: number;
}

interface MapStop {
  id: string;
  kind: 'visit' | 'lead';
  title: string;
  subtitle: string;
  address: string;
  phone?: string;
  coords?: { lat: number; lng: number };
  scheduledLabel?: string;
  statusLabel: string;
  fee?: number;
  actionHref: string;
  actionLabel: string;
}

function parseFiniteNum(v: unknown): number | null {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string' && v.trim() !== '') {
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

function extractCoordsFromObj(obj: any): { lat: number; lng: number } | undefined {
  if (!obj || typeof obj !== 'object') return undefined;

  // GeoJSON Point: { coordinates: [lng, lat] }
  if (Array.isArray(obj.coordinates) && obj.coordinates.length >= 2) {
    const lng = parseFiniteNum(obj.coordinates[0]);
    const lat = parseFiniteNum(obj.coordinates[1]);
    if (lat !== null && lng !== null && (lat !== 0 || lng !== 0) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180) {
      return { lat, lng };
    }
  }

  const lat = parseFiniteNum(obj.latitude ?? obj.lat);
  const lng = parseFiniteNum(obj.longitude ?? obj.lng ?? obj.lon);
  if (lat !== null && lng !== null && (lat !== 0 || lng !== 0) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180) {
    return { lat, lng };
  }

  return undefined;
}

function extractItemCoords(item: any): { lat: number; lng: number } | undefined {
  if (!item || typeof item !== 'object') return undefined;
  const candidates = [
    item,
    item.location,
    item.geoLocation,
    item.coordinates,
    item.address,
    item.patient,
    item.patient?.location,
    item.patient?.address,
    item.broadcast,
    item.broadcast?.location,
    item.broadcast?.address,
    item.broadcast?.patient,
    item.broadcast?.patient?.location,
    item.broadcast?.patient?.address,
  ];
  for (const candidate of candidates) {
    const found = extractCoordsFromObj(candidate);
    if (found) return found;
  }
  return undefined;
}

function formatAddress(raw: any): string {
  if (!raw) return '';
  if (typeof raw === 'string') return raw.trim();
  if (typeof raw === 'object') {
    const parts = [
      raw.street,
      raw.line1,
      raw.addressLine1,
      raw.addressLine2,
      raw.landMark,
      raw.landmark,
      raw.area,
      raw.locality,
      raw.city,
      raw.state,
      raw.pinCode || raw.pincode || raw.zipCode,
    ]
      .map((p) => (typeof p === 'string' || typeof p === 'number' ? String(p).trim() : ''))
      .filter(Boolean);
    return parts.join(', ');
  }
  return '';
}

function buildDirectionsUrl(stop: MapStop, origin?: GeoCoords | null): string {
  const dest = stop.coords
    ? `${stop.coords.lat},${stop.coords.lng}`
    : stop.address || stop.title;
  const params = new URLSearchParams({ api: '1', destination: dest });
  if (origin) {
    params.set('origin', `${origin.lat},${origin.lng}`);
  }
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

export default function LiveMapPage() {
  const { toast } = useToast();

  const [appointments, setAppointments] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [mapsConfig, setMapsConfig] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const [userCoords, setUserCoords] = useState<GeoCoords | null>(null);
  const [geoStatus, setGeoStatus] = useState<'idle' | 'locating' | 'active' | 'denied' | 'unsupported'>('idle');
  const [geoMessage, setGeoMessage] = useState<string | null>(null);

  const [activeLayer, setActiveLayer] = useState<LayerFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [aptsRes, leadsRes, configRes] = await Promise.allSettled([
        providerApi.getAppointments(),
        providerApi.getLeads(),
        providerApi.getMapsConfig().catch(() => null),
      ]);

      if (aptsRes.status === 'fulfilled') {
        setAppointments(Array.isArray(aptsRes.value) ? aptsRes.value : []);
      }

      if (leadsRes.status === 'fulfilled' && leadsRes.value) {
        const merged = [
          ...(leadsRes.value.newLeads || []).map((l: any) => ({ ...l, _leadBucket: 'new' })),
          ...(leadsRes.value.acquiredLeads || []).map((l: any) => ({ ...l, _leadBucket: 'acquired' })),
        ];
        const seen = new Set<string>();
        const uniqueLeads = merged.filter((l: any) => {
          const key = String(l._id || l.id || '');
          if (!key || seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        setLeads(uniqueLeads);
      }

      if (configRes.status === 'fulfilled') {
        setMapsConfig(configRes.value);
      }

      if (aptsRes.status === 'rejected' && leadsRes.status === 'rejected') {
        setError(aptsRes.reason || leadsRes.reason);
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshLocation = useCallback(
    (notify = false) => {
      if (typeof navigator === 'undefined' || !navigator.geolocation) {
        setGeoStatus('unsupported');
        setGeoMessage('This browser does not support live geolocation.');
        return;
      }

      setGeoStatus('locating');
      setGeoMessage(null);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const next: GeoCoords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          };
          setUserCoords(next);
          setGeoStatus('active');
          setGeoMessage(null);
          if (notify) {
            toast({
              title: 'Location updated',
              description: `GPS locked (${next.lat.toFixed(4)}, ${next.lng.toFixed(4)})`,
            });
          }
        },
        (err) => {
          setGeoStatus('denied');
          setGeoMessage(
            err.code === err.PERMISSION_DENIED
              ? 'Location access was denied. Enable browser location permissions to compute distances and center on your position.'
              : 'Unable to determine your current GPS position right now. Try refreshing in an open area.'
          );
          if (notify) {
            toast({
              variant: 'destructive',
              title: 'Could not refresh location',
              description: 'Check browser location permissions and try again.',
            });
          }
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 15000 }
      );
    },
    [toast]
  );

  useEffect(() => {
    void loadData();
    refreshLocation(false);
  }, [loadData, refreshLocation]);

  const mapsApiKey: string | undefined =
    mapsConfig?.browserKey ||
    mapsConfig?.apiKey ||
    mapsConfig?.googleMapsApiKey ||
    mapsConfig?.webApiKey ||
    undefined;

  // Normalize active scheduled visits
  const visitStops: MapStop[] = useMemo(() => {
    return appointments
      .filter((apt: any) => {
        const status = String(apt.status || apt.appointmentStatus || '').toLowerCase();
        return !['completed', 'done', 'cancelled', 'canceled'].includes(status);
      })
      .map((apt: any) => {
        const id = String(apt._id || apt.id);
        const patient = apt.patient || {};
        const name =
          apt.patientName ||
          patient.fullName ||
          `${patient.firstName || ''} ${patient.lastName || ''}`.trim() ||
          'Patient Visit';
        const address =
          formatAddress(apt.address) ||
          formatAddress(patient.address) ||
          [apt.locality, apt.area, apt.city].filter(Boolean).join(', ') ||
          'Address pending';
        const condition =
          apt.condition ||
          apt.treatmentType?.name ||
          (typeof apt.treatmentType === 'string' ? apt.treatmentType : '') ||
          (Array.isArray(patient.medicalConditions) ? patient.medicalConditions.join(', ') : '') ||
          'Home Physiotherapy Visit';
        const datePart = apt.appointmentDate || apt.scheduledDate || '';
        const timePart = apt.appointmentTime || apt.scheduledTime || '';
        const scheduledLabel = [datePart ? String(datePart).slice(0, 10) : '', timePart]
          .filter(Boolean)
          .join(' · ');
        const phone = apt.patientPhone || patient.phone || patient.mobileNo || apt.phone || undefined;
        const fee = Number(apt.sessionFee || apt.fee || apt.totalAmount || 0) || undefined;
        const rawStatus = String(apt.appointmentStatus || apt.status || 'Scheduled');

        return {
          id: `visit:${id}`,
          kind: 'visit' as const,
          title: name,
          subtitle: condition,
          address,
          phone: phone ? String(phone) : undefined,
          coords: extractItemCoords(apt),
          scheduledLabel: scheduledLabel || undefined,
          statusLabel: rawStatus,
          fee,
          actionHref: `/app/visits?apt=${encodeURIComponent(id)}`,
          actionLabel: 'Start Visit',
        };
      });
  }, [appointments]);

  // Normalize nearby leads
  const leadStops: MapStop[] = useMemo(() => {
    return leads.map((lead: any) => {
      const id = String(lead._id || lead.id);
      const b = lead.broadcast || {};
      const patient = b.patient || lead.patient || {};
      const name =
        lead.patientName ||
        b.patientName ||
        patient.fullName ||
        `${patient.firstName || ''} ${patient.lastName || ''}`.trim() ||
        'Nearby Patient Lead';
      const address =
        formatAddress(b.address) ||
        formatAddress(lead.address) ||
        formatAddress(patient.address) ||
        [b.locality || lead.locality, b.area || lead.area, b.city || lead.city, b.pincode || lead.pincode]
          .filter(Boolean)
          .join(', ') ||
        'Area details on lead card';
      const condition =
        b.condition ||
        lead.condition ||
        b.packageType ||
        lead.packageType ||
        (Array.isArray(patient.medicalConditions) ? patient.medicalConditions.join(', ') : '') ||
        'Physiotherapy Inquiry';
      const phone = patient.phone || b.phone || lead.phone || undefined;
      const fee =
        Number(b.estimatedFee || b.sessionFee || lead.estimatedFee || lead.sessionFee || 0) ||
        undefined;
      const isNew = lead._leadBucket === 'new' || !lead.therapistResponse;

      return {
        id: `lead:${id}`,
        kind: 'lead' as const,
        title: name,
        subtitle: condition,
        address,
        phone: phone ? String(phone) : undefined,
        coords: extractItemCoords(lead),
        scheduledLabel: b.scheduledTime || lead.scheduledTime || undefined,
        statusLabel: isNew ? 'New Lead' : 'Interested',
        fee,
        actionHref: '/app/leads',
        actionLabel: 'View Lead',
      };
    });
  }, [leads]);

  const filteredStops = useMemo(() => {
    let base: MapStop[] = [];
    if (activeLayer === 'visits') base = visitStops;
    else if (activeLayer === 'leads') base = leadStops;
    else if (activeLayer === 'all') base = [...visitStops, ...leadStops];
    else base = [];

    const q = searchQuery.trim().toLowerCase();
    const matched = q
      ? base.filter(
          (stop) =>
            stop.title.toLowerCase().includes(q) ||
            stop.subtitle.toLowerCase().includes(q) ||
            stop.address.toLowerCase().includes(q)
        )
      : base;

    // When user coords exist, sort stops with coordinates by closest Haversine distance first
    if (userCoords) {
      return [...matched].sort((a, b) => {
        const da = a.coords
          ? haversineDistanceKm(userCoords.lat, userCoords.lng, a.coords.lat, a.coords.lng)
          : Number.POSITIVE_INFINITY;
        const db = b.coords
          ? haversineDistanceKm(userCoords.lat, userCoords.lng, b.coords.lat, b.coords.lng)
          : Number.POSITIVE_INFINITY;
        return da - db;
      });
    }
    return matched;
  }, [activeLayer, visitStops, leadStops, searchQuery, userCoords]);

  const selectedStop = useMemo(() => {
    if (activeLayer === 'my_location') return null;
    if (selectedStopId) {
      const exact = filteredStops.find((s) => s.id === selectedStopId);
      if (exact) return exact;
    }
    return filteredStops[0] || null;
  }, [activeLayer, filteredStops, selectedStopId]);

  const mapProps = useMemo(() => {
    if (activeLayer === 'my_location') {
      if (userCoords) {
        return {
          lat: userCoords.lat,
          lng: userCoords.lng,
          label: 'My Live Location',
        };
      }
      return {
        label: 'My Location (Waiting for GPS)',
      };
    }

    if (selectedStop) {
      return {
        lat: selectedStop.coords?.lat,
        lng: selectedStop.coords?.lng,
        query: selectedStop.address !== 'Address pending' ? selectedStop.address : selectedStop.title,
        originLat: userCoords?.lat,
        originLng: userCoords?.lng,
        label: `${selectedStop.title} · ${selectedStop.kind === 'visit' ? 'Scheduled Visit' : 'Nearby Lead'}`,
      };
    }

    if (userCoords) {
      return {
        lat: userCoords.lat,
        lng: userCoords.lng,
        label: 'My Live Location',
      };
    }

    return {
      label: 'Service Coverage Area',
    };
  }, [activeLayer, selectedStop, userCoords]);

  const selectedDistanceKm = useMemo(() => {
    if (!userCoords || !selectedStop?.coords) return null;
    return haversineDistanceKm(
      userCoords.lat,
      userCoords.lng,
      selectedStop.coords.lat,
      selectedStop.coords.lng
    );
  }, [selectedStop, userCoords]);

  const gpsStatusLabel =
    geoStatus === 'active'
      ? 'GPS Active'
      : geoStatus === 'locating'
        ? 'Locating…'
        : geoStatus === 'denied'
          ? 'Permission Needed'
          : geoStatus === 'unsupported'
            ? 'Unavailable'
            : 'Standby';

  const gpsStatusDetail =
    geoStatus === 'active' && userCoords
      ? userCoords.accuracy
        ? `±${Math.round(userCoords.accuracy)}m accuracy`
        : `${userCoords.lat.toFixed(4)}, ${userCoords.lng.toFixed(4)}`
      : geoStatus === 'locating'
        ? 'Requesting browser GPS…'
        : 'Click Refresh to retry';

  const handleSelectLayer = (layer: LayerFilter) => {
    setActiveLayer(layer);
    if (layer === 'my_location') {
      setSelectedStopId(null);
      if (!userCoords) refreshLocation(true);
    }
  };

  return (
    <div className="mx-auto max-w-[1600px] space-y-5">
      <PageHeader
        eyebrow="Field Navigation"
        title="Live Map Hub"
        description="Locate your scheduled doorstep visits, inspect nearby leads, and launch turn-by-turn navigation."
        className="mb-0"
        actions={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => refreshLocation(true)}
              disabled={geoStatus === 'locating'}
              className="rounded-2xl"
            >
              {geoStatus === 'locating' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Crosshair className="mr-2 h-4 w-4" />
              )}
              Refresh My Location
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => void loadData()}
              disabled={loading}
              className="rounded-2xl"
            >
              <RefreshCw className={cn('mr-2 h-4 w-4', loading && 'animate-spin')} />
              Sync Stops
            </Button>
          </>
        }
      />

      {/* Capability notice & GPS error */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/70 bg-muted/30 px-4 py-2.5 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 shrink-0 text-primary" />
          <span>
            Browser GPS stays active while this tab is open. Distances are calculated live from your current coordinates.
          </span>
        </div>
        {userCoords && (
          <span className="font-mono text-[11px] font-semibold text-foreground">
            {userCoords.lat.toFixed(5)}, {userCoords.lng.toFixed(5)}
          </span>
        )}
      </div>

      {geoMessage && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-800 dark:text-amber-300">
          <span>{geoMessage}</span>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => refreshLocation(true)}
            className="h-8 rounded-xl border-amber-500/40 text-xs"
          >
            Try Again
          </Button>
        </div>
      )}

      {/* Real 3-stat summary strip */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="flex items-center justify-between rounded-3xl border border-border/80 bg-card p-4 shadow-sm">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Active Visits
            </p>
            <p className="mt-1 font-outfit text-2xl font-extrabold text-foreground">
              {loading ? '—' : visitStops.length}
            </p>
            <p className="text-[11px] text-muted-foreground">Scheduled home & clinic stops</p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <CalendarClock className="h-5 w-5" />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-3xl border border-border/80 bg-card p-4 shadow-sm">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Nearby Leads
            </p>
            <p className="mt-1 font-outfit text-2xl font-extrabold text-foreground">
              {loading ? '—' : leadStops.length}
            </p>
            <p className="text-[11px] text-muted-foreground">Open & interested broadcasts</p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Sparkles className="h-5 w-5" />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-3xl border border-border/80 bg-card p-4 shadow-sm">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              GPS Status
            </p>
            <p className="mt-1 font-outfit text-2xl font-extrabold text-foreground">
              {gpsStatusLabel}
            </p>
            <p className="text-[11px] text-muted-foreground">{gpsStatusDetail}</p>
          </div>
          <div
            className={cn(
              'flex h-11 w-11 items-center justify-center rounded-2xl',
              geoStatus === 'active'
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : geoStatus === 'denied'
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  : 'bg-muted text-muted-foreground'
            )}
          >
            <Radio className={cn('h-5 w-5', geoStatus === 'active' && 'animate-pulse')} />
          </div>
        </div>
      </div>

      {/* Real Layer Filter Chips */}
      <div className="flex flex-wrap items-center gap-2">
        {(
          [
            {
              key: 'all',
              label: `All Stops (${visitStops.length + leadStops.length})`,
              icon: Compass,
            },
            {
              key: 'visits',
              label: `Scheduled Visits (${visitStops.length})`,
              icon: CalendarClock,
            },
            {
              key: 'leads',
              label: `Nearby Leads (${leadStops.length})`,
              icon: Sparkles,
            },
            {
              key: 'my_location',
              label: 'My Location',
              icon: Crosshair,
            },
          ] as const
        ).map((chip) => {
          const Icon = chip.icon;
          const active = activeLayer === chip.key;
          return (
            <button
              key={chip.key}
              type="button"
              onClick={() => handleSelectLayer(chip.key)}
              className={cn(
                'inline-flex min-h-[40px] items-center gap-2 rounded-2xl border px-4 py-2 text-xs font-bold transition-all',
                active
                  ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                  : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground'
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{chip.label}</span>
            </button>
          );
        })}
      </div>

      {error ? <ErrorState error={error} onRetry={loadData} /> : null}

      {/* Responsive Split Workspace: 8 cols map + 4 cols visits & leads panel on lg+ */}
      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-12">
        {/* Left: Interactive Map Canvas (8 cols on desktop) */}
        <div className="space-y-3 lg:col-span-8">
          <EmbeddedMapFrame
            lat={mapProps.lat}
            lng={mapProps.lng}
            query={mapProps.query}
            originLat={mapProps.originLat}
            originLng={mapProps.originLng}
            label={mapProps.label}
            mapsApiKey={mapsApiKey}
            heightClass="h-[340px] sm:h-[440px] lg:h-[600px]"
          />

          {/* Selected Stop Quick Summary Strip */}
          {selectedStop ? (
            <div className="flex flex-col justify-between gap-3 rounded-3xl border border-border/80 bg-card p-4 shadow-sm sm:flex-row sm:items-center">
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      'rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider',
                      selectedStop.kind === 'visit'
                        ? 'bg-primary/10 text-primary'
                        : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                    )}
                  >
                    {selectedStop.kind === 'visit' ? 'Pinned Visit' : 'Pinned Lead'}
                  </span>
                  {selectedDistanceKm !== null && (
                    <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-semibold text-foreground">
                      {selectedDistanceKm} km away
                    </span>
                  )}
                  {selectedStop.scheduledLabel && (
                    <span className="text-[11px] text-muted-foreground">
                      {selectedStop.scheduledLabel}
                    </span>
                  )}
                </div>
                <p className="truncate font-outfit text-base font-extrabold text-foreground">
                  {selectedStop.title}
                </p>
                <p className="truncate text-xs text-muted-foreground">{selectedStop.address}</p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {selectedStop.phone && (
                  <Button asChild size="sm" variant="outline" className="rounded-xl">
                    <a href={`tel:${selectedStop.phone}`}>
                      <Phone className="mr-1.5 h-3.5 w-3.5" />
                      Call
                    </a>
                  </Button>
                )}
                <Button asChild size="sm" variant="outline" className="rounded-xl">
                  <a
                    href={buildDirectionsUrl(selectedStop, userCoords)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Navigation className="mr-1.5 h-3.5 w-3.5" />
                    Navigate
                  </a>
                </Button>
                <Button asChild size="sm" className="rounded-xl">
                  <Link href={selectedStop.actionHref}>
                    {selectedStop.kind === 'visit' ? (
                      <Play className="mr-1.5 h-3.5 w-3.5" />
                    ) : (
                      <UserCheck className="mr-1.5 h-3.5 w-3.5" />
                    )}
                    {selectedStop.actionLabel}
                  </Link>
                </Button>
              </div>
            </div>
          ) : null}
        </div>

        {/* Right: Scrollable Visits & Leads Panel (4 cols on desktop) */}
        <div className="flex flex-col rounded-3xl border border-border/80 bg-card shadow-sm lg:col-span-4 lg:max-h-[710px]">
          <div className="space-y-3 border-b border-border/70 p-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-outfit text-base font-extrabold text-foreground">
                {activeLayer === 'my_location'
                  ? 'My Live Position'
                  : activeLayer === 'visits'
                    ? 'Scheduled Visits'
                    : activeLayer === 'leads'
                      ? 'Nearby Leads'
                      : 'Visits & Nearby Leads'}
              </h2>
              {activeLayer !== 'my_location' && (
                <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-bold text-muted-foreground">
                  {filteredStops.length}
                </span>
              )}
            </div>

            {activeLayer !== 'my_location' && (
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search patient, condition, or area…"
                  className="h-10 w-full rounded-2xl border border-input bg-background pl-9 pr-3 text-xs outline-none focus:border-primary"
                />
              </div>
            )}
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {activeLayer === 'my_location' ? (
              <div className="space-y-4 rounded-2xl border border-border/70 bg-muted/20 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Crosshair className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-outfit text-sm font-extrabold text-foreground">
                      {gpsStatusLabel}
                    </p>
                    <p className="text-xs text-muted-foreground">{gpsStatusDetail}</p>
                  </div>
                </div>

                {userCoords ? (
                  <div className="space-y-2 rounded-2xl bg-background p-3 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Latitude</span>
                      <span className="font-mono font-bold text-foreground">
                        {userCoords.lat.toFixed(6)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Longitude</span>
                      <span className="font-mono font-bold text-foreground">
                        {userCoords.lng.toFixed(6)}
                      </span>
                    </div>
                    {userCoords.accuracy !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">GPS Accuracy</span>
                        <span className="font-mono font-bold text-foreground">
                          ±{Math.round(userCoords.accuracy)} m
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Grant location access in your browser to pin your current position and compute distances to nearby visits.
                  </p>
                )}

                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => refreshLocation(true)}
                    disabled={geoStatus === 'locating'}
                    className="flex-1 rounded-xl"
                  >
                    <Crosshair className="mr-1.5 h-3.5 w-3.5" />
                    Refresh GPS
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => handleSelectLayer('all')}
                    className="flex-1 rounded-xl"
                  >
                    View All Stops
                  </Button>
                </div>
              </div>
            ) : loading ? (
              <div className="flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <p className="text-xs font-medium">Loading visits & nearby leads…</p>
              </div>
            ) : filteredStops.length === 0 ? (
              <EmptyState
                icon={MapPin}
                title={
                  activeLayer === 'visits'
                    ? 'No active visits to navigate'
                    : activeLayer === 'leads'
                      ? 'No nearby leads right now'
                      : 'No matching stops found'
                }
                description={
                  searchQuery
                    ? 'Try clearing your search filter to see all active stops.'
                    : 'Scheduled doorstep visits and nearby patient broadcasts will appear here automatically.'
                }
              />
            ) : (
              filteredStops.map((stop) => {
                const isSelected = selectedStop?.id === stop.id;
                const distKm =
                  userCoords && stop.coords
                    ? haversineDistanceKm(
                        userCoords.lat,
                        userCoords.lng,
                        stop.coords.lat,
                        stop.coords.lng
                      )
                    : null;

                return (
                  <div
                    key={stop.id}
                    className={cn(
                      'rounded-2xl border p-3.5 transition-all',
                      isSelected
                        ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20'
                        : 'border-border/80 bg-background/60 hover:border-primary/40'
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span
                            className={cn(
                              'rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider',
                              stop.kind === 'visit'
                                ? 'bg-primary/10 text-primary'
                                : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                            )}
                          >
                            {stop.kind === 'visit' ? 'Visit' : stop.statusLabel}
                          </span>
                          {distKm !== null && (
                            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-foreground">
                              {distKm} km
                            </span>
                          )}
                          {stop.fee ? (
                            <span className="text-[11px] font-bold text-foreground">
                              ₹{stop.fee.toLocaleString('en-IN')}
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-1.5 truncate font-outfit text-sm font-extrabold text-foreground">
                          {stop.title}
                        </p>
                        <p className="truncate text-[11px] font-medium text-muted-foreground">
                          {stop.subtitle}
                        </p>
                      </div>
                    </div>

                    <div className="mt-2 flex items-start gap-1.5 text-[11px] text-muted-foreground">
                      <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
                      <span className="line-clamp-2">{stop.address}</span>
                    </div>

                    {stop.scheduledLabel && (
                      <p className="mt-1.5 text-[11px] font-medium text-muted-foreground">
                        Schedule: <span className="text-foreground">{stop.scheduledLabel}</span>
                      </p>
                    )}

                    <div className="mt-3 grid grid-cols-2 gap-1.5">
                      <Button
                        type="button"
                        size="sm"
                        variant={isSelected ? 'default' : 'outline'}
                        onClick={() => setSelectedStopId(stop.id)}
                        className="h-9 rounded-xl text-[11px] font-bold"
                      >
                        <MapPin className="mr-1 h-3.5 w-3.5" />
                        {isSelected ? 'Pinned' : 'Pin on Map'}
                      </Button>

                      <Button
                        asChild
                        size="sm"
                        variant="outline"
                        className="h-9 rounded-xl text-[11px] font-bold"
                      >
                        <a
                          href={buildDirectionsUrl(stop, userCoords)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Navigation className="mr-1 h-3.5 w-3.5" />
                          Navigate
                          <ExternalLink className="ml-1 h-3 w-3 opacity-60" />
                        </a>
                      </Button>

                      {stop.phone && (
                        <Button
                          asChild
                          size="sm"
                          variant="outline"
                          className="h-9 rounded-xl text-[11px] font-bold"
                        >
                          <a href={`tel:${stop.phone}`}>
                            <Phone className="mr-1 h-3.5 w-3.5" />
                            Call
                          </a>
                        </Button>
                      )}

                      <Button
                        asChild
                        size="sm"
                        className={cn(
                          'h-9 rounded-xl text-[11px] font-bold',
                          !stop.phone && 'col-span-2'
                        )}
                      >
                        <Link href={stop.actionHref}>
                          {stop.kind === 'visit' ? (
                            <Play className="mr-1 h-3.5 w-3.5" />
                          ) : (
                            <UserCheck className="mr-1 h-3.5 w-3.5" />
                          )}
                          {stop.actionLabel}
                        </Link>
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
