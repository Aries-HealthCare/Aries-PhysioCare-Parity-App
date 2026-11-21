export type ParityChecklistItem = {
  key: string;
  label: string;
  step: number;
  note: string;
  status: 'pending' | 'resubmitted';
};

export interface ChecklistCatalogItem {
  key: string;
  label: string;
  step: number;
  groupTitle: string;
}

export const ONBOARDING_STEP_TITLES: Record<number, string> = {
  0: 'Personal & Identity',
  1: 'Professional Info',
  2: 'Banking & PAN',
  3: 'Service Areas',
  4: 'Review & Payment',
};

export const ONBOARDING_CHECKLIST_CATALOG: readonly ChecklistCatalogItem[] = [
  {
    key: 'profilePhoto',
    label: 'Profile Photo',
    step: 0,
    groupTitle: 'Personal & Identity',
  },
  {
    key: 'personalDetails',
    label: 'Personal Details (Name, DOB, Gender, Email)',
    step: 0,
    groupTitle: 'Personal & Identity',
  },
  {
    key: 'identityProof',
    label: 'Government ID Proof (Aadhaar / Passport / National ID)',
    step: 0,
    groupTitle: 'Personal & Identity',
  },
  {
    key: 'addressDetails',
    label: 'Residential Address & Pincode',
    step: 0,
    groupTitle: 'Personal & Identity',
  },
  {
    key: 'professionalRole',
    label: 'Role & Primary Qualification',
    step: 1,
    groupTitle: 'Professional Info',
  },
  {
    key: 'experienceSpecializations',
    label: 'Experience & Specializations',
    step: 1,
    groupTitle: 'Professional Info',
  },
  {
    key: 'degreeCertificate',
    label: 'Degree Certificate / CV / Certifications',
    step: 1,
    groupTitle: 'Professional Info',
  },
  {
    key: 'licenseProof',
    label: 'Council Registration & License Proof',
    step: 1,
    groupTitle: 'Professional Info',
  },
  {
    key: 'bankDetails',
    label: 'Bank Account Details (Account No, IFSC / Routing)',
    step: 2,
    groupTitle: 'Banking & PAN',
  },
  {
    key: 'panTaxDetails',
    label: 'PAN / Tax Identification Details',
    step: 2,
    groupTitle: 'Banking & PAN',
  },
  {
    key: 'cancelledCheque',
    label: 'Cancelled Cheque / Bank Statement',
    step: 2,
    groupTitle: 'Banking & PAN',
  },
  {
    key: 'serviceAreas',
    label: 'Service City, Localities & Pincodes',
    step: 3,
    groupTitle: 'Service Areas',
  },
  {
    key: 'commuteLicense',
    label: 'Commute Mode & Driving License',
    step: 3,
    groupTitle: 'Service Areas',
  },
  {
    key: 'registrationFee',
    label: 'Registration Fee (Online Payment)',
    step: 4,
    groupTitle: 'Identity & Payment',
  },
] as const;

const CATALOG_BY_KEY = new Map<string, ChecklistCatalogItem>(
  ONBOARDING_CHECKLIST_CATALOG.map((item) => [item.key, item])
);

const FEE_WAIVED_STATUSES = new Set(['WAIVED', 'ALREADY_PAID', 'EXEMPT']);
const PRE_2026_CUTOFF_MS = Date.UTC(2026, 0, 1, 0, 0, 0, 0);

/**
 * Unwraps document values stored either as a plain URL string or as `{ name, url }`.
 */
export function extractDocUrl(val: unknown): string {
  if (!val) return '';
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (!trimmed || trimmed === 'null' || trimmed === 'undefined') return '';
    return trimmed;
  }
  if (typeof val === 'object' && !Array.isArray(val)) {
    const record = val as Record<string, unknown>;
    const candidate = record.url ?? record.uri;
    if (typeof candidate === 'string') {
      const trimmed = candidate.trim();
      if (!trimmed || trimmed === 'null' || trimmed === 'undefined') return '';
      return trimmed;
    }
  }
  return '';
}

/**
 * Extracts a human-readable filename from a `{ name, url }` document object or plain URL.
 */
export function extractDocName(val: unknown, fallback = 'Uploaded_Document'): string {
  if (val && typeof val === 'object' && !Array.isArray(val)) {
    const record = val as Record<string, unknown>;
    if (typeof record.name === 'string' && record.name.trim().length > 0) {
      return record.name.trim();
    }
  }
  const url = extractDocUrl(val);
  if (url) {
    const lastSegment = url.split('?')[0]?.split('/').pop()?.trim();
    if (lastSegment) return lastSegment;
  }
  return fallback;
}

/**
 * Canonical onboarding fee settlement check matching ariesxpert-backend:
 * paid flag, legacy pre-2026 signup, or explicit waiver/exempt status.
 */
