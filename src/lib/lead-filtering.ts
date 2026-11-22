/**
 * Lead filtering, expiry, and display extraction helpers.
 *
 * Mirrors `ariesxpertv2/lib/modules/leads/services/lead_provider.dart` and
 * `ariesxpertv2/lib/modules/leads/screens/clients_leads.dart` 1:1 so the web
 * parity app never displays expired/closed broadcasts or empty placeholder
 * fields that don't exist in the mobile app or admin dashboard.
 */

export const DEFAULT_LEAD_EXPIRY_MS = 72 * 60 * 60 * 1000;

const CLOSED_BROADCAST_STATUSES = new Set([
  'closed',
  'expired',
  'cancelled',
  'canceled',
  'allotted',
  'completed',
]);

const PLACEHOLDER_ADDRESSES = new Set([
  '',
  '—',
  '-',
  'n/a',
  'na',
  'none',
  'address pending',
  'area details on lead card',
  'nearby patient lead',
]);

/** Parses durations like `"4 hours"`, `"72h"`, `"2 days"`, `"30 minutes"`, or numeric hours. */
export function parseExpiresInMs(expiresIn: unknown): number {
  if (typeof expiresIn === 'number' && Number.isFinite(expiresIn) && expiresIn > 0) {
    return expiresIn * 60 * 60 * 1000;
  }
  const raw = String(expiresIn ?? '').trim().toLowerCase();
  if (!raw) return DEFAULT_LEAD_EXPIRY_MS;

  const match = raw.match(/(\d+(?:\.\d+)?)\s*(day|days|d|hour|hours|hr|hrs|h|minute|minutes|min|mins|m)?/i);
  if (!match) return DEFAULT_LEAD_EXPIRY_MS;

  const val = Number.parseFloat(match[1]);
  if (!Number.isFinite(val) || val <= 0) return DEFAULT_LEAD_EXPIRY_MS;

  const unit = (match[2] || 'h').toLowerCase();
  if (unit.startsWith('d')) return val * 24 * 60 * 60 * 1000;
  if (unit.startsWith('m')) return val * 60 * 1000;
  return val * 60 * 60 * 1000;
}

function toTimestampMs(value: unknown): number | null {
  if (!value) return null;
  if (value instanceof Date) {
    const t = value.getTime();
    return Number.isNaN(t) ? null : t;
  }
  const t = new Date(String(value)).getTime();
  return Number.isNaN(t) ? null : t;
}

export interface LeadExpiryInfo {
  isExpired: boolean;
  isClosed: boolean;
  remainingMs: number;
  remainingLabel: string;
}

export function getLeadExpiryInfo(listing: any, nowMs: number = Date.now()): LeadExpiryInfo {
  const broadcast = listing?.broadcast && typeof listing.broadcast === 'object' ? listing.broadcast : {};
  const broadcastStatus = String(
    broadcast.broadcastStatus ?? listing?.broadcastStatus ?? ''
  )
    .trim()
    .toLowerCase();
  const assignedTo = String(listing?.assignedTo ?? '').trim().toLowerCase();

  const isAssignedToYou = assignedTo === 'assigned to you';
  const isClosed =
    !isAssignedToYou &&
    (CLOSED_BROADCAST_STATUSES.has(broadcastStatus) || assignedTo === 'lead closed');

  if (isClosed) {
    return { isExpired: true, isClosed: true, remainingMs: 0, remainingLabel: 'Expired' };
  }

  // Prefer explicit expiresAt if provided; otherwise compute createdAt + expiresIn
  const explicitExpiresAtMs = toTimestampMs(broadcast.expiresAt ?? listing?.expiresAt);
  let expiryMs: number | null = explicitExpiresAtMs;

  if (expiryMs === null) {
    const createdMs = toTimestampMs(broadcast.createdAt ?? listing?.createdAt);
    if (createdMs !== null) {
      const durationMs = parseExpiresInMs(broadcast.expiresIn ?? listing?.expiresIn);
      expiryMs = createdMs + durationMs;
    }
  }

  if (expiryMs === null) {
    return {
      isExpired: false,
      isClosed: false,
      remainingMs: DEFAULT_LEAD_EXPIRY_MS,
      remainingLabel: String(broadcast.expiresIn ?? listing?.expiresIn ?? 'Expires soon'),
    };
  }

  const remainingMs = expiryMs - nowMs;
  if (remainingMs <= 0) {
    return { isExpired: true, isClosed: false, remainingMs: 0, remainingLabel: 'Expired' };
  }

  const totalMinutes = Math.floor(remainingMs / 60_000);
  const hrs = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  let remainingLabel: string;
  if (hrs >= 24) {
    remainingLabel = `Expires in ${Math.floor(hrs / 24)}d ${hrs % 24}h`;
  } else if (hrs > 0) {
    remainingLabel = `Expires in ${hrs}h ${mins}m`;
  } else {
    remainingLabel = `Expires in ${Math.max(1, mins)}m`;
  }

  return { isExpired: false, isClosed: false, remainingMs, remainingLabel };
}

