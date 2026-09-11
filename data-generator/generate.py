#!/usr/bin/env python3
"""
Sintetik oyun-iqtisadiyyati event generatoru.

Iki qat data yaradir:
  1. "Temiz" hesablar arasinda normal trade/gift/marketplace/key/purchase axini.
  2. Aciq-askar bir kart-firildaqciligi "ferma halqasi": 50 yeni hesab qisa
     muddet erzinde 1-2 hub hesaba deyer axidir, menbe alislarinin bir hissesi
     payment_flagged=true olur.

Umumi data kontrakti (butun komanda buna esaslanir, DEYISME):
  event_id, type, timestamp, from_account_id, to_account_id,
  asset_type, asset_id, quantity, value_usd_estimate, payment_flagged,
  account_created_at

Konvensiya: `account_created_at` HEMISHE `from_account_id`-nin yaranma
tarixidir (yeni hesabin dermal aktivligini olcmek ucun asas siqnal budur).
STORE sistem hesabinin (purchase hadiselerinde alici terefdeki menbe) oz
yaranma tarixi yoxdur -> None/bos qoyulur.

Account ids in the output are opaque: every player account, clean or planted,
is `acct_NNNN` with the numbers shuffled. The ring is planted under readable
internal names (mule_/hub_) so the logic below stays legible, but those names
never reach events.csv/json — otherwise the answer key would be sitting in the
data, visible on the dashboard and readable by the Claude explanation layer.
Which accounts were planted is recorded only in ground_truth.json.
Pass --readable-ids to keep the internal names when debugging the generator.
"""
from __future__ import annotations

import argparse
import csv
import json
import random
import uuid
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta, timezone
from pathlib import Path

FIELDS = [
    "event_id", "type", "timestamp", "from_account_id", "to_account_id",
    "asset_type", "asset_id", "quantity", "value_usd_estimate",
    "payment_flagged", "account_created_at",
]

CURRENCY_ASSETS = ["gold_coins", "gems", "star_tokens", "crystal_shards"]
ITEM_ASSETS = ["skin_dragon", "mount_phoenix", "sword_epic", "cape_shadow", "pet_griffin"]
KEY_ASSETS = ["cdkey_AAA1", "cdkey_BBB2", "cdkey_CCC3", "cdkey_DDD4"]

STORE_ACCOUNT = "STORE"


@dataclass
class Event:
    event_id: str
    type: str
    timestamp: str
    from_account_id: str
    to_account_id: str
    asset_type: str
    asset_id: str
    quantity: int
    value_usd_estimate: float
    payment_flagged: bool
    account_created_at: str | None

    def to_row(self) -> dict:
        return asdict(self)


def iso(dt: datetime) -> str:
    return dt.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")


def new_event_id() -> str:
    return f"evt_{uuid.uuid4().hex[:12]}"


def pick_asset(asset_type: str) -> str:
    return {
        "currency": random.choice(CURRENCY_ASSETS),
        "item": random.choice(ITEM_ASSETS),
        "key": random.choice(KEY_ASSETS),
    }[asset_type]


