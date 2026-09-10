import { z } from "zod";

// Shared data contract — do not change field names or shapes without
// updating data-generator/, /engine, and /web at the same time.
export const eventTypeSchema = z.enum([
  "trade",
  "gift",
  "marketplace_sale",
  "key_redeem",
  "purchase",
]);

export const assetTypeSchema = z.enum(["currency", "item", "key"]);

export const eventSchema = z.object({
  event_id: z.string().min(1),
  type: eventTypeSchema,
  timestamp: z.coerce.date(),
  from_account_id: z.string().min(1),
  to_account_id: z.string().min(1),
  asset_type: assetTypeSchema,
  asset_id: z.string().min(1),
  quantity: z.number().int(),
  value_usd_estimate: z.number().nonnegative(),
  payment_flagged: z.boolean(),
  // Null for the STORE system account, which has no signup date of its own.
  account_created_at: z.coerce.date().nullable(),
});

export type EventInput = z.infer<typeof eventSchema>;

// POST /events accepts a single event or a batch upload.
export const eventsBodySchema = z.union([eventSchema, z.array(eventSchema)]);