/**
 * Splits raw broadcast listings into `newLeads` and `acquiredLeads` using the
 * exact same rules as Flutter's `LeadNotifier.fetchLeads` (`lead_provider.dart`).
 */
export function partitionBroadcastLeads(
  listings: any[],
  nowMs: number = Date.now()
): { newLeads: any[]; acquiredLeads: any[] } {
  const newLeads: any[] = [];
  const acquiredLeads: any[] = [];

  for (const listing of Array.isArray(listings) ? listings : []) {
    if (!listing || typeof listing !== 'object') continue;

    const assignedTo = String(listing.assignedTo ?? '').trim().toLowerCase();
    const response = String(listing.therapistResponse ?? '').trim().toLowerCase();

    if (assignedTo === 'assigned to you') {
      acquiredLeads.push(listing);
      continue;
    }

    // Never show passed/declined leads
    if (response === 'not interested' || response === 'passed' || response === 'rejected') {
      continue;
    }

    // Never show expired or closed leads in New Leads or Live Map
    const expiry = getLeadExpiryInfo(listing, nowMs);
    if (expiry.isExpired || expiry.isClosed) {
      continue;
    }

    // Open lead (no response yet) OR Interested waiting for admin assignment
    if (!response || response === 'interested') {
      newLeads.push(listing);
    }
  }

  const getSortTime = (item: any) =>
    toTimestampMs(item?.broadcast?.createdAt ?? item?.createdAt ?? item?.updatedAt) ?? 0;

  newLeads.sort((a, b) => getSortTime(b) - getSortTime(a));
  acquiredLeads.sort((a, b) => getSortTime(b) - getSortTime(a));

  return { newLeads, acquiredLeads };
}

export function formatBroadcastAddress(raw: unknown): string {
  if (!raw) return '';
  if (typeof raw === 'string') {
    const cleaned = raw.trim();
    return PLACEHOLDER_ADDRESSES.has(cleaned.toLowerCase()) ? '' : cleaned;
  }
  if (typeof raw === 'object') {
    const a = raw as Record<string, unknown>;
    const parts = [
      a.flatNo,
      a.buildingName,
      a.street,
      a.line1,
      a.addressLine1,
      a.addressLine2,
      a.area,
      a.locality,
      a.landMark ?? a.landmark,
      a.city,
      a.state,
      a.pinCode ?? a.pincode ?? a.zipCode,
    ]
      .map((p) => (p !== null && p !== undefined ? String(p).trim() : ''))
      .filter((p) => p && p.toUpperCase() !== 'NA' && p.toUpperCase() !== 'N/A');
    const joined = parts.join(', ');
    return PLACEHOLDER_ADDRESSES.has(joined.toLowerCase()) ? '' : joined;
  }
  return '';
}

export function isUsableMapQuery(address: string | undefined | null): boolean {
  if (!address) return false;
  const normalized = address.trim().toLowerCase();
  if (normalized.length < 3) return false;
  return !PLACEHOLDER_ADDRESSES.has(normalized);
}

/** Masks unaccepted patient name just like mobile (`Aks***` / `Rah***`). */
export function maskPatientName(fullName: string): string {
  const trimmed = fullName.trim();
  if (!trimmed || trimmed.toLowerCase() === 'patient') return 'Patient';
  if (trimmed.includes('***')) return trimmed;
  const firstWord = trimmed.split(/\s+/)[0] || trimmed;
  const visible = firstWord.slice(0, Math.min(3, firstWord.length));
  return `${visible}***`;
}

export interface LeadDisplayFields {
  id: string;
  broadcastId?: string;
  patientId?: string;
  fullName: string;
  displayName: string;
  age?: number | string;
  gender?: string;
  phone: string;
  condition: string;
  packageType: string;
  address: string;
  landmark: string;
  payoutAmount: number;
  distanceKm?: number;
  scheduledDate: string;
  scheduledTime: string;
  urgency?: string;
  isWaitingApproval: boolean;
  isAssignedToYou: boolean;
  expiry: LeadExpiryInfo;
}

