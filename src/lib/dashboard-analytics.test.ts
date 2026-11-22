import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  aggregateMissedLeadReasons,
  aggregateVisitTrends,
  computeTargetMetrics,
  haversineDistanceKm,
  isDynamicQuestionVisible,
} from './dashboard-analytics.ts';

test('computeTargetMetrics calculates progress, remaining, pace, visitsNeeded, and milestones', () => {
  // Nov 2026 has 30 days. On Nov 21, remaining days including today = 10.
  const now = new Date(2026, 10, 21, 10, 0, 0);
  const metrics = computeTargetMetrics({
    target: 40000,
    achieved: 22000,
    now,
    avgSessionFee: 1000,
  });

  assert.equal(metrics.progressPct, 55);
  assert.equal(metrics.remainingAmount, 18000);
  assert.equal(metrics.daysRemaining, 10);
  assert.equal(metrics.dailyTarget, 1800);
  assert.equal(metrics.visitsNeeded, 18);
  assert.deepEqual(metrics.milestones, [
    { pct: 25, amount: 10000, reached: true },
    { pct: 50, amount: 20000, reached: true },
    { pct: 75, amount: 30000, reached: false },
    { pct: 100, amount: 40000, reached: false },
  ]);

  // Over-achieved clamps progressPct to 100 and remainingAmount to 0, daysRemaining >= 1 on last day
  const lastDay = new Date(2026, 10, 30, 23, 0, 0);
  const exceeded = computeTargetMetrics({
    target: 20000,
    achieved: 25000,
    now: lastDay,
    avgSessionFee: 800,
  });
  assert.equal(exceeded.progressPct, 100);
  assert.equal(exceeded.remainingAmount, 0);
  assert.equal(exceeded.daysRemaining, 1);
  assert.equal(exceeded.dailyTarget, 0);
  assert.equal(exceeded.visitsNeeded, 0);
  assert.equal(exceeded.milestones.every((m) => m.reached), true);
});

