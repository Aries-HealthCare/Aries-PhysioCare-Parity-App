/**
 * GA4 event tracking helper (P2-10).
 *
 * Wraps `window.gtag` / `window.dataLayer` so conversion events can be fired
 * from client components without each call site needing to know whether GA4
 * is actually configured. Safe to call unconditionally — it's a no-op until
 * NEXT_PUBLIC_GA_MEASUREMENT_ID is set in the environment and gtag.js has
 * loaded (see src/app/layout.tsx).
 */

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export type LeadConversionEvent =
  | 'generate_lead_appointment'
  | 'generate_lead_callback'
  | 'generate_lead_contact'
  | 'generate_lead_telehealth'
  | 'generate_lead_corporate'
  | 'generate_lead_investor'
  | 'generate_lead_therapist_application';

/**
 * Fires a GA4 event. No-ops silently (does not throw) if gtag hasn't loaded,
 * e.g. because NEXT_PUBLIC_GA_MEASUREMENT_ID is unset or the script hasn't
 * finished loading yet.
 */
export function trackEvent(eventName: LeadConversionEvent | string, params?: Record<string, unknown>): void {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  try {
    window.gtag('event', eventName, params);
  } catch {
    // Analytics must never break the user-facing flow.
  }
}
