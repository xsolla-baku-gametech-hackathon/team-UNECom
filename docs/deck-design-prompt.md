# Design brief — pitch deck for "Fraud Radar" (Team UNECom)

You are designing a 3-minute hackathon pitch deck for a jury of payments-industry professionals. Read the whole brief before you draw. Every word of on-slide copy and every number is given here verbatim. Your job is layout, typography and rhythm. **If a word or a number is not in this brief, it does not go on a slide.**

---

## 0. What the deck has to do

Three things, in this order of importance:

1. **Read as trusted, not generated.** A jury member should be able to point at any number and find its source on the same slide. Assumptions are labelled as assumptions, next to the number. Nothing is decorative.
2. **Carry one headline per slide.** Each slide has a thesis sentence set very large. A person who reads only the headlines, in order, gets the whole pitch. The headline is the most emphasised thing on every slide; everything else supports it.
3. **Belong to the product.** The screen cuts from slide 3 to the live product (a dark dashboard) and back to slide 4. The deck uses the product's own colours and typefaces so the cuts feel like the slide coming alive, not like switching apps.

What the deck must **not** contain: gradients; glassmorphism or blur; drop shadows; emoji; icon-set icons; illustrations, 3D objects, mascots, abstract shapes or particle backgrounds; purple/blue/teal accents; centred-everything layouts; decorative dividers; the typefaces Inter, Poppins, Montserrat, Space Grotesk or Manrope; placeholder text; invented statistics; fake charts; a "Thank you" or "Questions?" slide; any dollar figure for a pilot or a deal.

---

## 0.5 The look — you are the most tasteful slide designer in the room

The constraints above stop the deck from looking generated. They do not make it beautiful; that part is yours. The target: the restraint of a Swiss typographer setting a financial report, on the dark ground of a trading terminal. Beauty here comes from four things, and you are judged on all four:

1. **Air.** Most of every slide is empty ground. The headline and one content block sit in the upper-left two-thirds; the lower-right breathes. Never fill a slide because space is available. A slide with a 96 px headline, one number block and a source line, and nothing else, is finished.
2. **Tension of scale.** Giant Plex Mono numbers against small, quiet Plex Sans captions. The contrast between 200 px and 28 px on the same slide is the visual signature; do not soften it with medium sizes in between.
3. **Rhythm.** The same three zones at the same coordinates on every slide, so flipping through feels like one document breathing. Then two deliberate breaks in that rhythm: 01a (black, one quotation, nothing else) and 06 (the only orange, the only photographs). Those two slides are the drama; everything between them is calm.
4. **Two set pieces.** The value-flow graph on 01b and the nine-step funnel on 03 are the deck's only pictures. Treat them as sculpture: precise, monochrome, generous in size, placed with the same care as the type. The graph is the product's own truth; the funnel is the bootcamp's shared language. Nothing else on the deck competes with them.

Composition is asymmetric and left-anchored throughout: headline and text flush-left on the margin, visual weight in the right two-thirds only where a set piece lives. Alignment is exact — a viewer should be able to lay a ruler along the left edge of every text block on every slide. Where two elements sit side by side, their baselines match. Spacing steps are multiples of 32 px.

When a choice is between "more" and "less", choose less, then make what remains larger and better aligned. That is the whole aesthetic.

---

## 1. Context

**Product.** Fraud Radar is an investigation dashboard for game economies. Fraud tools on the market (Sift, Kount, Magify) score the *payment*: was this card stolen? Fraud Radar starts after the payment clears and traces where the in-game value *goes* — trades, gifts, marketplace sales, key redemptions — and finds laundering rings: many freshly created "mule" accounts buying with bad cards and forwarding value to a "cash-out hub" that never touches a flagged card itself. A human analyst confirms or rejects each case. Nothing is auto-banned.

**Team.** UNECom, five people, 48-hour build. Public repo: `github.com/xsolla-baku-gametech-hackathon/team-UNECom`.

