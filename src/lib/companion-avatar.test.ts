import test from 'node:test';
import assert from 'node:assert/strict';
import {
  resolveCompanionAvatarId,
  resolveCompanionIdentity,
} from './companion-avatar.ts';

test('male user gets Tanya with official /avatars/tanya.png portrait', () => {
  assert.equal(resolveCompanionAvatarId('male'), 'tanya');
  const id = resolveCompanionIdentity('male');
  assert.equal(id.defaultName, 'Tanya');
  assert.equal(id.displayName, 'Tanya');
  assert.equal(id.portraitUrl, '/avatars/tanya.png');
});

test('female user gets Rivan with official /avatars/rivan.png portrait', () => {
  assert.equal(resolveCompanionAvatarId('Female'), 'rivan');
  const id = resolveCompanionIdentity('female', { aiCustomName: 'Dr. Rivan' });
  assert.equal(id.defaultName, 'Rivan');
  assert.equal(id.displayName, 'Dr. Rivan');
  assert.equal(id.portraitUrl, '/avatars/rivan.png');
});

test('never falls back to gaming avatar_f1/avatar_m1 and only honors matching HTTPS portrait', () => {
  const wrongGenderOverride = resolveCompanionIdentity('male', {
    portraitUrl: 'https://cdn.ariesxpert.com/avatars/rivan/v2.png',
  });
  assert.equal(wrongGenderOverride.portraitUrl, '/avatars/tanya.png');

  const matchingOverride = resolveCompanionIdentity('male', {
    portraitUrl: 'https://cdn.ariesxpert.com/avatars/tanya/v2.png',
  });
  assert.equal(matchingOverride.portraitUrl, 'https://cdn.ariesxpert.com/avatars/tanya/v2.png');
});