export function isFeeSettled(user: Record<string, any> | null | undefined): boolean {
  if (!user || typeof user !== 'object') return false;
  if (user.isOnboardingPaid === true || user.isPaid === true) return true;
  if (user.isFeeWaived === true || user.feeWaived === true || user.isExistingMember === true) {
    return true;
  }

  const paymentStatus =
    typeof user.paymentStatus === 'string' ? user.paymentStatus.trim().toUpperCase() : '';
  if (FEE_WAIVED_STATUSES.has(paymentStatus)) return true;

  if (user.createdAt) {
    const created = new Date(user.createdAt);
    if (!Number.isNaN(created.getTime()) && created.getTime() < PRE_2026_CUTOFF_MS) {
      return true;
    }
  }

  return false;
}

/**
 * Normalizes raw checklist entries from backend responses against the canonical 0..4 catalog.
 */
export function normalizeChecklist(raw: unknown): ParityChecklistItem[] {
  if (!Array.isArray(raw)) return [];

  const seen = new Set<string>();
  const normalized: ParityChecklistItem[] = [];

  for (const entry of raw) {
    const rawKey =
      typeof entry === 'string'
        ? entry
        : entry && typeof entry === 'object'
          ? (entry as Record<string, unknown>).key
          : undefined;
    if (typeof rawKey !== 'string') continue;

    const key = rawKey.trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);

    const catalogItem = CATALOG_BY_KEY.get(key);
    const record = entry && typeof entry === 'object' ? (entry as Record<string, unknown>) : {};

    const label =
      typeof record.label === 'string' && record.label.trim().length > 0
        ? record.label.trim()
        : catalogItem?.label || key;

    const rawStep = record.step;
    const step =
      typeof rawStep === 'number' && Number.isFinite(rawStep)
        ? Math.max(0, Math.min(4, Math.trunc(rawStep)))
        : catalogItem?.step ?? 0;

    const note = typeof record.note === 'string' ? record.note.trim() : '';
    const status =
      String(record.status || '').trim().toLowerCase() === 'resubmitted'
        ? 'resubmitted'
        : 'pending';

    normalized.push({ key, label, step, note, status });
  }

  return normalized;
}

/**
 * Returns the earliest 0-based onboarding step with pending items, or 4 (Review & Resubmit)
 * when all flagged items have already been updated.
 */
export function getNextPendingStep(items: ParityChecklistItem[]): number {
  if (!Array.isArray(items) || items.length === 0) return 0;
  const pendingSteps = items
    .filter((item) => item && item.status !== 'resubmitted' && Number.isFinite(item.step))
    .map((item) => item.step);
  if (pendingSteps.length === 0) return 4;
  return Math.min(...pendingSteps);
}

/**
 * Guards server hydration in the onboarding wizard so async `user._id` arrival hydrates
 * cleanly after an initial `null` render, while duplicate renders for the same user ID do not
 * clobber in-progress form edits.
 */
export function shouldHydrateFromServerDraft(
  user: { _id?: string | null; id?: string | null } | null | undefined,
  hydratedUserId: string | null | undefined
): boolean {
  if (!user || typeof user !== 'object') return false;
  const userId =
    (typeof user._id === 'string' && user._id.trim()) ||
    (typeof user.id === 'string' && user.id.trim()) ||
    '';
  if (!userId) return false;
  return hydratedUserId !== userId;
}

/**
 * Returns true when an account is in `incomplete` / checklist-resubmission state so stale
 * `localStorage` draft step numbers never override server status or `?step=` deep links.
 */
export function shouldSkipLocalDraftStepOverride(
  user:
    | {
        onboardingStatus?: string | null;
        status?: string | null;
        incompleteChecklist?: unknown[] | null;
      }
    | null
    | undefined
): boolean {
  if (!user || typeof user !== 'object') return false;
  const obStatus = String(user.onboardingStatus || '').trim().toLowerCase();
  const accStatus = String(user.status || '').trim().toLowerCase();
  if (obStatus === 'incomplete' || accStatus === 'incomplete') return true;
  return Array.isArray(user.incompleteChecklist) && user.incompleteChecklist.filter(Boolean).length > 0;
}

/**
 * Distinguishes genuine admin-flagged incomplete resubmission mode from
 * `providerApi.normalizeExpertProfile`'s `'incomplete'` fallback on brand-new unsubmitted drafts.
 */
export function isAdminIncompleteResubmissionMode(
  user:
    | {
        onboardingStatus?: string | null;
        status?: string | null;
        onboardingStep?: number | null;
        incompleteChecklist?: unknown[] | null;
        incompleteNote?: string | null;
      }
    | null
    | undefined,
  checklistItems: ParityChecklistItem[] = [],
  incompleteNote = ''
): boolean {
  const hasChecklist =
    (Array.isArray(checklistItems) && checklistItems.length > 0) ||
    (Array.isArray(user?.incompleteChecklist) &&
      user.incompleteChecklist.filter(Boolean).length > 0);
  if (hasChecklist) return true;

  const hasNote =
    incompleteNote.trim().length > 0 ||
    Boolean(user?.incompleteNote && user.incompleteNote.trim().length > 0);
  if (hasNote) return true;

  if (!user || typeof user !== 'object') return false;

  const accStatus = String(user.status || '').trim().toLowerCase();
  if (accStatus === 'incomplete') return true;

  const obStatus = String(user.onboardingStatus || '').trim().toLowerCase();
  if (obStatus === 'incomplete' && (user.onboardingStep ?? 0) >= 5) return true;

  return false;
}

