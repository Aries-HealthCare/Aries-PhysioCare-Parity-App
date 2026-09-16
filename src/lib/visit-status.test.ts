import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  canBeginTreatment,
  canFinalize,
  canSubmitAssessment,
  canValidateArrival,
  normalizeAppointmentStatus,
  visitFlowFromAppointment,
} from './visit-status.ts';

test('normalizes appointment statuses from mobile and admin enums', () => {
  assert.equal(normalizeAppointmentStatus('InProgress'), 'in_progress');
  assert.equal(normalizeAppointmentStatus('ReScheduled'), 'rescheduled');
  assert.equal(normalizeAppointmentStatus('NoShow'), 'missed');
});

test('maps appointment records onto the visit flow', () => {
  assert.equal(visitFlowFromAppointment('Completed'), 'completed');
  assert.equal(visitFlowFromAppointment('InProgress', false), 'movingToPatient');
  assert.equal(visitFlowFromAppointment('Confirmed', true), 'reached');
});

test('visit transitions stay conservative', () => {
  assert.equal(canValidateArrival('idle'), true);
  assert.equal(canBeginTreatment('reached'), true);
  assert.equal(canSubmitAssessment('inProgress'), true);
  assert.equal(canFinalize('awaitingPayment'), true);
  assert.equal(canFinalize('idle'), false);
});
