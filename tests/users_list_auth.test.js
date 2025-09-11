import test from 'node:test';
import assert from 'node:assert/strict';
import { onRequestGet } from '../functions/users/list.js';
import { createSession, COOKIE_SESSION } from '../functions/_utils.js';

const stubDb = {
  prepare() {
    return {
      bind() { return this; },
      first: async () => null,
      all: async () => ({ results: [] })
    };
  }
};

const env = { DB: stubDb, SESSION_SECRET: 'secret' };

test('unauthenticated users/list requires auth', async () => {
  const request = new Request('https://example.com/users/list');
  const res = await onRequestGet({ request, env });
  assert.equal(res.status, 401);
});

test('non-admin users/list forbidden', async () => {
  const token = await createSession({ id: '123', username: 'u' }, env.SESSION_SECRET);
  const request = new Request('https://example.com/users/list', {
    headers: { cookie: `${COOKIE_SESSION}=${token}` }
  });
  const res = await onRequestGet({ request, env });
  assert.equal(res.status, 403);
});