test('aggregateVisitTrends produces today, week (Mon-Sun), and month (W1-W5) series and summaries', () => {
  // Sunday, Nov 22, 2026 (same week: Mon Nov 16 .. Sun Nov 22)
  const now = new Date(2026, 10, 22, 14, 0, 0);
  const appointments = [
    { _id: 'a1', appointmentDate: '2026-11-22', appointmentTime: '09:30 AM', status: 'Completed' },
    { _id: 'a2', appointmentDate: '2026-11-22', appointmentTime: '02:00 PM', status: 'Confirmed' },
    { _id: 'a3', appointmentDate: '2026-11-22', appointmentTime: '06:30 PM', status: 'Completed' },
    { _id: 'a4', appointmentDate: '2026-11-16', appointmentTime: '10:00 AM', status: 'Completed' }, // Mon of current week
    { _id: 'a5', appointmentDate: '2026-11-03', appointmentTime: '11:00 AM', status: 'Completed' }, // W1 of Nov
    { _id: 'a6', appointmentDate: '2026-11-29', appointmentTime: '11:00 AM', status: 'Pending' }, // W5 of Nov
    { _id: 'a7', appointmentDate: '2026-10-15', appointmentTime: '11:00 AM', status: 'Completed' }, // previous month
  ];

  const todayRes = aggregateVisitTrends(appointments, 'today', now);
  assert.equal(todayRes.summary.total, 3);
  assert.equal(todayRes.summary.completed, 2);
  assert.equal(todayRes.summary.pending, 1);
  assert.equal(todayRes.summary.completionRate, 67);
  assert.equal(todayRes.filteredAppointments.length, 3);
  assert.deepEqual(
    todayRes.series.map((s) => s.label),
    ['Morning', 'Afternoon', 'Evening']
  );
  assert.equal(todayRes.series[0].completed, 1);
  assert.equal(todayRes.series[1].total, 1);
  assert.equal(todayRes.series[1].completed, 0);
  assert.equal(todayRes.series[2].completed, 1);

  const weekRes = aggregateVisitTrends(appointments, 'week', now);
  assert.deepEqual(
    weekRes.series.map((s) => s.label),
    ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  );
  assert.equal(weekRes.summary.total, 4);
  assert.equal(weekRes.summary.completed, 3);
  assert.equal(weekRes.series[0].total, 1); // Mon
  assert.equal(weekRes.series[6].total, 3); // Sun

  const monthRes = aggregateVisitTrends(appointments, 'month', now);
  assert.deepEqual(
    monthRes.series.map((s) => s.label),
    ['W1', 'W2', 'W3', 'W4', 'W5']
  );
  assert.equal(monthRes.summary.total, 6);
  assert.equal(monthRes.summary.completed, 4);
  assert.equal(monthRes.series[0].total, 1); // Nov 3 -> W1
  assert.equal(monthRes.series[2].total, 1); // Nov 16 -> W3 (15-21)
  assert.equal(monthRes.series[3].total, 3); // Nov 22 -> W4 (22-28)
  assert.equal(monthRes.series[4].total, 1); // Nov 29 -> W5 (29-31)

  // Canonical appointmentStatus takes precedence over status and invalid rolled-over dates are ignored
  const canonicalRes = aggregateVisitTrends(
    [
      { _id: 'c1', appointmentDate: '2026-11-22', appointmentTime: '09:00 AM', appointmentStatus: 'Completed' },
      { _id: 'c2', appointmentDate: '2026-02-31', appointmentTime: '09:00 AM', appointmentStatus: 'Completed' },
      { _id: 'c3', appointmentDate: '31/02/2026', appointmentTime: '09:00 AM', appointmentStatus: 'Completed' },
    ],
    'today',
    now
  );
  assert.equal(canonicalRes.summary.total, 1);
  assert.equal(canonicalRes.summary.completed, 1);
  assert.equal(canonicalRes.summary.completionRate, 100);

  // Rolled-over Feb 31 must never appear in March
  const marchNow = new Date(2026, 2, 3, 10, 0, 0);
  const marchRes = aggregateVisitTrends(
    [
      { _id: 'bad1', appointmentDate: '2026-02-31', appointmentStatus: 'Completed' },
      { _id: 'bad2', appointmentDate: '31/02/2026', appointmentStatus: 'Completed' },
    ],
    'month',
    marchNow
  );
  assert.equal(marchRes.summary.total, 0);
});

test('aggregateMissedLeadReasons partitions recovered vs missed, sums potentialLoss, and ranks reasons', () => {
  const rows = [
    { _id: '1', isRecover: true, broadcast: { estimatedFee: 1000 }, remark: 'Too far' },
    { _id: '2', isRecover: false, broadcast: { estimatedFee: 800 }, notIntrestedRemark: 'Out of zone', remark: 'Fallback remark' },
    { _id: '3', broadcast: { sessionFee: 900 }, reason: 'Too far' },
    { _id: '4', estimatedFee: 700, therapistResponse: 'Not Available' },
    { _id: '5', broadcast: { estimatedFee: 600 } }, // defaults to 'No Response'
    { _id: '6', broadcast: { estimatedFee: 500 }, notIntrestedRemark: 'Out of zone' },
  ];

  const stats = aggregateMissedLeadReasons(rows);
  assert.equal(stats.recovered.length, 1);
  assert.equal(stats.missed.length, 5);
  assert.equal(stats.totalMissed, 5);
  assert.equal(stats.recoverableCount, 5);
  assert.equal(stats.potentialLoss, 3500);
  assert.equal(stats.recoveryRate, 17);
  assert.equal(stats.reasons[0].reason, 'Out of zone');
  assert.equal(stats.reasons[0].count, 2);
  assert.equal(stats.reasons[0].pct, 40);
  assert.ok(stats.reasons.every((r) => typeof r.color === 'string' && r.color.length > 0));

  const empty = aggregateMissedLeadReasons([]);
  assert.equal(empty.totalMissed, 0);
  assert.equal(empty.recoveryRate, 0);
  assert.equal(empty.potentialLoss, 0);
  assert.deepEqual(empty.reasons, []);
});

