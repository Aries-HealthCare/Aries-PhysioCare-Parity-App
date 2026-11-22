import test from 'node:test';
import assert from 'node:assert/strict';
import { parseSsoHash } from './sso-handoff.ts';

const EXPERT_ID = '507f1f77bcf86cd799439011';
const makeJwt = (payload: Record<string, unknown>) => {
  const h = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const p = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${h}.${p}.sig_placeholder_123456`;
};

test('parseSsoHash extracts valid sso_token and expert_id from hash fragment', () => {
  const token = makeJwt({ id: EXPERT_ID });
  const parsed = parseSsoHash(
    `#sso_token=${encodeURIComponent(token)}&expert_id=${EXPERT_ID}&target=dashboard`,
  );
  assert.deepEqual(parsed, { token, expertId: EXPERT_ID });
});

test('parseSsoHash recovers expertId from JWT therapistProfileId claim when expert_id is omitted', () => {
  const token = makeJwt({ therapistProfileId: EXPERT_ID });
  const parsed = parseSsoHash(`#sso_token=${encodeURIComponent(token)}`);
  assert.deepEqual(parsed, { token, expertId: EXPERT_ID });
});

test('parseSsoHash rejects missing, short, or non-JWT tokens', () => {
  assert.equal(parseSsoHash(''), null);
  assert.equal(parseSsoHash('#section-top'), null);
  assert.equal(parseSsoHash(`#sso_token=short&expert_id=${EXPERT_ID}`), null);
  assert.equal(
    parseSsoHash(`#sso_token=not_a_three_part_jwt_token_value&expert_id=${EXPERT_ID}`),
    null,
  );
});
