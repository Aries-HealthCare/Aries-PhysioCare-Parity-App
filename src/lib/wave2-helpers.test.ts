import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  buildDigitalIdPattern,
  buildTransactionsCsv,
  classifyLedgerCategory,
  computePermissionHealth,
  extractFaqCategories,
  filterEarningsLedger,
  normalizeSupportTicketPriority,
  normalizeSupportTicketStatus,
} from './wave2-helpers.ts';

test('filterEarningsLedger filters by category, type, date range, and search while computing totals', () => {
  const now = new Date(2026, 10, 22, 12, 0, 0);
  const txs = [
    { _id: '1', type: 'CREDIT', category: 'VISIT_EARNING', amount: 720, description: 'Doorstep knee visit', status: 'SUCCESS', createdAt: '2026-11-20T10:00:00Z' },
    { _id: '2', type: 'CREDIT', category: 'REFERRAL_BONUS', amount: 1000, description: 'Colleague referral bonus', status: 'SUCCESS', createdAt: '2026-11-18T10:00:00Z' },
    { _id: '3', type: 'DEBIT', category: 'WITHDRAWAL', amount: 500, description: 'IMPS bank payout', status: 'SUCCESS', createdAt: '2026-10-05T10:00:00Z' },
  ];

  assert.equal(classifyLedgerCategory('VISIT_EARNING', 'CREDIT'), 'visits');
  assert.equal(classifyLedgerCategory('REFERRAL_BONUS', 'CREDIT'), 'bonuses');
  assert.equal(classifyLedgerCategory('WITHDRAWAL', 'DEBIT'), 'withdrawals');

  const all = filterEarningsLedger(txs, { now });
  assert.equal(all.items.length, 3);
  assert.equal(all.totalCredits, 1720);
  assert.equal(all.totalDebits, 500);
  assert.equal(all.netAmount, 1220);

  const bonuses = filterEarningsLedger(txs, { category: 'bonuses', now });
  assert.equal(bonuses.items.length, 1);
  assert.equal(bonuses.totalCredits, 1000);

  const monthOnly = filterEarningsLedger(txs, { range: 'month', now });
  assert.equal(monthOnly.items.length, 2);

  const searched = filterEarningsLedger(txs, { search: 'knee', now });
  assert.equal(searched.items.length, 1);
  assert.equal(searched.items[0]._id, '1');
});

test('buildTransactionsCsv escapes quotes/commas and neutralizes spreadsheet formula injection', () => {
  const csv = buildTransactionsCsv([
    {
      _id: 'tx1',
      type: 'CREDIT',
      category: 'VISIT_EARNING',
      description: '=CMD("evil"), "quoted"',
      amount: 720,
      status: 'SUCCESS',
      createdAt: '2026-11-20T10:00:00Z',
    },
  ]);
  const lines = csv.split('\n');
  assert.equal(lines.length, 2);
  assert.ok(lines[1].includes(`"'=CMD(""evil""), ""quoted"""`));
});

test('computePermissionHealth calculates percentage excluding unsupported capabilities', () => {
  const full = computePermissionHealth({
    geolocation: 'granted',
    notifications: 'granted',
    camera: 'granted',
    microphone: 'unsupported',
  });
  assert.equal(full.score, 100);
  assert.equal(full.grantedCount, 3);
  assert.equal(full.totalSupported, 3);
  assert.equal(full.statusLabel, 'Optimal');

  const partial = computePermissionHealth({
    geolocation: 'granted',
    notifications: 'denied',
    camera: 'prompt',
    microphone: 'denied',
  });
  assert.equal(partial.score, 25);
  assert.equal(partial.statusLabel, 'Action Required');
});

test('ticket normalization and FAQ category extraction behave consistently', () => {
  assert.equal(normalizeSupportTicketStatus('Closed'), 'resolved');
  assert.equal(normalizeSupportTicketStatus('In Progress'), 'pending');
  assert.equal(normalizeSupportTicketStatus('New'), 'open');
  assert.equal(normalizeSupportTicketPriority('CRITICAL'), 'urgent');
  assert.equal(normalizeSupportTicketPriority('high'), 'high');
  assert.equal(normalizeSupportTicketPriority(''), 'medium');

  const cats = extractFaqCategories([
    { category: 'payments' },
    { category: 'Payments' },
    { category: 'clinical' },
    {},
  ]);
  assert.deepEqual(cats, ['Payments', 'Clinical', 'General']);
});

test('buildDigitalIdPattern returns deterministic 21x21 finder matrix', () => {
  const p1 = buildDigitalIdPattern('AX-IND-4201');
  const p2 = buildDigitalIdPattern('AX-IND-4201');
  assert.equal(p1.length, 21);
  assert.equal(p1[0].length, 21);
  assert.deepEqual(p1, p2);
  assert.equal(p1[0][0], true);
  assert.equal(p1[0][20], true);
  assert.equal(p1[20][0], true);
});