**Event.** GameTech Bootcamp Baku 2026, final pitch on 11 September 2026 at 15:00. 3 minutes on stage, 2 minutes Q&A. Jury: an international team from Xsolla. All copy is English.

**Organiser's own instructions, which this deck follows literally.** The organiser's participant deck lists six expected slides — *What you built · The problem · Your solution · Features & users · Monetization · Your team* — and defines "Your solution" as *"how it solves the problem, what makes it unique and innovative, and which technologies you used."* So slide 3 names the technologies. A bootcamp speaker, Mansur Mustafayev, presented every problem in a fixed format — a large headline, then **Problem:** one sentence, then **Build:** one sentence, then one grey line of advice — and showed a nine-step funnel called "How money moves in a game". Slide 3 borrows both, with attribution.

**Stage use — this drives the layout.** One speaker. Slide 1 (two states) and slide 2 run to 0:39. Slide 3 is spoken over for six seconds while the speaker walks to the laptop; at 0:45 the screen cuts to the live dashboard; at 2:06 it cuts back to slides 4–6. Projector in a lit room: nothing meaningful below 28 px at 1920×1080, no weight below 400, no thin lines carrying information.

---

## 2. Deliverable

A Claude Design canvas with seven 1920×1080 artboards, in this order, with these exact names, and nothing else on the canvas:

```
01a Cold open
01b What you built
02  The problem
03  Your solution
04  Features & users
05  Monetization
06  Team + ask
```

The team exports to PDF and presents full-screen, so every artboard is final at 1920×1080: no bleed, nothing outside the frame, no notes, no alternates.

---

## 3. Design system — the product's own

Values are taken from the product's stylesheet and components. Use them as the complete palette; add nothing.

| Role | Value |
|---|---|
| Page ground | `#0a0b0d` |
| Deep panel (funnel bars, photo frames) | `#0d0f12` |
| Panel / rule | `#24282f` |
| Hairline | `#1d2127` |
| Primary text | `#e8e6e1` |
| Secondary text | `#c3c7cc` |
| Muted text (captions, source lines) | `#9aa0a8` |
| Label text (eyebrows) | `#676d76` |
| Accent orange — **exactly once in the deck: the headline of 06** | `#c8792e` |
| Hot — the one phrase on a slide the jury should look at; at most one use per slide | `#e0913f` |
| Red — semantic only: the fraud ring, flagged edges, the two red funnel steps | `#b0473f` |
| Amber — semantic only: the `ASSUMPTION` pill | `#9a8038` |
| Green — semantic only: the `MEASURED` pill | `#4f7a5f` |
| Neutral node fill | `#33383f` |
| Ordinary edge | `#3a4048` |

**Typefaces** (Google Fonts; all three are already used by the product):

- **IBM Plex Sans** — headlines, body, captions. Weights 400, 600, 700.
- **IBM Plex Mono** — every number, every source line, every code token (`/events`, `events.csv`, `hub_1`). Weights 400, 600. Always tabular figures.
- **Barlow Semi Condensed** — uppercase labels only: eyebrows and pills. Weight 600–700, letter-spacing 0.15em. This is the product's label style and the one detail that ties deck to dashboard.

**Type scale, px at 1920×1080. Use these values and nothing between them.**

| Role | Size | Face / weight |
|---|---|---|
| Eyebrow, pill | 24 | Barlow 600, uppercase |
| Caption, source line | 28 | Plex Mono 400 / Plex Sans 400 |
| Body | 36 | Plex Sans 400 |
| Sub-head, table cell | 40 | Plex Sans 400 / 600 |
| **Headline** | **96** | **Plex Sans 700**, `text-wrap: balance`, max 2 lines, line-height 1.05 |
| Secondary number | 120 | Plex Mono 600 |
| Hero number | 200 | Plex Mono 600 |

