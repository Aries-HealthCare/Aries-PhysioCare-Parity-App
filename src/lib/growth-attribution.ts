/**
 * Capture UTM / growth attribution from landing URLs for lead ingest.
 */
export interface GrowthAttributionPayload {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmAdset?: string;
  utmAd?: string;
  utmKeyword?: string;
  gclid?: string;
  fbclid?: string;
  contentId?: string;
  campaignId?: string;
  marketId?: string;
  growthEngine?: 'PATIENT' | 'THERAPIST' | 'BRAND';
  referrer?: string;
  landingPage?: string;
}

const STORAGE_KEY = 'aries_growth_attribution';

export function parseAttributionFromSearchParams(
  params: URLSearchParams,
): GrowthAttributionPayload {
  const engine = String(params.get('growthEngine') || '').toUpperCase();
  return {
    utmSource: params.get('utm_source') || params.get('utmSource') || undefined,
    utmMedium: params.get('utm_medium') || params.get('utmMedium') || undefined,
    utmCampaign: params.get('utm_campaign') || params.get('utmCampaign') || undefined,
    utmAdset: params.get('utm_adset') || params.get('utmAdset') || undefined,
    utmAd: params.get('utm_ad') || params.get('utmAd') || undefined,
    utmKeyword: params.get('utm_term') || params.get('utmKeyword') || undefined,
    gclid: params.get('gclid') || undefined,
    fbclid: params.get('fbclid') || undefined,
    contentId: params.get('contentId') || undefined,
    campaignId: params.get('campaignId') || undefined,
    marketId: params.get('marketId') || undefined,
    growthEngine:
      engine === 'PATIENT' || engine === 'THERAPIST' || engine === 'BRAND'
        ? engine
        : 'PATIENT',
    landingPage: typeof window !== 'undefined' ? window.location.href : undefined,
  };
}

export function storeAttribution(payload: GrowthAttributionPayload): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* ignore */
  }
}

export function getStoredAttribution(): GrowthAttributionPayload {
  if (typeof window === 'undefined') return {};
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as GrowthAttributionPayload) : {};
  } catch {
    return {};
  }
}

export function mergeAttributionIntoPayload<T extends Record<string, unknown>>(
  payload: T,
  attribution?: GrowthAttributionPayload,
): T & GrowthAttributionPayload {
  const attr = attribution || getStoredAttribution();
  return { ...payload, ...attr, growthEngine: attr.growthEngine || 'PATIENT' };
}

/** Alias for form submitters — merges sessionStorage attribution into lead payloads. */
export function withStoredAttribution<T extends Record<string, unknown>>(
  payload: T,
): T & GrowthAttributionPayload {
  return mergeAttributionIntoPayload(payload);
}
