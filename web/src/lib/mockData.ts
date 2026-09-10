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
    const id = `acct_${i.toString().padStart(4, "0")}`;
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
  const HUBS = ["hub_1", "hub_2"];
  HUBS.forEach((h) => accountCreatedAt.set(h, daysAgo(between(80, 120))));

  const MULES = Array.from({ length: 50 }, (_, i) => `mule_${i.toString().padStart(3, "0")}`);
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
  const WHALE = "acct_whale_01";
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
        "50 hesab son 72 saatda yaradılıb və eyni saatda aktivləşib",
        "Hər mule STORE-dan alış edir, dəqiqələr içində 1-2 hub-a köçürür",
        "Mənbə alışlarının ~70%-i ödəniş provayderi tərəfindən payment_flagged=true",
        "Hub-lar mule-lardan gələn dəyəri bazarda cash-out edir",
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
        "Yüksək dəyərli ticarət həcmi, 12 fərqli tərəfdaşla",
        "Hesab 320 gün əvvəl yaradılıb (fərma hesabları adətən <3 gün olur)",
        "Heç bir ödəniş payment_flagged=true deyil",
        "Ticarət saatları normal oyuncu fəallıq nümunəsinə uyğundur",
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
      dailyEvents: events.length,
      dailyVolumeUsd: Math.round(events.reduce((s, e) => s + e.valueUsdEstimate, 0) * 100) / 100,
      ringsAtRisk: rings.length,
    },
  };
}

export function buildMockExplanation(ringId: string, snapshot: GraphSnapshot) {
  const ring = snapshot.rings.find((r) => r.id === ringId);
  if (!ring) {
    return {
      ringId,
      summary: "Bu halqa üçün əlavə məlumat tapılmadı.",
      signals: [],
      recommendedAction: "Nəzərdən keçirin.",
    };
  }
  if (ring.id === "ring_farm_01") {
    return {
      ringId,
      summary:
        `Bu 52 hesablıq qrup klassik "gold farming" halqasına bənzəyir: 50 hesab son 72 saat ` +
        `ərzində yaradılıb, hər biri STORE-dan valyuta alıb və dəqiqələr içində ${ring.hubAccountIds.length} hub ` +
        `hesaba köçürüb. Mənbə alışlarının təxminən 70%-i ödəniş provayderi tərəfindən oğurlanmış kart şübhəsi ilə ` +
        `bayraqlanıb. Hub hesablar topladıqları dəyəri bazarda əşyalara çevirib satır — bu da nağdlaşdırma addımıdır. ` +
        `Ümumi risk altında olan dəyər: $${ring.totalValueUsd.toLocaleString()}.`,
      signals: ring.signals.map((label) => ({ label, value: "" })),
      recommendedAction: "Bütün mule hesablarını dondurun, hub-ları araşdırma üçün bayraqlayın, ödəniş provayderinə bildirin.",
    };
  }
  return {
    ringId,
    summary:
      `Bu hesab yüksək ticarət həcminə görə bayraqlanıb, lakin siqnallar fərqlidir: hesab 320 gün əvvəl ` +
      `yaradılıb (fərma hesabları adətən 3 gündən azdır), heç bir ödənişi bayraqlanmayıb, və ticarət nümunəsi ` +
      `uzun müddətli, çox-tərəfdaşlı kolleksiyaçı davranışına uyğundur. Bu, çox güman ki, real, yüksək xərcləyən oyunçudur.`,
    signals: ring.signals.map((label) => ({ label, value: "" })),
    recommendedAction: "Avtomatik bloklamayın — sensitivliyi aşağı salın və ya əlaqə saxlayaraq manual təsdiq edin.",
  };
}
