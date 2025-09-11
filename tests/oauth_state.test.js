import test from 'node:test';
import assert from 'node:assert/strict';
import { onRequestGet } from '../functions/callback.js';
import { COOKIE_STATE } from '../functions/_utils.js';

test('oauth state mismatch rejected', async () => {
  const request = new Request('https://example.com/callback?code=abc&state=bad', {
    headers: { cookie: `${COOKIE_STATE}=good` }
  });
  const res = await onRequestGet({ request, env: { SESSION_SECRET: 's' } });
  assert.equal(res.status, 400);
  const setCookie = res.headers.get('Set-Cookie') || '';
  assert(!/ttv_sess/.test(setCookie));
});