**The headline rule.** Every artboard except 01a has one headline at 96 px, top-left of the content zone, on the same baseline on every slide. At least 64 px of clear space separates the headline's last line from the first content element. The hot phrase never breaks across lines and carries no extra space before the following punctuation or word (`the analyst, not` — not `the analyst , not`). It is a full sentence with a full stop, never a label. One phrase inside it may be set in Hot `#e0913f`; that is the slide's single hot use. No other text on the slide is larger than 40 px except the number blocks named in §5.

**Grid.** 12 columns, 96 px margin on all four sides, 32 px gutter. Left-aligned. Three fixed horizontal zones on every slide except 01a:

- **Top band, y 96–150:** at left, a filled pill (see below) followed by the eyebrow `01 · WHAT YOU BUILT` (slide number · section name) in Barlow 24 `#676d76`. At right, `UNECom` in Plex Mono 24 `#676d76`.
- **Headline, baseline at y 300.**
- **Content zone, y 380–880.**
- **Source line, y 930–984:** the eyebrow `SOURCE` in Barlow, then the sources in Plex Mono 28 `#9aa0a8`, separated by ` · `. Present on 01b, 02, 03, 04, 05, 06. It is how the deck says "verified"; it is never dropped.

**Pills.** Filled, Barlow 24 uppercase, letter-spacing 0.15em, padding 8 px / 16 px, radius 4 px. Three exist:

| Pill | Fill | Text |
|---|---|---|
| `SOURCED` | `#24282f` | `#c3c7cc` |
| `ASSUMPTION` | `#9a8038` | `#0a0b0d` |
| `MEASURED` | `#4f7a5f` | `#0a0b0d` |

The pill in the top band states the slide's evidence class. A pill may also sit directly beside a number where §5 places it. Pills never appear anywhere else.

**Rules and containers.** Horizontal rules 1 px `#24282f`. Tables: hairline row dividers, no vertical lines, no fills. No shadows. No radius above 4 px. No boxes around numbers or headlines.

**Motion.** None. 01a → 01b is a hard cut.

---

## 4. "Trusted" — the checklist applied to every artboard

- Headline first, largest, one idea. Numbers second. Source line last.
- Every sourced figure names its document on the source line. Every assumed figure carries the amber `ASSUMPTION` pill beside the number, never only in a footnote. Every figure measured on our own data carries the green `MEASURED` pill.
- Numbers in Plex Mono, tabular, decimals aligned when stacked.
- Identical margins and zone positions on every slide; the deck flips like pages of one report.
- At most three content elements below the headline on slides the speaker talks over (02, 04, 05). The headline does not count.
- No word not in §5. No image except the product graph on 01b and the team photos on 06.
- Nothing that carries meaning is below `#9aa0a8` in brightness or 28 px in size.

---

## 5. Slide-by-slide — verbatim copy

Copy every string exactly, including capitalisation and middle dots. Do not paraphrase or add.

### 01a · Cold open

Pure `#0a0b0d`. No top band, no headline, no source line. One quotation, Plex Sans 64 weight 400 `#e8e6e1`, left-aligned block no wider than 8 columns, vertically centred:

> "nearly all key purchases that end up being traded or sold on the marketplace are believed to be fraud-sourced"

Beneath it, Plex Mono 28 `#9aa0a8`:

> Valve · blog.counter-strike.net · October 2019

Nothing else. Its job is silence before the speaker's first sentence.

### 01b · What you built

Top band: pill `MEASURED` · eyebrow `01 · WHAT YOU BUILT`.

**Headline:** `Every tool stops at the payment. We start there.` — hot phrase: `We start there.`

Background, right two-thirds of the frame: the product's value-flow graph (§6), dimmed so no pixel is brighter than `#24282f`, un-cropped, un-blurred, un-rotated. It must read as the real tool, not as decoration.

Content zone, left 6 columns:

- `Fraud Radar` — Plex Sans 40 weight 700
- `Post-Purchase Value Flow` — Plex Sans 40 weight 400 `#c3c7cc`
- `We trace where in-game value goes after the payment clears.` — Plex Sans 36
- `trade · gift · marketplace sale · key redeem` — Plex Mono 28 `#9aa0a8`

