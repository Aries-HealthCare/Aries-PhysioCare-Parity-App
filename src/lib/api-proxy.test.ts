import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildUpstreamHeaders } from './api-proxy-headers.ts';

test('buildUpstreamHeaders strips browser CORS/fetch headers while keeping auth and content-type', () => {
  const incoming = new Headers({
    host: 'app.ariesphysiocare.in',
    origin: 'https://app.ariesphysiocare.in',
    referer: 'https://app.ariesphysiocare.in/login',
    'sec-fetch-site': 'same-origin',
    'sec-fetch-mode': 'cors',
    cookie: 'ax_expert_session=secret',
    'content-type': 'application/json',
    accept: 'application/json',
  });

  const out = buildUpstreamHeaders(incoming, 'session-jwt-token');
  assert.equal(out.origin, undefined);
  assert.equal(out.referer, undefined);
  assert.equal(out['sec-fetch-site'], undefined);
  assert.equal(out['sec-fetch-mode'], undefined);
  assert.equal(out.host, undefined);
  assert.equal(out.cookie, undefined);
  assert.equal(out['content-type'], 'application/json');
  assert.equal(out.accept, 'application/json');
  assert.equal(out.Authorization, 'Bearer session-jwt-token');
});

test('buildUpstreamHeaders preserves explicit Authorization header over session cookie', () => {
  const out = buildUpstreamHeaders(
    {
      Authorization: 'Bearer explicit-token',
      Origin: 'https://app.ariesphysiocare.in',
    },
    'cookie-token'
  );

  assert.equal(out.Authorization, 'Bearer explicit-token');
  assert.equal(out.Origin, undefined);
});
