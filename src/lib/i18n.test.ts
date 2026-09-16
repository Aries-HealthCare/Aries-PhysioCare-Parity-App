import assert from 'node:assert/strict';
import { test } from 'node:test';
import { navLabel, t } from './i18n.ts';

test('english nav labels stay readable', () => {
  assert.equal(navLabel('/app', 'Dashboard', 'en'), 'Dashboard');
  assert.equal(t('common.retry', 'en'), 'Retry');
});

test('hindi dictionary covers core workstation labels', () => {
  assert.equal(navLabel('/app/leads', 'Leads', 'hi'), 'लीड्स');
});