class Generator:
    def __init__(self, seed: int, now: datetime):
        random.seed(seed)
        self.now = now
        self.events: list[Event] = []
        self.account_created_at: dict[str, datetime] = {}
        self.ring_accounts: set[str] = set()
        self.hub_accounts: set[str] = set()

    # ---------------------------------------------------------------- clean
    def gen_clean_accounts(self, n: int) -> list[str]:
        accounts = []
        for i in range(n):
            acc = f"acct_{i:04d}"
            created = self.now - timedelta(days=random.uniform(1, 180))
            self.account_created_at[acc] = created
            accounts.append(acc)
        return accounts

    def gen_clean_activity(self, accounts: list[str], n_events: int):
        weights = {
            "trade": 0.35,
            "gift": 0.20,
            "marketplace_sale": 0.25,
            "key_redeem": 0.10,
            "purchase": 0.10,
        }
        types = list(weights.keys())
        probs = list(weights.values())

        for _ in range(n_events):
            etype = random.choices(types, probs)[0]

            if etype == "purchase":
                to_acc = random.choice(accounts)
                created = self.account_created_at[to_acc]
                # normal players don't buy the instant they sign up
                ts = created + timedelta(hours=random.uniform(1, 24 * 120))
                ts = min(ts, self.now - timedelta(minutes=1))
                asset_type = random.choices(["currency", "key"], [0.8, 0.2])[0]
                self.events.append(Event(
                    event_id=new_event_id(), type="purchase", timestamp=iso(ts),
                    from_account_id=STORE_ACCOUNT, to_account_id=to_acc,
                    asset_type=asset_type, asset_id=pick_asset(asset_type),
                    quantity=random.randint(50, 1500),
                    value_usd_estimate=round(random.uniform(1, 60), 2),
                    payment_flagged=random.random() < 0.01,
                    account_created_at=None,
                ))
                continue

            src, dst = random.sample(accounts, 2)
            src_created = self.account_created_at[src]
            earliest = src_created + timedelta(hours=random.uniform(2, 24 * 60))
            ts = min(earliest, self.now - timedelta(minutes=1))
            if etype in ("trade", "gift"):
                asset_type = random.choices(["currency", "item"], [0.6, 0.4])[0]
                qty = random.randint(1, 500) if asset_type == "currency" else 1
                value = round(random.uniform(0.5, 40), 2)
            elif etype == "marketplace_sale":
                asset_type = random.choices(["item", "currency"], [0.7, 0.3])[0]
                qty = random.randint(1, 300) if asset_type == "currency" else 1
                value = round(random.uniform(1, 120), 2)
            else:  # key_redeem
                asset_type = "key"
                qty = 1
                value = round(random.uniform(5, 80), 2)

            self.events.append(Event(
                event_id=new_event_id(), type=etype, timestamp=iso(ts),
                from_account_id=src, to_account_id=dst,
                asset_type=asset_type, asset_id=pick_asset(asset_type),
                quantity=qty, value_usd_estimate=value,
                payment_flagged=False,
                account_created_at=iso(src_created),
            ))

    # ----------------------------------------------------------------- ring
    def gen_farm_ring(self, n_mules: int, n_hubs: int, flag_rate: float, layering_rate: float):
        hubs = [f"hub_{i+1}" for i in range(n_hubs)]
        for h in hubs:
            created = self.now - timedelta(days=random.uniform(80, 120))
            self.account_created_at[h] = created
            self.hub_accounts.add(h)
            self.ring_accounts.add(h)

        # The first hub is the main collection point (3x weight); any further
        # hubs share the rest. Must be sized to n_hubs — a fixed [3, 1] list
        # crashed random.choices() for --hubs 3 or more.
        hub_weights = [3] + [1] * (n_hubs - 1)

        mules = [f"mule_{i:03d}" for i in range(n_mules)]
        ring_window_start = self.now - timedelta(hours=72)

        # created_at for every mule must exist up-front: a layering hop can
        # route through a mule that hasn't had its own turn in the loop yet.
        for mule in mules:
            self.account_created_at[mule] = ring_window_start + timedelta(hours=random.uniform(0, 66))
            self.ring_accounts.add(mule)

        for mule in mules:
            created = self.account_created_at[mule]

            # 1) mule "buys" currency with a (likely) stolen card, almost immediately
            purchase_ts = created + timedelta(minutes=random.uniform(5, 180))
            flagged = random.random() < flag_rate
            qty = random.randint(800, 6000)
            value = round(random.uniform(40, 300), 2)
            self.events.append(Event(
                event_id=new_event_id(), type="purchase", timestamp=iso(purchase_ts),
                from_account_id=STORE_ACCOUNT, to_account_id=mule,
                asset_type="currency", asset_id=pick_asset("currency"),
                quantity=qty, value_usd_estimate=value,
                payment_flagged=flagged,
                account_created_at=None,
            ))

            # 2) mule almost immediately funnels the value onward
            send_ts = purchase_ts + timedelta(minutes=random.uniform(5, 120))
            out_type = random.choices(["trade", "gift"], [0.7, 0.3])[0]
            out_value = round(value * random.uniform(0.85, 1.0), 2)
            out_qty = int(qty * random.uniform(0.85, 1.0))

            if random.random() < layering_rate:
                # one extra layering hop through a peer mule before the hub
                layer_peer = random.choice([m for m in mules if m != mule])
                self.events.append(Event(
                    event_id=new_event_id(), type=out_type, timestamp=iso(send_ts),
                    from_account_id=mule, to_account_id=layer_peer,
                    asset_type="currency", asset_id=pick_asset("currency"),
                    quantity=out_qty, value_usd_estimate=out_value,
                    payment_flagged=False,
                    account_created_at=iso(created),
                ))
                relay_ts = send_ts + timedelta(minutes=random.uniform(5, 60))
                hub = random.choices(hubs, weights=hub_weights)[0]
                self.events.append(Event(
                    event_id=new_event_id(), type=out_type, timestamp=iso(relay_ts),
                    from_account_id=layer_peer, to_account_id=hub,
                    asset_type="currency", asset_id=pick_asset("currency"),
                    quantity=out_qty, value_usd_estimate=out_value,
                    payment_flagged=False,
                    account_created_at=iso(self.account_created_at[layer_peer]),
                ))
            else:
                hub = random.choices(hubs, weights=hub_weights)[0]
                self.events.append(Event(
                    event_id=new_event_id(), type=out_type, timestamp=iso(send_ts),
                    from_account_id=mule, to_account_id=hub,
                    asset_type="currency", asset_id=pick_asset("currency"),
                    quantity=out_qty, value_usd_estimate=out_value,
                    payment_flagged=False,
                    account_created_at=iso(created),
                ))

        return hubs, mules

    def gen_hub_cashout(self, hubs: list[str], clean_accounts: list[str], n_sales: int):
        for _ in range(n_sales):
            hub = random.choice(hubs)
            buyer = random.choice(clean_accounts)
            created = self.account_created_at[hub]
            ts = self.now - timedelta(hours=random.uniform(0, 60))
            self.events.append(Event(
                event_id=new_event_id(), type="marketplace_sale", timestamp=iso(ts),
                from_account_id=hub, to_account_id=buyer,
                asset_type="item", asset_id=pick_asset("item"),
                quantity=1, value_usd_estimate=round(random.uniform(20, 150), 2),
                payment_flagged=False,
                account_created_at=iso(created),
            ))

    # ------------------------------------------------------------- output
    def relabel_opaque(self, seed: int) -> dict[str, str]:
        """Rename every player account to a shuffled `acct_NNNN` id.

        Uses its own RNG, so the event draws above are unchanged for a seed.
        Returns the internal-name -> output-id mapping.
        """
        accounts = sorted(self.account_created_at)
        numbers = list(range(len(accounts)))
        random.Random(seed ^ 0x5EED).shuffle(numbers)
        mapping = {acc: f"acct_{n:04d}" for acc, n in zip(accounts, numbers)}
        for e in self.events:
            e.from_account_id = mapping.get(e.from_account_id, e.from_account_id)
            e.to_account_id = mapping.get(e.to_account_id, e.to_account_id)
        self.ring_accounts = {mapping[a] for a in self.ring_accounts}
        self.hub_accounts = {mapping[a] for a in self.hub_accounts}
        return mapping

    def sorted_events(self) -> list[Event]:
        return sorted(self.events, key=lambda e: e.timestamp)

    def write_csv(self, path: Path):
        with path.open("w", newline="") as f:
            w = csv.DictWriter(f, fieldnames=FIELDS)
            w.writeheader()
            for e in self.sorted_events():
                w.writerow(e.to_row())

    def write_json(self, path: Path):
        with path.open("w") as f:
            json.dump([e.to_row() for e in self.sorted_events()], f, indent=2)

    def write_ground_truth(self, path: Path, hubs: list[str], mules: list[str]):
        data = {
            "description": (
                "Demo/qiymetlendirme ucun daxili ground truth. Engine bu faylı "
                "OXUMAMALIDIR — yalniz nece netice cixdigini yoxlamaq ucundur."
            ),
            "hub_accounts": hubs,
            "mule_accounts": mules,
            "ring_accounts": sorted(self.ring_accounts),
        }
        with path.open("w") as f:
            json.dump(data, f, indent=2)


