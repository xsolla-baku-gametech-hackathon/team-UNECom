import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EngineError } from '../dist/clients/engineClient.js';
import { engineErrorBody, sendEngineError } from '../dist/routes/engineErrors.js';

test('engine failures map to stable error codes by upstream status', () => {
  assert.deepEqual(engineErrorBody(new EngineError('engine request timed out', undefined, 504)), { error: 'engine_timeout', message: 'engine request timed out' });
  assert.deepEqual(engineErrorBody(new EngineError('failed to reach engine service', undefined, 502)), { error: 'engine_unreachable', message: 'failed to reach engine service' });
  assert.deepEqual(engineErrorBody(new EngineError('ring not found', undefined, 404)), { error: 'not_found', message: 'ring not found' });
  assert.deepEqual(engineErrorBody(new EngineError('engine responded with 422', undefined, 422)), { error: 'engine_request_failed', message: 'engine responded with 422' });
});

test('sendEngineError writes the status and body, and rethrows anything else', () => {
  const sent = [];
  const reply = { status(code) { sent.push(code); return this; }, send(body) { sent.push(body); return this; } };
  sendEngineError(reply, new EngineError('x', undefined, 502));
  assert.deepEqual(sent, [502, { error: 'engine_unreachable', message: 'x' }]);
  assert.throws(() => sendEngineError(reply, new TypeError('boom')), TypeError);
});