Source line: `github.com/xsolla-baku-gametech-hackathon/team-UNECom`

### 02 · The problem

Top band: pill `SOURCED` · eyebrow `02 · THE PROBLEM`.

**Headline:** `A tradeable economy is 13× more exposed than normal e-commerce.` — hot phrase: `13×` (set in Plex Mono inside the headline).

Content zone: three numbers in one row, equal columns, baselines aligned, tabular, with the same caption height in all three columns (the first caption is the longest; align the other two to its top, not its bottom):

| Number — Plex Mono 200 `#e8e6e1` | Caption — Plex Sans 36 `#c3c7cc`, max 2 lines |
|---|---|
| `3.41%` | `of Roblox bookings lost to fraud chargebacks, FY2024 — stolen cards → in-game currency → resale off-platform` |
| `≈ $149M` | `the same figure in dollars, on $4.37B of bookings` |
| `0.26%` | `cross-industry average chargeback rate` |

Source line: `Roblox FY2024 Form 10-K (SEC) · Sift Q4 2025 Digital Trust Index`

### 03 · Your solution

Top band: pill `MEASURED` · eyebrow `03 · YOUR SOLUTION`.

**Headline:** `Detect it from the money flow between players, not from the client.` — hot phrase: `the money flow`. This sentence is a bootcamp speaker's own words; it is attributed on the source line.

Content zone, two columns: left 7 columns text, right 5 columns the funnel.

Left column, in the speaker's Problem/Build format:

- Line 1 — `Problem:` in Plex Sans 40 weight 600 `#9aa0a8`, then in `#e8e6e1` 40 weight 400: `stolen-card value is laundered through trades, gifts and marketplace sales after the payment clears.`
- Line 2 — `Build:` in Plex Sans 40 weight 600 `#e8e6e1`, then 40 weight 400: `a value graph of every transfer, four signals per account, Louvain rings, a Claude-written case, a human decision.`
- Beneath, a four-row list in Plex Mono 32, `#c3c7cc`, the weights right-aligned in `#e8e6e1`:

  ```
  tainted value     0.40
  velocity          0.25
  degree imbalance  0.20
  community risk    0.15
  ```

- Below the weights (never beside them), 32 px gap above: one grey line, Plex Sans 32 `#9aa0a8`: `Nothing is auto-banned. Be honest about false positives.`
- Below that, the stack line, Plex Mono 28 `#9aa0a8`: `Python · FastAPI · networkx · Node · Fastify · Prisma · React · Vite`

Right column, the funnel: nine horizontal bars stacked top to bottom, each narrower than the one above (top bar 100 % of the column, bottom bar 55 %, linear taper, bars centred on the column so it reads as a funnel), 44 px tall, 10 px apart, fill `#0d0f12` with a 1 px `#24282f` border, label in Plex Sans 28 `#c3c7cc` left-inside. Bars 5 and 8 are filled `#b0473f` with `#e8e6e1` text. Labels, verbatim:

```
1. Player wants to buy
2. Storefront
3. Identity and age check
4. Choose payment method
5. Bank approves or not
6. Tax and legal seller
7. Give player the item
8. Refunds and chargebacks
9. Studio gets paid
```

A 2 px `#e8e6e1` bracket spans the gap between bars 7 and 8 on the right side, with the label `Fraud Radar works here` in Plex Mono 28 `#e8e6e1`. No percentages on the funnel.

Source line, one line only: `Funnel and "money flow" after M. Mustafayev, GameTech Bootcamp workshop, 9 Sep 2026`

### 04 · Features & users

Top band: pill `SOURCED` · eyebrow `04 · FEATURES & USERS`.

**Headline:** `Built for the analyst, not for a data scientist.` — hot phrase: `the analyst`.

Content zone: a three-row, two-column table, hairline dividers, no header row, column widths 7 / 5. Left cell Plex Sans 40 `#e8e6e1`; right cell Plex Sans 40, role in weight 600, remainder `#c3c7cc`. Code tokens in Plex Mono.

