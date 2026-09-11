import { test } from 'node:test';
import assert from 'node:assert/strict';
import { eventsBodySchema } from '../dist/types/event.js';

const valid = {
  event_id: 'evt_1', type: 'trade', timestamp: '2026-09-10T10:00:00Z',
  from_account_id: 'p_1000', to_account_id: 'p_2000', asset_type: 'currency', asset_id: 'gold_coins',
  quantity: 5, value_usd_estimate: 9.99, payment_flagged: false, account_created_at: null,
};

test('POST /events accepts one event or a batch and coerces dates', () => {
  const one = eventsBodySchema.safeParse(valid);
  assert.ok(one.success);
  assert.ok(one.data.timestamp instanceof Date);
  const many = eventsBodySchema.safeParse([valid, { ...valid, event_id: 'evt_2', account_created_at: '2026-06-01T00:00:00Z' }]);
  assert.ok(many.success);
  assert.equal(many.data.length, 2);
});

test('POST /events rejects the mistakes a hand-made export is likely to contain', () => {
  const cases = [
    { ...valid, type: 'refund' },                 // not one of the five event types
    { ...valid, asset_type: 'nft' },              // not one of the three asset types
    { ...valid, value_usd_estimate: -1 },         // negative value
    { ...valid, quantity: 1.5 },                  // non-integer quantity
    { ...valid, payment_flagged: 'yes' },         // string instead of boolean
    { ...valid, event_id: '' },                   // empty id
    { ...valid, timestamp: 'yesterday' },         // unparseable date
  ];
  for (const c of cases) assert.equal(eventsBodySchema.safeParse(c).success, false, JSON.stringify(c));
});
