// Blind test: a judge builds a fraud ring with their own parameters and seed,
// the browser writes the log, the backend gets ONLY the log. Every account is
// named p_#### — no "mule" or "hub" in any id — so nothing about who is who
// leaks into the analysis. The ground truth stays here, in memory, and is
// compared with what the engine flagged afterwards.
//
// The generator mirrors data-generator/generate.py (same account behaviour,
// same timings, same asset mix); only the naming is neutral. It is not
// byte-identical to the Python output and does not need to be.
import type { RawEvent } from "./parseUpload";
import type { GraphSnapshot, Ring } from "./types";

export interface ChallengeParams {
  seed: number;
  /** Legitimate players in the background. */
  players: number;
  /** Mule accounts in the planted ring. */
  mules: number;
  /** Cash-out hubs the mules feed. */
  hubs: number;
  /** 0..1 — how much the fraudster hides: fewer flagged cards, more layering hops. */
  care: number;
}

export interface ChallengeTruth {
  params: ChallengeParams;
  ringIds: Set<string>;
  hubIds: Set<string>;
  muleIds: Set<string>;
  cleanIds: Set<string>;
  events: number;
}

export interface ChallengeScore {
  ringTotal: number;
  ringCaught: number;
  hubTotal: number;
  hubCaught: number;
  cleanTotal: number;
  falsePositives: number;
  /** Ring-internal value that sits inside a flagged ring vs. all of it. */
  valueCaughtUsd: number;
  valueTotalUsd: number;
}

// Deterministic PRNG so the same seed always builds the same ring — a judge
// can hand the seed to someone else and get the identical file.
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const CURRENCY = ["gold_coins", "gems", "star_tokens", "crystal_shards"];
const ITEMS = ["skin_dragon", "mount_phoenix", "sword_epic", "cape_shadow", "pet_griffin"];
const KEYS = ["cdkey_AAA1", "cdkey_BBB2", "cdkey_CCC3", "cdkey_DDD4"];
const HOUR = 3600_000;
const DAY = 24 * HOUR;