| What | Who |
|---|---|
| `Value-flow graph · Louvain rings · sensitivity slider` | `Trust & Safety analyst` — `Rockstar is hiring this role now` |
| `Claude-written case · human decision · nothing auto-banned` | `Payments / risk lead` — `at a merchant of record` |
| `Drag-and-drop CSV or JSON today · same /events API in production` | `Game economy / live-ops lead` |

Source line: `Rockstar Games — Trust & Safety Senior Enforcement Analyst, open role (themuse.com)`

### 05 · Monetization

Top band: pill `ASSUMPTION` · eyebrow `05 · MONETIZATION`.

**Headline:** `Priced as a module beside your fraud tooling, not a replacement.` — hot phrase: `a module`.

Content zone: three numbers stacked, each on its own hairline-separated row; number in the left 4 columns, explanation in the right 8, a pill beside the number where stated.

| Number — Plex Mono 120 | Explanation — Plex Sans 36 | Pill beside the number |
|---|---|---|
| `$10M / yr` | `a 1% dispute rate on the $1B of PC direct-to-consumer volume Xsolla published for 2025` — and beneath, Plex Mono 28 `#9a8038`: `1% is our assumption, inside the sourced 0.26%–3.41% band` | `ASSUMPTION` |
| `$60K / yr` | `platform fee for a mid-size studio, under Sift's $150K median contract` | `SOURCED` |
| `2.4 months` | `payback for a $50M-bookings studio; 7.1 months if our detection is 3× worse than assumed` | — |

The `2.4 months` row is the slide's most valuable number: set the number in `#e8e6e1` at 120 like the others, but give the row 24 px more vertical space above and below than the other two.

Source line: `PocketGamer.biz, Jun 2026 · Sift Q4 2025 · Vendr (Sift contract data) · Roblox FY2024 10-K · ROI model: business-case.md §5`

### 06 · Team + ask

Top band: pill `MEASURED` · eyebrow `06 · TEAM`.

**Headline, and the deck's only orange:** `One labelled dataset. Ninety days.` — the whole headline in `#c8792e`. No hot phrase on this slide.

Beneath the headline, Plex Sans 36 `#c3c7cc`, one line: `We are not asking you to believe synthetic numbers. Give us real ones.`

Content zone: the team, **five** equal columns (five 240 px frames across the 1728 px content width leaves 132 px gutters). In each column, top to bottom:

- **Photo** — square, 240×240, radius 4 px, 2 px `#24282f` border. The five source photos are shot in five different conditions (daylight street, night with a film filter, grey studio, phone selfie, white studio), so they must be made to match: crop each to a square with the eyes on the same horizontal line and the head filling the same fraction of the frame, then convert **all five to greyscale** with the same contrast. Colour photos in five different palettes on one row read as "pasted in"; five matched greyscale frames read as one team. Place them in the order below. If a photo is missing, draw a `#0d0f12` square of the same size with `(photo)` in Plex Mono 28 `#4b5058` centred.
- **Name** — Plex Sans 36 weight 600, verbatim and in this order: `Nezrin Ceferova` · `Aslan Musayev` · `Sardar Soltanzade` · `Hamid Aslanov` · `Matin Mehdi`.
- **Role** — Plex Sans 28 `#c3c7cc`, two lines in every column (role on line one, stack on line two; a column with no stack keeps an empty second line so the five columns stay level). The five roles, verbatim, are:
  - `Engine / detection` / `Python · FastAPI`
  - `API / data layer` / `Node · Fastify · Prisma`
  - `Dashboard / UX` / `React · Vite`
  - `Data generation & evaluation` / (empty)
  - `Pitch & business case` / (empty)

  Which role sits under which name is set by the team, not by the designer: use the mapping in the section "Name → role" below if it is filled in; if it is not, print `(role)` under every name and leave the second line empty.

