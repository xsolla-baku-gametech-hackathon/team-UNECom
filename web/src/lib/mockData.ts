// Local stand-in for GET /api/graph, mirroring data-generator/generate.py's
// scenario 1:1 (clean traffic + a 50-mule -> hub farming ring) so the demo
// looks identical once /api and /engine are wired up. See /docs/api-contract.md.
//
// Also injects one "legit whale" account: a long-lived, real player who
// trades unusually large volumes with many peers. At high sensitivity this
// looks statistically similar to a farm hub and gets flagged too — used in
// the pitch to show the slider un-flagging a real player.
import type { Account, AccountEvent, GraphSnapshot, Ring } from "./types";

function seededRandom(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const rand = seededRandom(42);
const pick = <T,>(arr: T[]) => arr[Math.floor(rand() * arr.length)];
const between = (min: number, max: number) => min + rand() * (max - min);

const CURRENCY_ASSETS = ["gold_coins", "gems", "star_tokens", "crystal_shards"];
const ITEM_ASSETS = ["skin_dragon", "mount_phoenix", "sword_epic", "cape_shadow", "pet_griffin"];

let eventCounter = 0;
function newEvent(partial: Omit<AccountEvent, "id">): AccountEvent {
  eventCounter += 1;
  return { id: `evt_${eventCounter.toString().padStart(5, "0")}`, ...partial };
}

// Every account gets the same opaque acct_NNNN shape, scattered rather than
// sequential, so neither the graph nor the case panel gives away which
// accounts were planted — the same rule data-generator/generate.py follows.
// 37 is coprime with 997, so n = 0..996 maps to distinct ids.
const opaqueId = (n: number) => `acct_${((n * 37 + 11) % 997).toString().padStart(4, "0")}`;

const NOW = Date.now();
const hoursAgo = (h: number) => new Date(NOW - h * 3600_000).toISOString();
const daysAgo = (d: number) => hoursAgo(d * 24);

export function buildMockSnapshot(): GraphSnapshot {
  const events: AccountEvent[] = [];
  const accountCreatedAt = new Map<string, string | null>();

  // ---- clean accounts + activity -----------------------------------
  const CLEAN_N = 70;
  const clean: string[] = [];
  for (let i = 0; i < CLEAN_N; i++) {
    const id = opaqueId(i);
    accountCreatedAt.set(id, daysAgo(between(1, 180)));
    clean.push(id);
  }

  for (let i = 0; i < 260; i++) {
    const type = pick(["trade", "gift", "marketplace_sale", "key_redeem", "purchase"] as const);
    if (type === "purchase") {
      const to = pick(clean);
      events.push(
        newEvent({
          type,
          timestamp: hoursAgo(between(1, 48)),
          from: "STORE",
          to,
          assetType: rand() < 0.8 ? "currency" : "key",
          assetId: pick(CURRENCY_ASSETS),
          quantity: Math.round(between(50, 1500)),
          valueUsdEstimate: Math.round(between(1, 60) * 100) / 100,
          paymentFlagged: rand() < 0.01,
        }),
      );
      continue;
    }
    const from = pick(clean);
    let to = pick(clean);
    while (to === from) to = pick(clean);
    const assetType = type === "key_redeem" ? "key" : rand() < 0.6 ? "currency" : "item";
    events.push(
      newEvent({
        type,
        timestamp: hoursAgo(between(1, 72)),
        from,
        to,
        assetType,
        assetId: assetType === "currency" ? pick(CURRENCY_ASSETS) : pick(ITEM_ASSETS),
        quantity: assetType === "currency" ? Math.round(between(1, 500)) : 1,
        valueUsdEstimate: Math.round(between(0.5, 120) * 100) / 100,
        paymentFlagged: false,
      }),
    );
  }

  // ---- farm ring: 50 mules -> 2 hubs ---------------------------------
  const HUBS = [opaqueId(CLEAN_N), opaqueId(CLEAN_N + 1)];
  HUBS.forEach((h) => accountCreatedAt.set(h, daysAgo(between(80, 120))));

  const MULES = Array.from({ length: 50 }, (_, i) => opaqueId(CLEAN_N + 2 + i));
  MULES.forEach((m) => accountCreatedAt.set(m, hoursAgo(between(0, 66))));

  MULES.forEach((mule) => {
    const purchaseTs = hoursAgo(between(0, 3)); // ring is active in the last 72h
    const flagged = rand() < 0.7;
    const value = Math.round(between(40, 300) * 100) / 100;
    const qty = Math.round(between(800, 6000));
    events.push(
      newEvent({
        type: "purchase",
        timestamp: purchaseTs,
        from: "STORE",
        to: mule,
        assetType: "currency",
        assetId: pick(CURRENCY_ASSETS),
        quantity: qty,
        valueUsdEstimate: value,
        paymentFlagged: flagged,
      }),
    );
    const hub = rand() < 0.75 ? HUBS[0] : HUBS[1];
    events.push(
      newEvent({
        type: rand() < 0.7 ? "trade" : "gift",
        timestamp: hoursAgo(between(0, 3)),
        from: mule,
        to: hub,
        assetType: "currency",
        assetId: pick(CURRENCY_ASSETS),
        quantity: Math.round(qty * between(0.85, 1)),
        valueUsdEstimate: Math.round(value * between(0.85, 1) * 100) / 100,
        paymentFlagged: false,
      }),
    );
  });

  for (let i = 0; i < 15; i++) {
    const hub = pick(HUBS);
    const buyer = pick(clean);
    events.push(
      newEvent({
        type: "marketplace_sale",
        timestamp: hoursAgo(between(0, 60)),
        from: hub,
        to: buyer,
        assetType: "item",
        assetId: pick(ITEM_ASSETS),
        quantity: 1,
        valueUsdEstimate: Math.round(between(20, 150) * 100) / 100,
        paymentFlagged: false,
      }),
    );
  }

  // ---- legit whale: a real, long-time high-spender -------------------
  // Trades big volumes with many peers, no flagged payments, account is
  // old — but raw volume alone makes it look "ring-like" at high sensitivity.
  const WHALE = opaqueId(CLEAN_N + 52);
  accountCreatedAt.set(WHALE, daysAgo(320));
  const whalePeers = clean.slice(0, 12);
  whalePeers.forEach((peer) => {
    events.push(
      newEvent({
        type: rand() < 0.5 ? "trade" : "marketplace_sale",
        timestamp: hoursAgo(between(0, 48)),
        from: WHALE,
        to: peer,
        assetType: "item",
        assetId: pick(ITEM_ASSETS),
        quantity: 1,
        valueUsdEstimate: Math.round(between(80, 400) * 100) / 100,
        paymentFlagged: false,
      }),
    );
  });

  // ---- risk scoring (stand-in for /engine) ---------------------------
  const allAccountIds = new Set<string>();
  events.forEach((e) => {
    if (e.from !== "STORE") allAccountIds.add(e.from);
    allAccountIds.add(e.to);
  });

  const ringMembers = new Set([...HUBS, ...MULES]);

  const accounts: Account[] = Array.from(allAccountIds).map((id) => {
    let riskScore = 0.05 + rand() * 0.1;
    let ringId: string | null = null;
    if (ringMembers.has(id)) {
      riskScore = HUBS.includes(id) ? 0.97 : 0.85 + rand() * 0.12;
      ringId = "ring_farm_01";
    } else if (id === WHALE) {
      // High enough to trip a loose threshold, well under a confirmed ring.
      riskScore = 0.58;
      ringId = "ring_whale_watch";
    }
    return {
      id,
      label: id,
      createdAt: accountCreatedAt.get(id) ?? null,
      riskScore: Math.min(1, riskScore),
      ringId,
    };
  });

  const ringTotalValue = events
    .filter((e) => ringMembers.has(e.from) || ringMembers.has(e.to))
    .reduce((sum, e) => sum + e.valueUsdEstimate, 0);

  const rings: Ring[] = [
    {
      id: "ring_farm_01",
      memberAccountIds: [...HUBS, ...MULES],
      hubAccountIds: HUBS,
      riskScore: 0.94,
      status: "pending",
      totalValueUsd: Math.round(ringTotalValue * 100) / 100,
      signals: [
        "50 accounts created in the last 72 hours, active within the same hour",
        "Each account buys from STORE and forwards to 1-2 hubs within minutes",
        "~70% of source purchases were flagged by the payment provider",
        "Hubs cash out the incoming value on the marketplace",
      ],
    },
    {
      id: "ring_whale_watch",
      memberAccountIds: [WHALE, ...whalePeers],
      hubAccountIds: [WHALE],
      riskScore: 0.58,
      status: "pending",
      totalValueUsd: Math.round(
        events.filter((e) => e.from === WHALE || e.to === WHALE).reduce((s, e) => s + e.valueUsdEstimate, 0) * 100,
      ) / 100,
      signals: [
        "High-value trade volume with 12 different counterparties",
        "Account created 320 days ago (farm accounts are usually under 3 days old)",
        "No payment is flagged",
        "Trading hours match a normal player activity pattern",
      ],
    },
  ];

  return {
    generatedAt: new Date().toISOString(),
    accounts,
    events,
    rings,
    stats: {
      activeAccounts: accounts.length,
      totalEvents: events.length,
      totalVolumeUsd: Math.round(events.reduce((s, e) => s + e.valueUsdEstimate, 0) * 100) / 100,
      ringsAtRisk: rings.length,
    },
  };
}

export function buildMockExplanation(ringId: string, snapshot: GraphSnapshot) {
  const ring = snapshot.rings.find((r) => r.id === ringId);
  if (!ring) {
    return {
      source: "demo" as const,
      ringId,
      summary: "No further information for this ring.",
      signals: [],
      recommendedAction: "Review it.",
    };
  }
  if (ring.id === "ring_farm_01") {
    return {
      source: "demo" as const,
      ringId,
      summary:
        `This 52-account group looks like a classic farming ring: 50 accounts were created in the last 72 hours, ` +
        `each bought currency from STORE and moved it to ${ring.hubAccountIds.length} hub accounts within minutes. ` +
        `About 70% of the source purchases were flagged by the payment provider as likely stolen cards. ` +
        `The hubs turn the collected value into items and sell them on the marketplace, which is the cash-out step. ` +
        `Total value at risk: $${ring.totalValueUsd.toLocaleString()}.`,
      signals: ring.signals.map((label) => ({ label, value: "" })),
      recommendedAction: "Freeze the feeder accounts, flag the hubs for investigation, and notify the payment provider.",
    };
  }
  return {
    source: "demo" as const,
    ringId,
    summary:
      `This account was flagged for its high trade volume, but the signals differ: it was created 320 days ago ` +
      `(farm accounts are usually under 3 days old), none of its payments were flagged, and its trading pattern ` +
      `matches a long-term collector with many counterparties. This is most likely a real, high-spending player.`,
    signals: ring.signals.map((label) => ({ label, value: "" })),
    recommendedAction: "Do not block automatically. Lower the sensitivity, or contact the player and confirm manually.",
  };
}