/**
 * Marks all checklist items belonging to `step` as `'resubmitted'` without mutating inputs.
 */
export function markParityStepResubmitted(
  items: ParityChecklistItem[],
  step: number
): ParityChecklistItem[] {
  if (!Array.isArray(items)) return [];
  return items.map((item) =>
    item && item.step === step ? { ...item, status: 'resubmitted' } : item
  );
}

/**
 * Parses `?step=N&focus=<key>` from `window.location.search` safely for 0-based steps `0..4`.
 */
export function parseOnboardingQueryParams(search: string): {
  step: number | null;
  focusKey: string | null;
} {
  const params = new URLSearchParams(search || '');
  const rawStep = params.get('step');
  let step: number | null = null;
  if (rawStep !== null && rawStep.trim() !== '') {
    const parsed = Number(rawStep);
    if (Number.isFinite(parsed)) {
      step = Math.max(0, Math.min(4, Math.trunc(parsed)));
    }
  }
  const rawFocus = params.get('focus');
  const focusKey = rawFocus && rawFocus.trim().length > 0 ? rawFocus.trim() : null;
  return { step, focusKey };
}

export interface ParsedSubmitForReviewError {
  code: 'INCOMPLETE_ITEMS_PENDING' | 'REGISTRATION_FEE_REQUIRED' | null;
  message: string;
  targetStep: number | null;
}

/**
 * Parses `submitForReview` errors (including `ApiError` from `api-transport.ts` which preserves
 * `statusCode` and `message`, as well as optional `code` / `pendingItems` payloads) and resolves
 * the 0-based onboarding step to jump back to.
 */
export function parseSubmitForReviewError(
  err: unknown,
  checklist: ParityChecklistItem[]
): ParsedSubmitForReviewError {
  const errRecord = err && typeof err === 'object' ? (err as Record<string, unknown>) : {};
  const rawMessage =
    typeof errRecord.message === 'string' && errRecord.message.trim().length > 0
      ? errRecord.message.trim()
      : '';
  const rawCode =
    typeof errRecord.code === 'string' ? errRecord.code.trim().toUpperCase() : '';

  if (
    rawCode === 'REGISTRATION_FEE_REQUIRED' ||
    /registration fee|REGISTRATION_FEE_REQUIRED/i.test(rawMessage)
  ) {
    return {
      code: 'REGISTRATION_FEE_REQUIRED',
      message:
        rawMessage || 'Please complete the registration fee payment before resubmitting.',
      targetStep: 4,
    };
  }

  if (
    rawCode === 'INCOMPLETE_ITEMS_PENDING' ||
    /flagged sections|before resubmitting|INCOMPLETE_ITEMS_PENDING/i.test(rawMessage)
  ) {
    const rawPending = Array.isArray(errRecord.pendingItems) ? errRecord.pendingItems : [];
    const payloadSteps = rawPending
      .map((entry) =>
        entry && typeof entry === 'object'
          ? Number((entry as Record<string, unknown>).step)
          : Number.NaN
      )
      .filter((s) => Number.isFinite(s) && s >= 0 && s <= 4);

    let targetStep: number;
    if (payloadSteps.length > 0) {
      targetStep = Math.min(...payloadSteps);
    } else {
      const pendingNonFeeSteps = (Array.isArray(checklist) ? checklist : [])
        .filter((item) => item && item.key !== 'registrationFee' && item.status !== 'resubmitted')
        .map((item) => item.step)
        .filter((s) => Number.isFinite(s) && s >= 0 && s <= 4);
      if (pendingNonFeeSteps.length > 0) {
        targetStep = Math.min(...pendingNonFeeSteps);
      } else {
        const allNonFeeSteps = (Array.isArray(checklist) ? checklist : [])
          .filter((item) => item && item.key !== 'registrationFee')
          .map((item) => item.step)
          .filter((s) => Number.isFinite(s) && s >= 0 && s <= 4);
        targetStep = allNonFeeSteps.length > 0 ? Math.min(...allNonFeeSteps) : 0;
      }
    }

    return {
      code: 'INCOMPLETE_ITEMS_PENDING',
      message: rawMessage || 'Please update all flagged sections before resubmitting.',
      targetStep,
    };
  }

  return {
    code: null,
    message:
      rawMessage || 'Something went wrong while updating your profile. Please try again.',
    targetStep: null,
  };
}
