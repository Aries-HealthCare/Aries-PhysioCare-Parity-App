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
