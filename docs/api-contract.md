# API contract

The full `/api` endpoint contract — what `/web` calls, request/response
shapes, and the assumed `/engine` HTTP contract — lives in
[`api/README.md`](../api/README.md) (kept next to the code it describes,
so it doesn't drift).

Shared event data contract (used by `data-generator`, `/api`, `/engine`,
and `/web`):

```
{ event_id, type: trade|gift|marketplace_sale|key_redeem|purchase, timestamp,
  from_account_id, to_account_id, asset_type: currency|item|key, asset_id,
  quantity, value_usd_estimate, payment_flagged: boolean, account_created_at }
```
