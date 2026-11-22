'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { ExternalLink, Loader2, MapPin, Navigation } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface EmbeddedMapFrameProps {
  lat?: number;
  lng?: number;
  query?: string;
  originLat?: number;
  originLng?: number;
  label?: string;
  mapsApiKey?: string;
  heightClass?: string;
  className?: string;
}

const DEFAULT_LAT = 12.9716;
const DEFAULT_LNG = 77.5946;

function isFiniteCoord(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

export function EmbeddedMapFrame({
  lat,
  lng,
  query,
  originLat,
  originLng,
  label,
  mapsApiKey,
  heightClass = 'h-[320px] sm:h-[420px] lg:h-[560px]',
  className,
}: EmbeddedMapFrameProps) {
  const hasDestCoords = isFiniteCoord(lat) && isFiniteCoord(lng);
  const hasOriginCoords = isFiniteCoord(originLat) && isFiniteCoord(originLng);
  const trimmedQuery = query?.trim() || '';
  const apiKey = mapsApiKey?.trim() || '';

  const destinationParam = useMemo(() => {
    if (hasDestCoords) return `${lat},${lng}`;
    if (trimmedQuery) return trimmedQuery;
    return `${DEFAULT_LAT},${DEFAULT_LNG}`;
  }, [hasDestCoords, lat, lng, trimmedQuery]);

  const externalDirectionsUrl = useMemo(() => {
    const params = new URLSearchParams({
      api: '1',
      destination: destinationParam,
    });
    if (hasOriginCoords) {
      params.set('origin', `${originLat},${originLng}`);
    }
    return `https://www.google.com/maps/dir/?${params.toString()}`;
  }, [destinationParam, hasOriginCoords, originLat, originLng]);

  const iframeSrc = useMemo(() => {
    if (apiKey) {
      if (hasOriginCoords && (hasDestCoords || trimmedQuery)) {
        const params = new URLSearchParams({
          key: apiKey,
          origin: `${originLat},${originLng}`,
          destination: destinationParam,
          mode: 'driving',
        });
        return `https://www.google.com/maps/embed/v1/directions?${params.toString()}`;
      }
      const params = new URLSearchParams({
        key: apiKey,
        q: destinationParam,
      });
      return `https://www.google.com/maps/embed/v1/place?${params.toString()}`;
    }

    // OpenStreetMap interactive embed fallback
    if (!hasDestCoords && trimmedQuery) {
      // Only a text address is available without a Google Maps key; render clean banner card instead of guessing a pin.
      return null;
    }

    const targetLat = hasDestCoords ? lat : DEFAULT_LAT;
    const targetLng = hasDestCoords ? lng : DEFAULT_LNG;

    let minLat = targetLat - 0.008;
    let maxLat = targetLat + 0.008;
    let minLng = targetLng - 0.012;
    let maxLng = targetLng + 0.012;

    if (hasOriginCoords && hasDestCoords) {
      const latSpan = Math.abs(targetLat - originLat);
      const lngSpan = Math.abs(targetLng - originLng);
      // Include both origin and destination in viewport when they are within a local metro radius
      if (latSpan <= 0.25 && lngSpan <= 0.25) {
        const padLat = Math.max(0.006, latSpan * 0.25);
        const padLng = Math.max(0.008, lngSpan * 0.25);
        minLat = Math.min(targetLat, originLat) - padLat;
        maxLat = Math.max(targetLat, originLat) + padLat;
        minLng = Math.min(targetLng, originLng) - padLng;
        maxLng = Math.max(targetLng, originLng) + padLng;
      }
    }

    minLat = Math.max(-85, minLat);
    maxLat = Math.min(85, maxLat);
    minLng = Math.max(-180, minLng);
    maxLng = Math.min(180, maxLng);

    return `https://www.openstreetmap.org/export/embed.html?bbox=${minLng.toFixed(6)},${minLat.toFixed(6)},${maxLng.toFixed(6)},${maxLat.toFixed(6)}&layer=mapnik&marker=${targetLat.toFixed(6)},${targetLng.toFixed(6)}`;
  }, [apiKey, destinationParam, hasDestCoords, hasOriginCoords, lat, lng, originLat, originLng, trimmedQuery]);

  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
  }, [iframeSrc]);

  const displayLabel =
    label?.trim() ||
    trimmedQuery ||
    (hasDestCoords ? `${lat.toFixed(5)}, ${lng.toFixed(5)}` : 'Bengaluru (Default View)');

  return (
    <div
      className={cn(
        'relative w-full overflow-hidden rounded-3xl border border-border/80 bg-muted/30 shadow-sm',
        heightClass,
        className
      )}
    >
      {/* Floating header pill */}
      <div className="pointer-events-none absolute inset-x-3 top-3 z-10 flex flex-wrap items-center justify-between gap-2">
        <div className="pointer-events-auto flex max-w-[calc(100%-170px)] min-w-0 items-center gap-2 rounded-2xl border border-border/70 bg-background/95 px-3 py-1.5 text-xs font-semibold text-foreground shadow-md backdrop-blur-md">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
          <span className="truncate">{displayLabel}</span>
        </div>

        <a
          href={externalDirectionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="pointer-events-auto inline-flex items-center gap-1.5 rounded-2xl border border-primary/20 bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground shadow-md transition-colors hover:bg-primary/90"
        >
          <Navigation className="h-3.5 w-3.5 shrink-0" />
          <span>Open in Google Maps</span>
          <ExternalLink className="h-3 w-3 shrink-0 opacity-80" />
        </a>
      </div>

      {iframeSrc ? (
        <>
          {!loaded && (
            <div className="absolute inset-0 z-[5] flex flex-col items-center justify-center gap-2 bg-muted/60 backdrop-blur-[1px]">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="text-xs font-medium text-muted-foreground">Loading interactive map…</p>
            </div>
          )}
          <iframe
            key={iframeSrc}
            src={iframeSrc}
            title={displayLabel}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            onLoad={() => setLoaded(true)}
            className="h-full w-full border-0"
          />
        </>
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-muted/50 via-background to-primary/5 p-6 pt-16 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <MapPin className="h-6 w-6" />
          </div>
          <p className="font-outfit text-base font-bold text-foreground">
            {label?.trim() || 'Visit Location'}
          </p>
          <p className="mt-1 max-w-md text-xs text-muted-foreground leading-relaxed">
            {trimmedQuery}
          </p>
          <p className="mt-2 text-[11px] text-muted-foreground">
            Exact GPS coordinates are not attached to this address yet. Launch turn-by-turn navigation directly in Google Maps.
          </p>
          <a
            href={externalDirectionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            <Navigation className="h-4 w-4" />
            <span>Navigate in Google Maps</span>
            <ExternalLink className="h-3.5 w-3.5 opacity-80" />
          </a>
        </div>
      )}
    </div>
  );
}