def main():
    p = argparse.ArgumentParser(description="Sintetik post-purchase fraud data generatoru")
    p.add_argument("--clean-accounts", type=int, default=300)
    p.add_argument("--clean-events", type=int, default=2500)
    p.add_argument("--mules", type=int, default=50)
    p.add_argument("--hubs", type=int, default=2)
    p.add_argument("--flag-rate", type=float, default=0.7, help="menbe alislarinin ne qederi payment_flagged=true")
    p.add_argument("--layering-rate", type=float, default=0.2, help="mule->peer->hub ile bir elave hop ehtimali")
    p.add_argument("--hub-sales", type=int, default=15)
    p.add_argument("--seed", type=int, default=42)
    p.add_argument("--out-dir", type=str, default="output")
    p.add_argument("--readable-ids", action="store_true",
                   help="keep internal mule_/hub_ names in the output (debug only - leaks the answer key)")
    args = p.parse_args()

    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    now = datetime.now(timezone.utc)
    gen = Generator(seed=args.seed, now=now)

    clean_accounts = gen.gen_clean_accounts(args.clean_accounts)
    gen.gen_clean_activity(clean_accounts, args.clean_events)

    hubs, mules = gen.gen_farm_ring(
        n_mules=args.mules, n_hubs=args.hubs,
        flag_rate=args.flag_rate, layering_rate=args.layering_rate,
    )
    gen.gen_hub_cashout(hubs, clean_accounts, args.hub_sales)

    if not args.readable_ids:
        mapping = gen.relabel_opaque(args.seed)
        hubs = sorted(mapping[h] for h in hubs)
        mules = sorted(mapping[m] for m in mules)

    gen.write_csv(out_dir / "events.csv")
    gen.write_json(out_dir / "events.json")
    gen.write_ground_truth(out_dir / "ground_truth.json", hubs, mules)

    print(f"{len(gen.events)} hadise yaradildi -> {out_dir}/events.{{csv,json}}")
    print(f"Ferma halqasi: {len(mules)} mule + {len(hubs)} hub -> {out_dir}/ground_truth.json")


if __name__ == "__main__":
    main()