export function generateChallenge(params: ChallengeParams): { events: RawEvent[]; truth: ChallengeTruth } {
  const rnd = mulberry32(params.seed);
  const uniform = (lo: number, hi: number) => lo + rnd() * (hi - lo);
  const int = (lo: number, hi: number) => Math.floor(uniform(lo, hi + 1));
  const pick = <T,>(xs: T[]) => xs[Math.floor(rnd() * xs.length)];
  const weighted = <T,>(xs: T[], w: number[]) => {
    let r = rnd() * w.reduce((s, x) => s + x, 0);
    for (let i = 0; i < xs.length; i++) {
      r -= w[i];
      if (r <= 0) return xs[i];
    }
    return xs[xs.length - 1];
  };
  const iso = (ms: number) => new Date(ms).toISOString().replace(/\.\d{3}Z$/, "Z");
  const evtId = () => "evt_" + Math.floor(rnd() * 0xffffffff).toString(16).padStart(8, "0") + Math.floor(rnd() * 0xffff).toString(16).padStart(4, "0");
  const now = Date.now();

  // Neutral, shuffled ids for everyone: the ring is not the last N accounts,
  // not the highest numbers, not anything a reader could spot from the file.
  const total = params.players + params.mules + params.hubs;
  const pool = new Set<string>();
  while (pool.size < total) pool.add("p_" + String(int(1000, 9999)).padStart(4, "0"));
  const ids = [...pool];
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  const players = ids.slice(0, params.players);
  const hubs = ids.slice(params.players, params.players + params.hubs);
  const mules = ids.slice(params.players + params.hubs);

  const createdAt = new Map<string, number>();
  for (const p of players) createdAt.set(p, now - uniform(1, 180) * DAY);
  for (const h of hubs) createdAt.set(h, now - uniform(80, 120) * DAY);
  const ringStart = now - 72 * HOUR;
  for (const m of mules) createdAt.set(m, ringStart + uniform(0, 66) * HOUR);

  const events: RawEvent[] = [];
  const push = (e: Omit<RawEvent, "event_id">) => events.push({ event_id: evtId(), ...e });

  // --- background economy (as generate.py gen_clean_activity)
  const nClean = params.players * 4;
  for (let i = 0; i < nClean; i++) {
    const type = weighted(["trade", "gift", "marketplace_sale", "key_redeem", "purchase"] as const, [0.35, 0.2, 0.25, 0.1, 0.1]);
    if (type === "purchase") {
      const to = pick(players);
      const ts = Math.min(createdAt.get(to)! + uniform(1, 24 * 120) * HOUR, now - 60_000);
      const assetType = weighted(["currency", "key"] as const, [0.8, 0.2]);
      push({ type, timestamp: iso(ts), from_account_id: "STORE", to_account_id: to, asset_type: assetType, asset_id: assetType === "key" ? pick(KEYS) : pick(CURRENCY), quantity: int(50, 1500), value_usd_estimate: Math.round(uniform(1, 60) * 100) / 100, payment_flagged: rnd() < 0.01, account_created_at: null });
      continue;
    }
    const src = pick(players);
    let dst = pick(players);
    while (dst === src) dst = pick(players);
    const srcCreated = createdAt.get(src)!;
    const ts = Math.min(srcCreated + uniform(2, 24 * 60) * HOUR, now - 60_000);
    let assetType: RawEvent["asset_type"];
    let qty: number;
    let value: number;
    if (type === "trade" || type === "gift") {
      assetType = weighted(["currency", "item"] as const, [0.6, 0.4]);
      qty = assetType === "currency" ? int(1, 500) : 1;
      value = uniform(0.5, 40);
    } else if (type === "marketplace_sale") {
      assetType = weighted(["item", "currency"] as const, [0.7, 0.3]);
      qty = assetType === "currency" ? int(1, 300) : 1;
      value = uniform(1, 120);
    } else {
      assetType = "key";
      qty = 1;
      value = uniform(5, 80);
    }
    push({ type, timestamp: iso(ts), from_account_id: src, to_account_id: dst, asset_type: assetType, asset_id: assetType === "currency" ? pick(CURRENCY) : assetType === "item" ? pick(ITEMS) : pick(KEYS), quantity: qty, value_usd_estimate: Math.round(value * 100) / 100, payment_flagged: false, account_created_at: iso(srcCreated) });
  }

  // --- the planted ring (as generate.py gen_farm_ring)
  const flagRate = 1 - 0.6 * params.care; // 1.0 careless .. 0.4 careful
  const layeringRate = 0.5 * params.care; // 0 .. 0.5
  const hubWeights = hubs.map((_, i) => (i === 0 ? 3 : 1));
  const forward = (from: string, to: string, ts: number, type: "trade" | "gift", qty: number, value: number) =>
    push({ type, timestamp: iso(ts), from_account_id: from, to_account_id: to, asset_type: "currency", asset_id: pick(CURRENCY), quantity: qty, value_usd_estimate: value, payment_flagged: false, account_created_at: iso(createdAt.get(from)!) });

  for (const mule of mules) {
    const created = createdAt.get(mule)!;
    const purchaseTs = created + uniform(5, 180) * 60_000;
    const qty = int(800, 6000);
    const value = Math.round(uniform(40, 300) * 100) / 100;
    push({ type: "purchase", timestamp: iso(purchaseTs), from_account_id: "STORE", to_account_id: mule, asset_type: "currency", asset_id: pick(CURRENCY), quantity: qty, value_usd_estimate: value, payment_flagged: rnd() < flagRate, account_created_at: null });

    const sendTs = purchaseTs + uniform(5, 120) * 60_000;
    const outType = weighted(["trade", "gift"] as const, [0.7, 0.3]);
    const outValue = Math.round(value * uniform(0.85, 1) * 100) / 100;
    const outQty = Math.floor(qty * uniform(0.85, 1));
    const hub = weighted(hubs, hubWeights);
    if (mules.length > 1 && rnd() < layeringRate) {
      let peer = pick(mules);
      while (peer === mule) peer = pick(mules);
      forward(mule, peer, sendTs, outType, outQty, outValue);
      forward(peer, hub, sendTs + uniform(5, 60) * 60_000, outType, outQty, outValue);
    } else {
      forward(mule, hub, sendTs, outType, outQty, outValue);
    }
  }

  // --- hubs cash out to real players (as gen_hub_cashout)
  const sales = Math.max(4, Math.round(params.mules * 0.3));
  for (let i = 0; i < sales; i++) {
    const hub = pick(hubs);
    push({ type: "marketplace_sale", timestamp: iso(now - uniform(0, 60) * HOUR), from_account_id: hub, to_account_id: pick(players), asset_type: "item", asset_id: pick(ITEMS), quantity: 1, value_usd_estimate: Math.round(uniform(20, 150) * 100) / 100, payment_flagged: false, account_created_at: iso(createdAt.get(hub)!) });
  }

  events.sort((a, b) => (a.timestamp < b.timestamp ? -1 : a.timestamp > b.timestamp ? 1 : 0));
  return {
    events,
    truth: {
      params,
      ringIds: new Set([...mules, ...hubs]),
      hubIds: new Set(hubs),
      muleIds: new Set(mules),
      cleanIds: new Set(players),
      events: events.length,
    },
  };
}

/** Compare what the engine flagged (at the current sensitivity) with the planted truth. */
export function scoreChallenge(truth: ChallengeTruth, snapshot: GraphSnapshot, flaggedRings: Ring[]): ChallengeScore {
  const flagged = new Set<string>();
  for (const r of flaggedRings) for (const id of r.memberAccountIds) flagged.add(id);

  let ringCaught = 0;
  for (const id of truth.ringIds) if (flagged.has(id)) ringCaught++;
  let hubCaught = 0;
  for (const id of truth.hubIds) if (flagged.has(id)) hubCaught++;
  let falsePositives = 0;
  for (const id of flagged) if (!truth.ringIds.has(id)) falsePositives++;

  let valueTotalUsd = 0;
  let valueCaughtUsd = 0;
  for (const e of snapshot.events) {
    if (e.from === "STORE" || !truth.ringIds.has(e.from) || !truth.ringIds.has(e.to)) continue;
    valueTotalUsd += e.valueUsdEstimate;
    if (flagged.has(e.from) && flagged.has(e.to)) valueCaughtUsd += e.valueUsdEstimate;
  }

  return {
    ringTotal: truth.ringIds.size,
    ringCaught,
    hubTotal: truth.hubIds.size,
    hubCaught,
    cleanTotal: truth.cleanIds.size,
    falsePositives,
    valueCaughtUsd,
    valueTotalUsd,
  };
}

export function randomSeed(): number {
  return Math.floor(1000 + Math.random() * 9000);
}
