'use client';

import { useEffect } from 'react';
import {
  parseAttributionFromSearchParams,
  storeAttribution,
} from '@/lib/growth-attribution';

/** Persists UTM / content attribution from the landing URL for lead forms. */
export function AttributionCapture() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hasUtm =
      params.has('utm_source') ||
      params.has('utm_campaign') ||
      params.has('contentId') ||
      params.has('gclid') ||
      params.has('fbclid');
    if (!hasUtm) return;
    storeAttribution(parseAttributionFromSearchParams(params));
  }, []);
  return null;
}
