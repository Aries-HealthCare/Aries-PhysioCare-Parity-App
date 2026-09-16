'use client';

import { useEffect, useState } from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { PageHeader, ErrorState, EmptyState } from '@/components/ds';
import { Button } from '@/components/ui/button';
import { useBackendQuery } from '@/hooks/use-backend-query';
import { providerApi } from '@/services/provider-api';

export default function LiveMapPage() {
  const { data: appointments, error, loading, reload } = useBackendQuery(() => providerApi.getAppointments(), []);
  const { data: mapsConfig } = useBackendQuery(() => providerApi.getMapsConfig().catch(() => null), []);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoError('This browser does not provide geolocation. Always-on GPS from the mobile app is not available here.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setGeoError('Location permission denied. Arrival validation and navigation need location while this tab is open.'),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const upcoming = (appointments || []).filter((apt: any) => {
    const status = String(apt.status || apt.appointmentStatus || '').toLowerCase();
    return !['completed', 'cancelled'].includes(status);
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Work"
        title="Live map"
        description="Browser geolocation only while this tab is open. Background tracking stays on AriesXpertV2."
      />
      {geoError ? (
        <div className="rounded-3xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm">{geoError}</div>
      ) : null}
      {coords ? (
        <p className="text-sm font-mono text-muted-foreground">
          Current position: {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
        </p>
      ) : null}
      {mapsConfig?.browserKey || mapsConfig?.apiKey ? (
        <p className="text-xs text-muted-foreground">Maps key issued by backend mobile-config. Embed uses your current location only.</p>
      ) : null}
      {error ? <ErrorState error={error} onRetry={reload} /> : null}
      {loading ? <p className="text-sm text-muted-foreground">Loading appointments…</p> : null}
      {!loading && !upcoming.length ? (
        <EmptyState icon={MapPin} title="No active visits to navigate" description="Accepted leads and scheduled home visits appear here." />
      ) : (
        <div className="grid gap-3">
          {upcoming.map((apt: any) => {
            const id = apt._id || apt.id;
            const address = apt.address || apt.patient?.address || 'Address not on file';
            const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(typeof address === 'string' ? address : JSON.stringify(address))}`;
            return (
              <div key={id} className="rounded-3xl border border-border bg-card p-4 flex items-center justify-between gap-3">
                <div>
                  <p className="font-outfit font-bold">{apt.patientName || apt.patient?.fullName || 'Patient'}</p>
                  <p className="text-xs text-muted-foreground">{typeof address === 'string' ? address : address?.line1}</p>
                </div>
                <Button asChild className="rounded-2xl">
                  <a href={mapsUrl} target="_blank" rel="noreferrer">
                    <Navigation className="w-4 h-4 mr-1" /> Navigate
                  </a>
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
