# Business Case — Post-Purchase Value Flow: Fraud Tracker

**Team UNECom · GameTech Bootcamp Baku 2026**

This document exists to answer one question a judge will ask: *who pays for this,
how much, and why now?* Every number below is either sourced to a public URL or
explicitly labelled as an assumption with its reasoning shown.

---

## How to read the numbers in this document

| Tag | Meaning |
|---|---|
| **`[SOURCED]`** | Comes from a public document. URL is given inline. Primary sources (SEC filings, company blogs) are preferred over vendor marketing. |
| **`[ASSUMPTION]`** | We made this number up **on purpose**, from a stated basis. The basis is always written next to it. Never treat these as facts. |
| **`[NOT FOUND]`** | We looked and it is not in public sources. We did not fill the gap with an invented figure. |

If a judge asks "where does that number come from?" — every figure below has a
one-line answer.

---

## 1. Who exactly has this problem

Not "studios." Three concrete buying roles, each with a different budget and a
different reason to care.

### Persona A — Trust & Safety / Enforcement Analyst at a studio with a tradeable economy

**The person.** Reviews flagged accounts, issues bans, handles appeals. Judged
internally on how much fraud they catch *and* on how few real players they ban by
mistake. Works in a queue, not in a data-science notebook.

**This role is real and hiring.** Rockstar Games is hiring a *Senior Trust &
Safety Analyst, Creator Platform* (posted 17 Jul 2026, updated 10 Sep 2026)
**`[SOURCED]`**
([rockstargames.com](https://www.rockstargames.com/careers/openings/position/7806748003)).
Honest scope note: that role moderates player-made content on FiveM/RedM, not
payment fraud. The *Trust & Safety Senior Enforcement Analyst* posting we first
cited has closed (the link now returns 404), so we no longer name it.
Typical listed requirement is 1–5 years in Trust & Safety, fraud operations or
customer service — i.e. **an operator, not an engineer**. That matters for our
product: the output has to be a readable explanation, not a risk vector.

**Companies where this problem visibly exists** (all publicly documented as
fighting account/item transfer abuse):

- **Roblox** — states in its own SEC filing that users make "fraudulent use of
  credit cards owned by others to purchase Robux and offer the purchased Robux
  for sale at a discount on third-party websites" **`[SOURCED]`**
  ([FY2024 10-K](https://www.sec.gov/Archives/edgar/data/1315098/000131509825000033/rblx-20241231.htm)).
  This sentence *is* our threat model, written by the victim.
- **Valve** — killed CS:GO key trading outright because of it (see §7).
- **Jagex, Riot Games, Square Enix (FFXIV)** — all three explicitly prohibit
  account selling/trading/transfer in their terms and run enforcement teams
  against RMT **`[SOURCED]`**
  ([Square Enix RMT policy](https://support.eu.square-enix.com/faqarticle.php?id=455&la=2&kid=12802),
  [EVE Online RMT policy](https://support.eveonline.com/hc/en-us/articles/7370633552284-Real-Money-Trading-RMT)).

**Why they buy:** they currently reconstruct trade chains by hand in SQL or
spreadsheets. Manual graph-tracing does not scale past a few dozen accounts.

### Persona B — Payments / Risk Lead at a merchant-of-record or payment platform

**The person.** Owns the chargeback ratio with card networks. Their nightmare is
crossing scheme monitoring thresholds, not any individual bad player.

**Why this persona is the highest-value one:** as merchant of record, the
chargeback lands on *them*, not on the studio. In its own press boilerplate
Xsolla says it "operates as the merchant of record across 200+ geographies" and
"supports major gaming titles like Valve, Twitch, Roblox, Ubisoft, Epic Games,
Take-Two, KRAFTON, Nexters, NetEase, Playstudios, Playrix, miHoYo, and more"
**`[SOURCED]`**
([Xsolla press release, 26 Aug 2026](https://xsolla.prezly.com/xsolla-announces-five-year-partnership-with-the-global-esports-federation)).
Xsolla does not say it is merchant of record *for* each of those names, and we
do not claim it. Every laundered purchase where Xsolla is merchant of record is
its liability.

Comparable buyers: **Xsolla, Coda Payments, Stash, Appcharge, Nuvei's gaming
vertical.**

**Why they buy:** a payment-time fraud score they already own tells them nothing
about the account that received the goods ninety seconds later.

### Persona C — Game Economy Designer / Live-Ops Lead

**The person.** Owns sinks, faucets and item value. Laundering is an *inflation*
problem for them, not a security problem — mule farms distort the economy they
are paid to balance.

**Why they buy:** they are the internal champion who explains to finance why the
T&S tool deserves budget. Weakest buyer, strongest advocate.

> **Primary target for the MVP: Persona B.** They carry the loss directly,
> they have an existing risk budget line, and one integration covers hundreds of
> titles at once.

---

## 2. Market size

### The legitimate market that the black market rides on

| Figure | Value | Type | Source |
|---|---|---|---|
| Global virtual goods market, 2025 | **$118.46B** | `[SOURCED]` | [SNS Insider](https://www.snsinsider.com/reports/virtual-goods-market-10293) |
| Game items as share of that market | **~44.35%** (≈ $52.5B) | `[SOURCED]` | SNS Insider (same) |
| CS2 skin economy total market cap, 10 Sep 2026 | **$6.18B** | `[SOURCED]` | [CSMarketCap](https://csmarketcap.com/) |

> **Caveat we will state out loud:** third-party CS2 valuations vary from ~$3B to
> ~$8B depending on methodology
> ([SkinVS](https://www.skinvs.com/articles/cs2-skin-market-8-billion-2026-growth),
> [SteamAnalyst](https://www.steamanalyst.com/guides/cs2-market-report-2026)).
> We quote the low tracker figure on purpose. A single game's *tradeable* item
> economy being worth billions is the point; the exact billion is not.

### Fraud and chargeback loss

| Figure | Value | Type | Source |
|---|---|---|---|
| **Roblox chargebacks from all fraud, FY2024** | **3.41% of bookings** | `[SOURCED]` | [Roblox FY2024 10-K](https://www.sec.gov/Archives/edgar/data/1315098/000131509825000033/rblx-20241231.htm) |
| Roblox chargebacks from *this* (stolen-card Robux) fraud, FY2022 | 3.16% of bookings — narrower metric than FY2024's "all fraud" | `[SOURCED]` | [Roblox FY2022 10-K](https://www.sec.gov/Archives/edgar/data/1315098/000131509823000035/rblx-20221231.htm) |
| Roblox chargebacks **and refunds**, "some of which may have been related to fraud", FY2025 | 2.5% of bookings — Roblox changed the metric; fraud is no longer isolated | `[SOURCED]` | Roblox FY2025 10-K (filed 11 Feb 2026) |
| Roblox bookings, FY2024 | $4,369.1M | `[SOURCED]` | FY2024 10-K, revenue-to-bookings reconciliation |
| ⇒ **Roblox fraud chargebacks, FY2024, in dollars** | **≈ $149.0M** | `[SOURCED]` (arithmetic on two sourced figures: 4,369.1 × 3.41%) | — |
| Roblox "Infrastructure and trust & safety" expense line, FY2024 | $915.4M — **mostly data centres**; the 10-K says it consists "primarily of expenses related to the operation of our data centers and technical infrastructure" | `[SOURCED]` | FY2024 10-K |
| Average merchant chargeback rate across Sift's network, Q3 2025 | 0.26% | `[SOURCED]` | [Sift Q4 2025 Digital Trust Index](https://sift.com/index-reports-disputes-q4-2025/) — Sift's customer network, not the whole industry |
| Global chargeback losses | $33.79B (2025) → $41.69B (2028) | `[SOURCED]` | Sift Q4 2025 Index |
| US merchant true cost per $1 of **fraud** | **$4.61** | `[SOURCED]` | [LexisNexis True Cost of Fraud, 2 Apr 2025](https://risk.lexisnexis.com/about-us/press-room/press-release/20250402-tcof-ecommerce-and-retail) (Sift re-quotes it as "per $1 in chargebacks"; the primary source says per $1 of fraud) |
| First-party fraud share of reported fraud | 36% (up from 15% prior year) | `[SOURCED]` | Sift Q4 2025 Index |

**The single most important comparison on this page:**

> Roblox's FY2024 fraud chargeback rate is **3.41%** — roughly **13× the 0.26%
> average across Sift's merchant network**. (FY2025's combined chargebacks-and-
> refunds figure, 2.5%, is still ~10× that average.) A game platform with a liquid secondary market for
> its currency does not have a normal chargeback profile. That gap is the
> market.

### The black market itself — where we could NOT get a clean number

**`[NOT FOUND]`** — There is no credible, recent, public estimate of total RMT /
in-game black-market volume. What exists in public sources is stale academic
work: ~$2.1B/yr US RMT in 2011, ~$2B global primary+secondary in a 2007 analysis
([Virtual Economy Research Network](https://virtual-economy.org/how_big_is_the_rmt_market_anyw/)).
Those are 15–19 years old and we will **not** present them as a 2026 TAM.

Instead we anchor the market on documented *victim-side* loss (Roblox's $149M in
one year, one company) rather than on an unmeasurable illicit-market size. This
is a deliberate choice and it is a stronger argument: a buyer's budget comes from
their own P&L, not from the criminal's revenue.

**Documented laundering cases (qualitative evidence, not sizing):**

- ~$10M laundered through Twitch Bits via stolen cards `[SOURCED, secondary]`
  ([AML RightSource](https://www.amlrightsource.com/resources/digital-deception-financial-crime-in-esports-and-online-gaming))
- Fortnite V-Bucks bought with stolen cards, resold at a discount on dark web /
  social `[SOURCED, secondary]`
  ([RUSI](https://www.rusi.org/explore-our-research/publications/rusi-newsbrief/gaming-system-money-laundering-through-online-games))
- 300+ Roblox users caught laundering via fake in-game items, March 2023
  `[SOURCED, secondary]` (AML RightSource)

---

## 3. What Xsolla loses today

**Xsolla does not publish total payment volume or GMV. `[NOT FOUND]`** So we build
up from what *is* public, and show every step.

### Step 1 — the disclosed volume floor

| Input | Value | Type |
|---|---|---|
| Xsolla direct-to-consumer **PC** transactions, 2025 | **> $1.0B** | `[SOURCED]` — Xsolla's own data, published as a sponsored guest post on [PocketGamer.biz, 23 Jun 2026](https://www.pocketgamer.biz/xsolla-data-reveals-direct-to-consumer-pc-game-transactions-surpassed-1-billion-in-2025/); covers Xsolla's publisher network only |
| Games in that figure | 1,000+ titles | `[SOURCED]` (same) |
| Average transaction value | just over $15 | `[SOURCED]` (same) |
| ⇒ implied transaction count | **~66 million transactions** ($1.0B ÷ $15) | `[SOURCED]` arithmetic |

This is **PC D2C only**. Xsolla also runs mobile, web shops, and MoR for console
publishers. Total volume is therefore materially higher — we just cannot say how
much higher without inventing a number.

### Step 2 — apply a chargeback rate band

We do **not** assume Roblox's 3.41%. Roblox is an extreme case (deep off-platform
Robux resale). We bracket instead:

| Scenario | Rate | Basis | Disputed volume on $1B |
|---|---|---|---|
| Floor | 0.26% | Cross-industry average `[SOURCED]`, Sift Q4 2025 | **$2.6M** |
| Central | **1.00%** | `[ASSUMPTION]` — chosen as roughly the geometric midpoint of the 0.26%–3.41% sourced band, reflecting that games sit above general e-commerce but below UGC-currency platforms | **$10.0M** |
| Roblox-like | 3.41% | Roblox FY2024 `[SOURCED]` | $34.1M |

**On the disclosed PC D2C slice alone**, the central case is **$10M/year of
disputed volume** flowing through Xsolla as merchant of record.

### Step 3 — what that costs beyond the face value

Applying the sourced US multiplier of **$4.61 of true cost per $1 of fraud**
(fees, review labour, scheme penalties, lost good customers) `[SOURCED, LexisNexis]`:

- Central case: $10.0M × 4.61 = **~$46M/year in total economic cost** on the PC
  D2C slice alone.
- We consider this an **upper bound** — the multiplier is cross-industry, and
  digital goods have lower fulfilment cost than physical. A conservative 2.0×
  gives **~$20M**. `[ASSUMPTION]`

### Step 4 — sanity check against revenue

Xsolla's revenue is **not officially disclosed**. A third-party aggregator lists
**$104.5M (2025)** `[SOURCED, LOW CONFIDENCE — third-party estimate, not a
company filing]` ([GetLatka](https://getlatka.com/companies/xsolla.com)). If that
figure is even directionally right:

| Case | Disputed volume | As % of estimated revenue |
|---|---|---|
| Floor (0.26%) | $2.6M | ~2.5% |
| Central (1.00%) | $10.0M | ~9.6% |

> **We will say this on stage in exactly these words:** Xsolla has not published
> its GMV, so we are not going to pretend we know it. What we know is that on the
> one billion dollars they *did* publish, a one-percent dispute rate is ten
> million dollars — and none of today's payment-time tooling can tell them where
> the goods went afterwards.

---

## 4. Pricing model

Three viable models. Pros, cons, and one recommendation.

### Option 1 — Per-transaction / per-event

**Shape:** $0.01–$0.05 per value-transfer event analysed (trade, gift,
marketplace sale, key redeem). Benchmark: Kount Essentials is reported at
**about $0.07 per transaction** on third-party listing sites (Kount's own page says "request a quote") `[SOURCED, secondary]`
([chargeback.io](https://www.chargeback.io/blog/kount-alternatives)) — but note
that Kount prices *payment* transactions, while we price *post-purchase transfer*
events, which are far more numerous in a tradeable economy.

| Pros | Cons |
|---|---|
| Scales naturally with customer size | Games with heavy trading get punished for having exactly the economy we serve |
| Familiar to payments buyers | Unpredictable bill → procurement friction |
| Zero-risk entry for small studios | Revenue is lumpy; hard to forecast |

### Option 2 — Per-seat SaaS

**Shape:** $500–$1,500 / analyst seat / month, tiered by event volume.
Benchmark: Sift's observed median annual contract value is **$150,000**, range
**$29,600–$600,000** across 45 analysed deals `[SOURCED, secondary]`
([Vendr](https://www.vendr.com/marketplace/sift-science)); small/mid-market
deals land at **$40k–$100k** for 100K–500K events/month.

| Pros | Cons |
|---|---|
| Predictable revenue; easy to forecast | Caps our upside on huge customers |
| Matches how T&S teams are actually staffed (Persona A) | Seat-counting penalises automation — bad incentive |
| Standard, no procurement education needed | Doesn't tie our price to value delivered |

### Option 3 — Percentage of prevented loss

**Shape:** 10–20% of the value of confirmed-and-clawed-back laundering. Analogous
to Signifyd, whose guaranteed-protection fee is reported at **0.5–1% of GMV**
`[SOURCED, secondary]` ([Ringly](https://www.ringly.io/blog/signifyd-alternatives)).

| Pros | Cons |
|---|---|
| Easiest possible sale — customer risks nothing | **Attribution is a nightmare**: proving a ring *would have* cashed out is arguable |
| Aligns us perfectly with customer outcome | Perverse incentive to over-flag; directly contradicts our human-in-the-loop, low-false-positive design |
| Great PR narrative | Revenue unforecastable → uninvestable |

### Recommendation

> **Hybrid, weighted to Option 2, with Option 3 as a pilot-only sweetener.**
>
> - **Land:** 90-day paid pilot at **$5,000 flat**, one dataset, one team. Cheap
>   enough to sign without a committee.
> - **Expand:** **$60,000/year** platform fee for a mid-size studio (event volume
>   up to ~5M transfer events/month), rising to **$150,000–$250,000** for a
>   payment platform / MoR at Xsolla's scale. `[ASSUMPTION]` — anchored
>   deliberately **below** Sift's $150k median ACV, because we are an *add-on
>   module* alongside existing payment fraud tooling, not a replacement for it.
> - **Optional rider:** 10% of clawed-back value, **capped at 1× the platform
>   fee**, offered only in year one to de-risk the first signature.

Rationale for landing under Sift: our wedge is that we are complementary. Pricing
like a replacement invites a comparison we would lose today; pricing like a module
gets us into the budget that already exists.

---

## 5. ROI calculation — one customer, end to end

**Customer:** mid-size studio, tradeable in-game economy, live PC/mobile title.

| # | Line | Value | Type |
|---|---|---|---|
| 1 | Annual bookings | **$50,000,000** | `[ASSUMPTION]` — the "90+ games above $1M, 15+ above $10M" tier in Xsolla's own 2025 PC D2C data `[SOURCED]` puts a realistic mid-size D2C studio in the tens of millions |
| 2 | Fraud chargeback rate | **1.70%** | `[ASSUMPTION]` — exactly **half** of Roblox's disclosed 3.41% `[SOURCED]`, discounted because most studios have a shallower off-platform resale market than Robux |
| 3 | Direct chargeback loss (1 × 2) | **$850,000 / yr** | arithmetic |
| 4 | True-cost multiplier | **2.0×** | `[ASSUMPTION]` — deliberately conservative; the sourced US figure is 4.61× per $1 of fraud `[SOURCED, LexisNexis]` and we are cutting it by more than half |
| 5 | Total annual economic loss (3 × 4) | **$1,700,000 / yr** | arithmetic |
| 6 | Share of that loss involving post-purchase transfer (mule → hub) | **60%** | `[ASSUMPTION]` — Valve's own statement that "nearly all key purchases that end up being traded or sold on the marketplace are believed to be fraud-sourced" `[SOURCED]` suggests the transfer-linked share is high in tradeable economies; we discount from "nearly all" to 60% |
| 7 | Addressable loss (5 × 6) | **$1,020,000 / yr** | arithmetic |
| 8 | Detection + clawback effectiveness | **30%** | `[ASSUMPTION]` — fraction of addressable loss actually stopped by finding the ring before cash-out. Unvalidated: we have only synthetic-data results, and we will say so. |
| 9 | **Annual value delivered (7 × 8)** | **$306,000 / yr** | arithmetic |
| 10 | Our price | **$60,000 / yr** | recommended pricing, §4 |
| 11 | **Net annual benefit** | **$246,000** | arithmetic |
| 12 | **ROI** | **5.1×** | arithmetic |
| 13 | **Payback period** | **2.4 months** | $60,000 ÷ ($306,000 ÷ 12) |

### Downside case — what if we are 3× worse than we think?

Set line 8 to **10%** instead of 30%:

- Value delivered: **$102,000/yr** → still **1.7× ROI**, **payback in 7.1
  months**.

**The pitch sentence:** *even if our detection is three times worse than we
assume, the tool still pays for itself inside one fiscal year.*

### Breakeven — the honest floor

The tool stops paying for itself below **$0.06 of prevented loss per $1 of
price**, i.e. detection effectiveness of **5.9%** at these assumptions. Anything
above that and the customer is up.

---

## 6. Competitor pricing benchmark

| Vendor | Model | Public price | Type |
|---|---|---|---|
| **Sift** | Volume-based subscription | Median ACV **$150,000/yr**; range **$29.6K–$600K**; $40K–$100K at 100K–500K events/mo | `[SOURCED, secondary]` — [Vendr](https://www.vendr.com/marketplace/sift-science), anonymised deal data, not a published rate card |
| **Kount** (Equifax) | Per-transaction + tiered | Essentials listed at **~$0.07/transaction** (third-party listings); Advanced from **$1,000/mo** | `[SOURCED, secondary]` — [chargeback.io](https://www.chargeback.io/blog/kount-alternatives) |
| **Signifyd** | % of GMV, guaranteed protection | **0.5%–1.0% of GMV** | `[SOURCED, secondary]` — [Ringly](https://www.ringly.io/blog/signifyd-alternatives) |
| **Chargeflow** | Success-fee on recovered chargebacks | `[NOT FOUND]` — no public rate | — |
| **Justt** | Success-fee chargeback representment | `[NOT FOUND]` — no public rate | — |

**Critical honesty note for the judges:** *none* of these companies publish a rate
card. Every figure above is a third-party reconstruction from anonymised deal
data or vendor comparison blogs. We flag this rather than present it as fact.
The *shape* of the market is reliable (five- to six-figure annual contracts, or
sub-ten-cents per transaction); the exact digits are not.

**Where we sit:** at $60K/yr we are below Sift's median and inside Sift's
small/mid-market band — priced as an add-on, not a rip-and-replace. None of the
five vendors above analyses account-to-account value flow *after* the payment
clears. That is not a pricing advantage; it is a category gap.

---

## 7. Buy vs build defence

### 7a. The need is real — and the victims say so themselves

We do not have to argue that post-purchase laundering exists. Three parties have
already said it in public, in their own words:

1. **Valve, October 2019** `[SOURCED]`
   ([blog.counter-strike.net](https://blog.counter-strike.net/2019/10/26113/)):
   > "worldwide fraud networks have recently shifted to using CS:GO keys to
   > liquidate their gains" … "nearly all key purchases that end up being traded
   > or sold on the marketplace are believed to be **fraud-sourced**."

   Valve's fix was to **delete the feature** — newly purchased keys became
   permanently non-tradeable. That is what a company does when it has no
   detection capability: it amputates the economy. **Our product is the
   alternative to amputation.** This is the strongest single data point in this
   entire document.

2. **Roblox, FY2024 10-K** `[SOURCED]` — discloses the exact mechanism (stolen
   cards → Robux → discounted resale on third-party sites) and quantifies the
   damage at **3.41% of $4.37B bookings ≈ $149M**. A company writes this in an
   SEC risk factor only when it is unsolved.

3. **Xsolla, GameTech Bootcamp Baku 2026 workshop** `[SOURCED — INTERNAL:
   bootcamp workshop slide by Rauf Aliyev, Backend Developer, Xsolla; no public
   URL exists for this]` — "retry and abuse protection" was presented as an
   **open, not-yet-built** part of the platform.

> **Judge-proofing note:** point 3 has no public URL and we will introduce it as
> what it is — a statement made in this bootcamp's own workshop. Points 1 and 2
> are independently verifiable and carry the argument on their own.

### 7b. Why Xsolla would pay rather than build it in-house

The need being real does not mean the *purchase* is real. Separate argument:

**1. It is not on their roadmap's critical path.**
Xsolla's disclosed 2026 activity is expansion-shaped: acquiring a Vietnam entity
to become the first licensed MoR in that market
([BusinessWire, Mar 2026](https://www.businesswire.com/news/home/20260304005149/en/Xsolla-Strengthens-Presence-in-Emerging-Markets-With-Vietnam-Acquisition-and-Becomes-the-First-Licensed-Merchant-of-Record-Solution-in-the-Country))
and opening a payment-provider portal
([BusinessWire, May 2026](https://www.businesswire.com/news/home/20260527090518/en/Xsolla-Opens-a-Dedicated-Portal-for-Payment-Providers-Unlocking-Direct-Access-to-Thousands-of-Video-Game-Titles-Worldwide))
`[SOURCED]`. Both are geographic/distribution growth. Graph-based post-purchase
forensics competes for engineering time against revenue expansion — and loses,
every planning cycle. That is precisely the gap a vendor fills.

**2. They do not own the data they would need — but they own the pipe.**
Xsolla sees the *payment*. The trade, gift and marketplace events happen inside
1,000+ different games. Building this internally means Xsolla defining an event
schema and convincing 1,000 studios to emit it. **That is a product problem, not
a platform problem** — a standardised event contract that any game can push to
(exactly what [`docs/api-contract.md`](./api-contract.md) specifies). A vendor
can define a cross-studio standard in a way a single MoR competing for publisher
trust finds politically harder.

**3. The build cost is not the model — it is the labelled data and the workflow.**
Louvain and taint propagation are a weekend of engineering. Eighteen months of
confirmed-fraud labels, an analyst review queue, appeal handling, and a false-
positive rate low enough that you dare act on it — that is the moat, and it is
the part in-house teams consistently underestimate.

**4. The budget already exists and is enormous.**
Roblox reports a combined **"Infrastructure and trust & safety"** expense line
of **$915.4M for FY2024** `[SOURCED, 10-K]`. Most of that is data centres, so we
do not quote it as trust & safety spend. What it does show: Roblox files trust &
safety next to infrastructure, as a core operating cost rather than a side project.

**5. Regulatory direction of travel.**
The gaming industry is repeatedly flagged for weak KYC/AML controls around
virtual currency
([RUSI](https://www.rusi.org/explore-our-research/publications/rusi-newsbrief/gaming-system-money-laundering-through-online-games),
[ACAMS](https://www.acams.org/en/opinion/the-potential-perils-of-online-gaming))
`[SOURCED]`. A merchant of record in 200+ geographies has a structural reason to
be able to *demonstrate* traceability of value flow before a regulator asks. We
do not claim a specific regulation mandates this today — **`[NOT FOUND]`**, we
found no gaming-specific virtual-item AML rule currently in force.

### 7c. The honest counter-argument

A judge should hear that we know the weak points:

- **We have no real-world validation.** All results are on synthetic data. Our
  30% effectiveness assumption is unproven.
- **A large platform could build a v1 in a quarter** if it decided to. Our defence
  is priority and cross-studio data standardisation, not technical difficulty.
- **The first sale is slow.** T&S tooling touches player bans; procurement and
  legal review are long. The $5,000 pilot exists specifically to shorten this.

---

## 8. Slide-ready summary

Five bullets. Each contains one number. Copy directly to the Monetization slide.

1. **Roblox disclosed to the SEC that 3.41% of its $4.37B FY2024 bookings — about
   $149M — was lost to fraud chargebacks, and named our exact threat model:
   stolen cards → in-game currency → discounted resale off-platform.**
   *(Roblox FY2024 10-K)*

2. **That rate is 13× the 0.26% average chargeback rate across Sift's merchant
   network. One tradeable in-game economy, thirteen times the exposure.**
   *(Sift Q4 2025 Digital Trust Index; Roblox FY2025 reports chargebacks and
   refunds combined at 2.5%, still ~10×)*

3. **Valve's answer in 2019 was to delete CS:GO key trading entirely, stating
   "nearly all" traded keys were fraud-sourced. We are the alternative to
   amputating your own economy.** *(Valve official blog, Oct 2019)*

4. **On the $1B of PC D2C volume Xsolla published for 2025, a 1% dispute rate is
   $10M a year — and no payment-time tool can tell them where the goods went
   afterwards.** *(Xsolla data via PocketGamer.biz; 1% is our stated assumption
   inside a sourced 0.26%–3.41% band)*

5. **At $60K/year — under Sift's $150K median contract — a $50M-bookings studio
   pays this back in 2.4 months, and still in under 7 months if our detection is
   3× worse than assumed.** *(Sift ACV via Vendr; ROI model in §5)*

---

## Appendix — numbers we deliberately did NOT use

Being able to name what we rejected is part of the credibility argument.

| Claim seen in sources | Why we rejected it |
|---|---|
| "10% of all digital gaming transactions are suspected fraudulent" | Circulates widely in vendor blogs with no traceable primary source. Too good to use. |
| "$2.1B/yr US RMT market" | Real academic figure but from **2011**. Presenting a 15-year-old number as 2026 TAM is misleading. |
| "Global RMT / black market is $X billion today" | **`[NOT FOUND]`** — no credible recent public estimate exists. We refused to invent one. |
| Xsolla total GMV / TPV | **`[NOT FOUND]`** — not disclosed. We used only the published $1B PC D2C figure and labelled it as a floor. |
| CS2 skin market "$8 billion" | Higher tracker estimates exist; we quote the lower $6.18B figure to stay conservative. |
| Xsolla revenue $104.5M | Used **only** as a sanity check, explicitly flagged as a third-party aggregator estimate, not a filing. |

---

*Compiled 10 September 2026. Every sourced figure was retrieved from the linked
URL on that date. No confidential or proprietary Xsolla data is used anywhere in
this document.*
