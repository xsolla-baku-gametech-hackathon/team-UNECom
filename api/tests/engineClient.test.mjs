import { test } from 'node:test';
import assert from 'node:assert/strict';
import { engineClient, EngineError } from '../dist/clients/engineClient.js';
import { config } from '../dist/config.js';

test('engine response status and timeouts remain distinguishable', async () => {
  const originalFetch = globalThis.fetch;
  const originalTimeout = config.engineExplainTimeoutMs;
  try {
    for (const status of [404, 422]) {
      globalThis.fetch = async () => new Response('{}', { status });
      await assert.rejects(engineClient.explain('missing', 'analysis'), e => e instanceof EngineError && e.statusCode === status);
    }
    globalThis.fetch = async () => { throw new TypeError('connection refused'); };
    await assert.rejects(engineClient.analyze([]), e => e.statusCode === 502);
    config.engineExplainTimeoutMs = 10;
    // The timeout must include reading the response body, not just headers.
    globalThis.fetch = async (_url, { signal }) => ({
      ok: true,
      json: () => new Promise((_resolve, reject) => {
        signal.addEventListener('abort', () => reject(new Error('aborted')), { once: true });
      }),
    });
    await assert.rejects(engineClient.explain('ring_1', 'analysis'), e => e.statusCode === 504);
  } finally {
    globalThis.fetch = originalFetch;
    config.engineExplainTimeoutMs = originalTimeout;
  }
});
