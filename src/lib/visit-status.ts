/**
 * Visit / appointment status mapping shared by web UI.
 * Authoritative transitions live on ariesxpert-backend. This only normalises display.
 */

export const VISIT_FLOW = [
  'idle',
  'movingToPatient',
  'reached',
  'startingTreatment',
  'inProgress',
  'formSubmitted',
  'awaitingPayment',
  'paymentPending',
  'completed',
] as const;

export type VisitFlowState = (typeof VISIT_FLOW)[number];

export function normalizeAppointmentStatus(raw?: string | null): string {
  const value = (raw || 'pending').toString().trim().toLowerCase().replace(/[\s-]+/g, '_');
  if (value === 'rescheduled' || value === 're_scheduled') return 'rescheduled';
  if (value === 'inprogress' || value === 'in_progress') return 'in_progress';
  if (value === 'noshow' || value === 'no_show' || value === 'missed') return 'missed';
  return value;
}

export function visitFlowFromAppointment(status?: string | null, arrivalValidated?: boolean): VisitFlowState {
  const normalized = normalizeAppointmentStatus(status);
  if (normalized === 'completed') return 'completed';
  if (normalized === 'cancelled') return 'idle';
  if (normalized === 'in_progress') {
    return arrivalValidated ? 'inProgress' : 'movingToPatient';
  }
  if (normalized === 'confirmed' || normalized === 'scheduled' || normalized === 'rescheduled') {
    return arrivalValidated ? 'reached' : 'idle';
  }
  return 'idle';
}

export function canValidateArrival(state: VisitFlowState): boolean {
  return state === 'idle' || state === 'movingToPatient';
}

export function canBeginTreatment(state: VisitFlowState): boolean {
  return state === 'reached' || state === 'startingTreatment';
}

export function canSubmitAssessment(state: VisitFlowState): boolean {
  return state === 'inProgress' || state === 'startingTreatment';
}

export function canFinalize(state: VisitFlowState): boolean {
  return state === 'formSubmitted' || state === 'awaitingPayment' || state === 'paymentPending';
}
