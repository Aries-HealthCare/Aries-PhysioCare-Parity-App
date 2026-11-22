import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseExpiresInMs,
  getLeadExpiryInfo,
  partitionBroadcastLeads,
  extractLeadDisplayFields,
  isUsableMapQuery,
  maskPatientName,
} from './lead-filtering.ts';

const NOW = new Date('2026-11-22T12:00:00.000Z').getTime();

test('parseExpiresInMs parses hours, days, minutes, and defaults to 72h', () => {
  assert.equal(parseExpiresInMs('4 hours'), 4 * 3600 * 1000);
  assert.equal(parseExpiresInMs('2 days'), 48 * 3600 * 1000);
  assert.equal(parseExpiresInMs('30m'), 30 * 60 * 1000);
  assert.equal(parseExpiresInMs(undefined), 72 * 3600 * 1000);
});

test('partitionBroadcastLeads excludes expired, closed, and passed leads', () => {
  const expiredLead = {
    _id: 'expired-1',
    therapistResponse: null,
    assignedTo: '',
    broadcast: {
      createdAt: '2026-11-10T10:00:00.000Z',
      expiresIn: '72 hours',
      broadcastStatus: 'Open',
    },
  };
  const closedLead = {
    _id: 'closed-1',
    therapistResponse: null,
    assignedTo: 'Lead Closed',
    broadcast: {
      createdAt: '2026-11-22T10:00:00.000Z',
      expiresIn: '72 hours',
      broadcastStatus: 'Closed',
    },
  };
  const passedLead = {
    _id: 'passed-1',
    therapistResponse: 'Not Interested',
    assignedTo: '',
    broadcast: {
      createdAt: '2026-11-22T10:00:00.000Z',
      expiresIn: '72 hours',
    },
  };
  const openFreshLead = {
    _id: 'fresh-1',
    therapistResponse: null,
    assignedTo: '',
    broadcast: {
      createdAt: '2026-11-22T10:00:00.000Z',
      expiresIn: '24 hours',
      condition: 'ACL Rehab',
      amountPerSession: 750,
    },
  };
  const waitingApprovalLead = {
    _id: 'waiting-1',
    therapistResponse: 'Interested',
    assignedTo: 'Pending Approval',
    broadcast: {
      createdAt: '2026-11-22T11:00:00.000Z',
      expiresIn: '24 hours',
    },
  };
  const assignedLead = {
    _id: 'assigned-1',
    therapistResponse: 'Interested',
    assignedTo: 'Assigned To You',
    broadcast: {
      createdAt: '2026-11-01T10:00:00.000Z',
      expiresIn: '24 hours',
      broadcastStatus: 'Closed',
    },
  };

  const result = partitionBroadcastLeads(
    [expiredLead, closedLead, passedLead, openFreshLead, waitingApprovalLead, assignedLead],
    NOW
  );

  assert.deepEqual(
    result.newLeads.map((l) => l._id),
    ['waiting-1', 'fresh-1']
  );
  assert.deepEqual(
    result.acquiredLeads.map((l) => l._id),
    ['assigned-1']
  );
});

test('extractLeadDisplayFields unwraps nested broadcast.* and masks unaccepted patient names', () => {
  const listing = {
    _id: 'l-1',
    therapistResponse: 'Interested',
    assignedTo: 'Pending',
    broadcast: {
      _id: 'b-1',
      createdAt: '2026-11-22T09:00:00.000Z',
      expiresIn: '12 hours',
      condition: 'Knee Osteoarthritis',
      amountPerSession: 850,
      serviceTypes: ['Home Visit', 'Electrotherapy'],
      preferredAppointmentDate: '2026-11-23',
      preferredAppointmentTime: '10:00 AM',
      patient: {
        _id: 'p-1',
        firstName: 'Akshay',
        lastName: 'Patel',
        phone: '9876543210',
        address: {
          street: 'Sai Sadan CHS',
          city: 'Mumbai',
          state: 'Maharashtra',
          pinCode: '400067',
          landMark: 'Near Metro',
        },
      },
    },
  };

  const fields = extractLeadDisplayFields(listing, { maskName: true, nowMs: NOW });
  assert.equal(fields.displayName, 'Aks***');
  assert.equal(fields.phone, '');
  assert.equal(fields.condition, 'Knee Osteoarthritis');
  assert.equal(fields.packageType, 'Home Visit, Electrotherapy');
  assert.equal(fields.payoutAmount, 850);
  assert.equal(fields.isWaitingApproval, true);
  assert.equal(fields.expiry.isExpired, false);
  assert.equal(fields.expiry.remainingLabel, 'Expires in 9h 0m');
  assert.match(fields.address, /Mumbai/);
  assert.equal(fields.landmark, 'Near Metro');
});

test('isUsableMapQuery rejects placeholder strings so Google Maps never geocodes garbage', () => {
  assert.equal(isUsableMapQuery('Area details on lead card'), false);
  assert.equal(isUsableMapQuery('Address pending'), false);
  assert.equal(isUsableMapQuery('Nearby Patient Lead'), false);
  assert.equal(isUsableMapQuery('—'), false);
  assert.equal(isUsableMapQuery('Kandivali West, Mumbai, 400067'), true);
});

test('maskPatientName masks names predictably', () => {
  assert.equal(maskPatientName('Rahul Sharma'), 'Rah***');
  assert.equal(maskPatientName('Patient'), 'Patient');
  assert.equal(getLeadExpiryInfo({ broadcast: { createdAt: '2026-11-20T00:00:00Z', expiresIn: '12h' } }, NOW).isExpired, true);
});