test('isDynamicQuestionVisible evaluates scalar, boolean, multipleChoice array, and array visibilityValue', () => {
  // Always visible when no parentFieldId or nullish visibilityValue
  assert.equal(isDynamicQuestionVisible({}, {}), true);
  assert.equal(isDynamicQuestionVisible({ parentFieldId: 'q1', visibilityValue: undefined }, {}), true);
  assert.equal(isDynamicQuestionVisible({ parentFieldId: 'q1', visibilityValue: null }, {}), true);

  // Scalar string match
  assert.equal(
    isDynamicQuestionVisible({ parentFieldId: 'q1', visibilityValue: 'Severe' }, { q1: 'Severe' }),
    true
  );
  assert.equal(
    isDynamicQuestionVisible({ parentFieldId: 'q1', visibilityValue: 'Severe' }, { q1: 'Mild' }),
    false
  );

  // Boolean parent value matching boolean and yes/no/true/false case-insensitively
  assert.equal(
    isDynamicQuestionVisible({ parentFieldId: 'q2', visibilityValue: 'Yes' }, { q2: true }),
    true
  );
  assert.equal(
    isDynamicQuestionVisible({ parentFieldId: 'q2', visibilityValue: 'true' }, { q2: true }),
    true
  );
  assert.equal(
    isDynamicQuestionVisible({ parentFieldId: 'q2', visibilityValue: true }, { q2: true }),
    true
  );
  assert.equal(
    isDynamicQuestionVisible({ parentFieldId: 'q2', visibilityValue: 'no' }, { q2: false }),
    true
  );
  assert.equal(
    isDynamicQuestionVisible({ parentFieldId: 'q2', visibilityValue: 'Yes' }, { q2: false }),
    false
  );

  // Array parent value (multipleChoice)
  assert.equal(
    isDynamicQuestionVisible(
      { parentFieldId: 'q3', visibilityValue: 'Knee' },
      { q3: ['Hip', 'Knee'] }
    ),
    true
  );
  assert.equal(
    isDynamicQuestionVisible(
      { parentFieldId: 'q3', visibilityValue: 'Shoulder' },
      { q3: ['Hip', 'Knee'] }
    ),
    false
  );

  // Array visibilityValue with scalar and array parent values
  assert.equal(
    isDynamicQuestionVisible(
      { parentFieldId: 'q4', visibilityValue: ['Moderate', 'Severe'] },
      { q4: 'Severe' }
    ),
    true
  );
  assert.equal(
    isDynamicQuestionVisible(
      { parentFieldId: 'q4', visibilityValue: ['Moderate', 'Severe'] },
      { q4: ['Mild', 'Moderate'] }
    ),
    true
  );
  assert.equal(
    isDynamicQuestionVisible(
      { parentFieldId: 'q4', visibilityValue: ['Moderate', 'Severe'] },
      { q4: 'Mild' }
    ),
    false
  );

  // Missing parent answer hides dependent question
  assert.equal(
    isDynamicQuestionVisible({ parentFieldId: 'q1', visibilityValue: 'Yes' }, {}),
    false
  );
});

test('haversineDistanceKm calculates accurate distances in km', () => {
  // Identical coordinates -> 0 km
  assert.equal(haversineDistanceKm(28.6139, 77.209, 28.6139, 77.209), 0);

  // 1 degree latitude along meridian ~ 111.2 km
  const oneDegLat = haversineDistanceKm(0, 0, 1, 0);
  assert.ok(oneDegLat >= 111 && oneDegLat <= 111.4, `Expected ~111.2 km, got ${oneDegLat}`);

  // New Delhi to Mumbai ~ 1148 km
  const delToBom = haversineDistanceKm(28.6139, 77.209, 19.076, 72.8777);
  assert.ok(delToBom >= 1135 && delToBom <= 1160, `Expected ~1148 km, got ${delToBom}`);

  // Antipodal coordinates stay finite (~20015.1 km) without NaN from floating-point overshoot
  const antipodal = haversineDistanceKm(0, 0, 0, 180);
  assert.ok(Number.isFinite(antipodal) && antipodal > 20000 && antipodal < 20030, `Got ${antipodal}`);
});
