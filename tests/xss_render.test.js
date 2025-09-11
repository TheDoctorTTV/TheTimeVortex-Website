import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';

const script = readFileSync(new URL('../public/auth.js', import.meta.url), 'utf8');

test('malicious username rendered as text', async () => {
  const dom = new JSDOM(`<!DOCTYPE html><div id="auth-container"></div>`, { runScripts: 'dangerously' });
  dom.window.fetch = async () => ({
    ok: true,
    json: async () => ({ id: '1', username: '<script>alert(1)</script>' })
  });
  dom.window.eval(script);
  dom.window.document.dispatchEvent(new dom.window.Event('DOMContentLoaded'));
  await new Promise(r => dom.window.setTimeout(r, 0));
  await new Promise(r => dom.window.setTimeout(r, 0));
  const container = dom.window.document.getElementById('auth-container');
  assert(container.textContent.includes('<script>alert(1)</script>'));
  assert.strictEqual(container.querySelector('script'), null);
});
