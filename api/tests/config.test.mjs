import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readNumber } from '../dist/config.js';

test('readNumber falls back when the variable is unset or blank', () => {
  assert.equal(readNumber('X', 5000, {}), 5000);
  assert.equal(readNumber('X', 5000, { X: '' }), 5000);
  assert.equal(readNumber('X', 5000, { X: '  ' }), 5000);
});

test('readNumber parses a valid value', () => {
  assert.equal(readNumber('X', 1, { X: '30000' }), 30000);
  assert.equal(readNumber('X', 1, { X: '0' }), 0);
});

test('readNumber refuses values that would silently become NaN or negative timeouts', () => {
  for (const bad of ['5ooo', 'abc', '-1', 'NaN', 'Infinity']) {
    assert.throws(() => readNumber('ENGINE_TIMEOUT_MS', 1, { ENGINE_TIMEOUT_MS: bad }), /ENGINE_TIMEOUT_MS must be a non-negative number/);
  }
});