**Name → role** (team fills this in; leave `(role)` until it is filled):
| Name | Role |
|---|---|
| Nezrin Ceferova | (role) |
| Aslan Musayev | (role) |
| Sardar Soltanzade | (role) |
| Hamid Aslanov | (role) |
| Matin Mehdi | (role) |

Below the team row, one line in Plex Mono 28 `#9aa0a8` with a `MEASURED` pill at its left:
`docs/accuracy.md · hub recall at default sensitivity: 0% · published, not patched`

Source line: `github.com/xsolla-baku-gametech-hackathon/team-UNECom`

No "Thank you". No "Questions?". The orange headline is the last thing on screen.

---

## 6. The graph on 01b

If the user has attached a screenshot of the dashboard, use it as supplied: dimmed per §5, never cropped to a "nice" region, never recoloured.

If not, draw it on the artboard from this specification, so it reads as real force-directed output rather than a network icon:

- 122 nodes, radius 4–7 px, fill `#33383f`, no stroke.
- One dense cluster of 35 nodes right of centre; the rest scattered unevenly with a few satellite groups of 3–6.
- Inside the cluster one larger node, radius 11 px, fill `#2b2f36`, 2 px stroke `#e8e6e1`: the cash-out hub. Most cluster edges point into it.
- About 380 edges, 1 px `#3a4048`, short inside clusters, a few long between groups. About 30 edges inside the cluster are 2 px `#b0473f`.
- No labels, glow, fades or vignette. Then dim everything so nothing exceeds `#24282f`.

---

## 7. Numbers registry — the only numbers permitted on any slide

`2019` · `3.41%` · `$4.37B` · `≈ $149M` · `0.26%` · `13×` · `FY2024` · `$1B` · `2025` · `1%` · `0.26%–3.41%` · `$10M / yr` · `$60K / yr` · `$150K` · `$50M` · `2.4 months` · `7.1 months` · `3×` · `0%` · `0.40` · `0.25` · `0.20` · `0.15` · funnel step numbers `1`–`9` · `Q4 2025` · `Jun 2026` · `9 Sep 2026` · `§5` · slide numbers `01`–`06` · `122`, `35`, `380`, `30` only as counts inside §6, never as text.

**Explicitly not permitted:** any pilot price, any dollar figure for a deal, `90` as a number (the word "Ninety" appears in the 06 headline as a word, not a digit), percentages on the funnel.

If you find yourself typing any other number, stop — it is not in the brief.

---

## 8. Self-check before you finish

1. Seven artboards, 1920×1080, named and ordered exactly as §2.
2. Every artboard except 01a has one 96 px headline on the same baseline; read the six headlines in order and confirm they tell the pitch on their own.
3. Every string on every slide is in §5. Delete any word that is not.
4. Every number on every slide is in §7. `ASSUMPTION` appears on 05 (top band and beside `$10M / yr`) and nowhere else.
5. Orange `#c8792e` appears exactly once, as the 06 headline. Hot `#e0913f` appears at most once per slide, only inside headlines. Red only on the two funnel bars and in the 01b graph.
6. No gradient, shadow, blur, emoji, icon, illustration or radius above 4 px. No typeface outside Plex Sans / Plex Mono / Barlow Semi Condensed.
7. Top band, headline baseline and source line sit at identical coordinates on 01b–06.
8. Nothing meaningful below 28 px; weights 400 / 600 / 700 only.
9. 02, 04 and 05 have at most three content elements below the headline.
10. 06 has five equal greyscale photo frames of identical size, eyes on one line, names and roles on shared baselines.
11. Nothing outside the frame, nothing overlapping, decimals aligned where numbers stack.
12. Look at each slide as a picture: is at least half of it empty ground, is one thing clearly the largest, could a ruler align every left edge? If any answer is no, remove something.

---

## 9. Out of scope

No speaker notes, no extra slides, no alternative palettes, no light version, no animation, no copy "improvements", no generated imagery. If a constraint here conflicts with taste, the constraint wins: the jury is scoring trust.
