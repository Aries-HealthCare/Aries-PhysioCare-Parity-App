import assert from 'node:assert/strict';
import { test } from 'node:test';
import { unwrap, unwrapList } from '../lib/api-envelope.ts';

test('unwrap prefers result then data', () => {
  assert.deepEqual(unwrap({ result: { id: '1' }, data: { id: '2' } }), { id: '1' });
  assert.deepEqual(unwrap({ data: [1] }), [1]);
});

test('unwrapList reads common envelope keys', () => {
  assert.deepEqual(unwrapList({ result: { items: [{ a: 1 }] } }, 'items'), [{ a: 1 }]);
  assert.deepEqual(unwrapList({ data: [1, 2] }), [1, 2]);
  assert.deepEqual(unwrapList(null), []);
});
