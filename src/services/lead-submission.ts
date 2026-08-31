/**
 * @deprecated Use server actions in `src/app/actions/lead-actions.ts` with LEAD_INGEST_SECRET.
 * This module is retained only to prevent accidental imports from using Render/legacy paths.
 */
export const LEGACY_LEAD_SUBMISSION_REMOVED = true;

export async function submitLeadToBackend(): Promise<never> {
  throw new Error(
    'Legacy lead-submission.ts is disabled. Use canonical server actions with LEAD_INGEST_SECRET.',
  );
}