export function extractLeadDisplayFields(
  listing: any,
  opts?: { maskName?: boolean; nowMs?: number }
): LeadDisplayFields {
  const b = listing?.broadcast && typeof listing.broadcast === 'object' ? listing.broadcast : {};
  const rawPatient = b.patient ?? listing?.patient ?? listing?.patientDetails;
  const patientObj = rawPatient && typeof rawPatient === 'object' ? rawPatient : null;

  const assignedTo = String(listing?.assignedTo ?? '').trim().toLowerCase();
  const response = String(listing?.therapistResponse ?? '').trim().toLowerCase();
  const isAssignedToYou = assignedTo === 'assigned to you';
  const isWaitingApproval = response === 'interested' && !isAssignedToYou;

  const patientId =
    patientObj?._id ||
    patientObj?.id ||
    (typeof b.patient === 'string' ? b.patient : undefined) ||
    (typeof listing?.patient === 'string' ? listing.patient : undefined) ||
    listing?.patientId ||
    undefined;

  const fullName =
    `${patientObj?.firstName || ''} ${patientObj?.lastName || ''}`.trim() ||
    patientObj?.fullName ||
    patientObj?.name ||
    b.patientName ||
    listing?.patientName ||
    'Patient';

  const shouldMask = Boolean(opts?.maskName) && !isAssignedToYou;
  const displayName = shouldMask ? maskPatientName(fullName) : fullName;

  const phone = isAssignedToYou
    ? String(patientObj?.phone || patientObj?.mobileNo || b.phone || listing?.phone || '').trim()
    : '';

  const rawConditions = Array.isArray(patientObj?.medicalConditions)
    ? patientObj.medicalConditions.filter(Boolean).join(', ')
    : '';

  const condition =
    String(
      b.condition ||
        listing?.condition ||
        b.medicalConcern ||
        listing?.diagnosis ||
        rawConditions ||
        b.notes ||
        ''
    ).trim() || 'Physiotherapy Inquiry';

  const serviceTypesList = Array.isArray(b.serviceTypes)
    ? b.serviceTypes.filter(Boolean).join(', ')
    : Array.isArray(listing?.serviceTypes)
      ? listing.serviceTypes.filter(Boolean).join(', ')
      : '';

  const packageType =
    String(
      b.packageType ||
        listing?.packageType ||
        b.packageName ||
        listing?.packageName ||
        serviceTypesList ||
        b.serviceType ||
        listing?.serviceType ||
        ''
    ).trim() || 'Home Physiotherapy';

  const address =
    formatBroadcastAddress(b.address) ||
    formatBroadcastAddress(patientObj?.address) ||
    formatBroadcastAddress(listing?.address) ||
    formatBroadcastAddress(
      [
        b.locality || listing?.locality,
        b.area || listing?.area,
        b.city || listing?.city || patientObj?.city,
        b.pincode || listing?.pincode,
      ]
        .filter(Boolean)
        .join(', ')
    );

  const landmark = String(
    b.landmark ||
      b.landMark ||
      patientObj?.address?.landMark ||
      patientObj?.address?.landmark ||
      ''
  ).trim();

  const payoutRaw =
    b.amountPerSession ??
    b.therapistPayout ??
    b.payoutAmount ??
    b.estimatedFee ??
    b.sessionFee ??
    listing?.amountPerSession ??
    listing?.payoutAmount ??
    listing?.sessionFee ??
    listing?.estimatedFee ??
    0;
  const payoutAmount = Number(payoutRaw) || 0;

  const distanceVal = Number(listing?.distanceKm ?? b.distanceKm);
  const distanceKm = Number.isFinite(distanceVal) && distanceVal > 0 ? distanceVal : undefined;

  const scheduledDate = String(
    b.preferredAppointmentDate || b.scheduledDate || listing?.scheduledDate || ''
  ).trim();
  const scheduledTime = String(
    b.preferredAppointmentTime || b.scheduledTime || listing?.scheduledTime || ''
  ).trim();

  return {
    id: String(listing?._id || listing?.id || ''),
    broadcastId: b._id ? String(b._id) : undefined,
    patientId: patientId ? String(patientId) : undefined,
    fullName,
    displayName,
    age: listing?.patientAge ?? listing?.age ?? b.patientAge ?? patientObj?.age,
    gender: listing?.patientGender ?? listing?.gender ?? b.patientGender ?? patientObj?.gender,
    phone,
    condition,
    packageType,
    address,
    landmark,
    payoutAmount,
    distanceKm,
    scheduledDate,
    scheduledTime,
    urgency: b.urgency || listing?.urgency || undefined,
    isWaitingApproval,
    isAssignedToYou,
    expiry: getLeadExpiryInfo(listing, opts?.nowMs),
  };
}
