import { z } from 'zod';

/** Optional growth attribution fields forwarded to backend lead ingest. */
export const leadAttributionSchema = z.object({
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
  utmAdset: z.string().optional(),
  utmAd: z.string().optional(),
  utmKeyword: z.string().optional(),
  gclid: z.string().optional(),
  fbclid: z.string().optional(),
  contentId: z.string().optional(),
  campaignId: z.string().optional(),
  marketId: z.string().optional(),
  growthEngine: z.enum(['PATIENT', 'THERAPIST', 'BRAND']).optional(),
  referrer: z.string().optional(),
  landingPage: z.string().optional(),
});

export type LeadAttributionFields = z.infer<typeof leadAttributionSchema>;

export function pickAttributionFields(
  data: Record<string, unknown>,
): LeadAttributionFields {
  const parsed = leadAttributionSchema.safeParse(data);
  return parsed.success ? parsed.data : {};
}
