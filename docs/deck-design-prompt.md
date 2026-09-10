# Design brief — pitch deck for "Fraud Radar" (Team UNECom)

You are designing a 3-minute hackathon pitch deck. Read everything below before you draw anything. Every word of on-slide copy and every number is given here verbatim; your job is layout, typography and rhythm, not writing. **If something is not in this brief, it does not go on a slide.**

---

## 0. The one rule

The deck must read as **trusted and verified**, not as generated. A jury of payments-industry professionals will look at it for three minutes and decide whether these people can be handed real fraud data. Every design decision below serves that: sober ground, one typeface family, tabular numbers, a source line on every slide, assumptions labelled as assumptions, and nothing decorative.

Concretely, the deck must **not** contain: gradients of any kind; glassmorphism or blur panels; rounded "card" containers on every element; drop shadows; emoji; stock icons or icon sets; illustrations, 3D renders, mascots, abstract blobs, "tech" particle backgrounds, circuit or hexagon motifs; purple/blue/teal accents; centred-everything layouts; decorative dividers; "modern startup" sans faces (Inter, Poppins, Montserrat, Space Grotesk, Manrope); placeholder text; invented statistics; fake charts; a "Thank you" slide.

Instead, design it the way a financial filing or an incident report is designed: a fixed grid, a small type scale used consistently, generous margins, numbers set in monospace with tabular figures, hairline rules, and citations.

---

## 1. Context you need

**The product.** Fraud Radar is an investigation dashboard for game economies. Fraud tools on the market (Sift, Kount, Magify) score the *payment*: was this card stolen? Fraud Radar starts after the payment clears and traces where the in-game value *goes*: trades, gifts, marketplace sales, key redemptions. From that flow it finds laundering rings (many freshly created "mule" accounts buying with bad cards and forwarding value to a "cash-out hub" that never touches a flagged card itself). A human analyst confirms or rejects each case; nothing is auto-banned.

**The team.** UNECom, four people, built in a hackathon. The repo is public: `github.com/xsolla-baku-gametech-hackathon/team-UNECom`.

**The event.** GameTech Bootcamp Baku 2026, final pitch on 11 September 2026 at 15:00. Format: 3 minutes on stage plus 2 minutes Q&A. The jury is an international team from Xsolla (a games merchant-of-record and payments company). All slide copy is English.

**How the deck is used on stage — this drives the design.** One speaker. Slides 1–2 are shown for the first 44 seconds. At 0:44 the screen cuts to the *live product* (a dark dashboard) for 77 seconds of demo. At 2:05 it cuts back to slides 4–6. The deck therefore inherits the product's visual system exactly, so that the two cuts feel like the slide "coming alive", not like switching apps. The deck is shown from a laptop on a projector in a lit room: minimum body size is 28 px at 1920×1080, no weight lighter than 400, no thin hairline type.

**Slide count.** The organiser's template asks for six slides: What you built · The problem · Your solution · Features & users · Monetization · Your team. Slide 1 has two states (a cold-open build, then the title), so you will produce **seven artboards**. Slide 3 is a near-black placeholder because the solution is shown live.

---

## 2. Deliverable

A Claude Design canvas with seven 1920×1080 artboards in this order and with these exact names:

```
01a Cold open
01b What you built
02  The problem
03  Live demo
04  Features & users
05  Monetization
06  Team + ask
```

Nothing else on the canvas: no cover, no notes board, no alternates. The team will export to PDF and present full-screen, so each artboard is final at 1920×1080 with no bleed and no elements outside the frame.

---

## 3. Design system — inherit the product

These values come from the product's own stylesheet. Use them as the complete palette; do not add colours.

| Role | Value |
|---|---|
| Page ground | `#0a0b0d` |
| Deep panel (used sparingly, e.g. a footer band or a table row) | `#0d0f12` |
| Panel / rule | `#24282f` |
| Hairline | `#1d2127` |
| Primary text | `#e8e6e1` |
| Secondary text | `#c3c7cc` |
| Muted text (captions, source lines) | `#9aa0a8` |
| Label text (uppercase eyebrows) | `#676d76` |
| Dim text | `#4b5058` |
| Accent — orange. **Used exactly once in the whole deck**: the ask line on 06. | `#c8792e` |
| "Hot" number (a number the audience should look at right now; at most one per slide) | `#e0913f` |
| Risk high — red. Semantic only: the fraud ring, a flagged edge. | `#b0473f` |
| Risk elevated — amber. Semantic only: the `ASSUMPTION` tag. | `#9a8038` |
| Risk low — green. Semantic only: the `MEASURED` tag. | `#4f7a5f` |
| Neutral node fill | `#33383f` |
| Ordinary edge | `#3a4048` |

**Typography — three faces, all from Google Fonts, all already used by the product:**

- **IBM Plex Sans** — all running text and headings. Weights 400, 600, 700 only.
- **IBM Plex Mono** — every number, every source line, every code-like token (`/events`, `events.csv`, `hub_1`). Weights 400, 600. Always `font-variant-numeric: tabular-nums`.
- **Barlow Semi Condensed** — uppercase eyebrow labels only (e.g. `THE PROBLEM`, `SOURCE`, `ASSUMPTION`), weight 600–700, letter-spacing 0.15em, size 22–26 px, colour `#676d76`. This is the product's label style; it is the one detail that makes the deck unmistakably belong to the dashboard.

**Type scale (px at 1920×1080).** Use these and nothing in between: 22 (eyebrow), 28 (caption / source line), 36 (body), 48 (sub-head), 64 (heading), 120 (secondary number), 200 (hero number), 260 (single hero number when it is alone on the slide). Headings get `text-wrap: balance`. Running text never exceeds ~60 characters per line.

**Grid.** 12 columns, 96 px outer margin on all sides, 32 px gutter. Left-aligned by default; a single hero number may be centred on its own slide. Every artboard shares the same three horizontal zones:

- **Top band (y 96–160):** eyebrow label at left (`01 · WHAT YOU BUILT` style: slide number, middle dot, section name), team mark `UNECom` at right in Plex Mono 22, colour `#676d76`.
- **Content zone (y 200–880).**
- **Source line (y 920–984), on every slide except 01a and 03:** Plex Mono 28, colour `#9aa0a8`, left-aligned, prefixed by the eyebrow `SOURCE` in Barlow. Multiple sources separated by ` · `. This line is a design element, not a footnote: it is how the deck says "verified".

**Tags.** A tag is Barlow Semi Condensed 22, uppercase, letter-spacing 0.15em, with a 1.5 px border in its own colour and 6 px / 10 px padding, no fill, square corners (2 px radius at most). Three tags exist: `SOURCED` (text and border `#9aa0a8`), `MEASURED` (`#4f7a5f`), `ASSUMPTION` (`#9a8038`). Use them only where this brief places them.

**Rules and containers.** Horizontal rules are 1 px `#24282f`. Tables have hairline row dividers and no vertical lines, no zebra fill, no header fill. Nothing has a shadow. Nothing has a radius larger than 3 px. There are no boxes drawn around numbers.

**Motion.** None. Slide 01a → 01b is a hard cut. Do not design transitions, builds within a slide, or hover states.

---

## 4. What "trusted and verified" looks like — checklist for every artboard

- The numbers are the largest thing; the words explain them; the source line proves them.
- Every figure that came from a document carries its document's name on the source line. Every figure that is our own assumption is tagged `ASSUMPTION` in amber *next to the number*, never hidden in a footnote. Every figure we measured on our own data is tagged `MEASURED`.
- Numbers are set in Plex Mono with tabular figures, so `3.41%` and `0.26%` align at the decimal when stacked.
- Margins are identical on every slide; the eyebrow, team mark and source line sit at the same y on every slide; a viewer flipping through sees a fixed frame with changing content, like pages of one report.
- At most **three content elements** on any slide that the speaker talks over (02, 04, 05). A three-number row is three elements; a three-row table is three elements.
- No word on a slide that is not in §5. No stock imagery. The only image is the product's own graph (§6).
- Text colour is `#e8e6e1` on `#0a0b0d`; secondary `#c3c7cc`; captions `#9aa0a8`. Check contrast of every muted element at projector brightness: nothing below `#676d76` carries information the audience needs.

---

## 5. Slide-by-slide content — verbatim

Copy every string exactly, including capitalisation and the middle dots (`·`). Do not paraphrase, expand, or "improve" copy. Do not add taglines, subtitles, or section intros.

### 01a · Cold open

Pure `#0a0b0d`. No eyebrow, no team mark, no source line. One quotation, Plex Sans 64 weight 400, colour `#e8e6e1`, set as a left-aligned block no wider than 8 columns, vertically centred:

> "nearly all key purchases that end up being traded or sold on the marketplace are believed to be fraud-sourced"

Attribution beneath it, Plex Mono 28, colour `#9aa0a8`:

> Valve · blog.counter-strike.net · October 2019

That is the whole slide. Its job is silence before the speaker's first line.

### 01b · What you built

Eyebrow: `01 · WHAT YOU BUILT`. Team mark at right.

Background: the product's value-flow graph (see §6), dimmed so that its brightest pixel is no lighter than `#24282f`. It must read as a real screenshot of the tool, not as decoration: keep it un-cropped, un-rotated, un-blurred, and anchored to the right two-thirds of the frame.

Content, left-aligned, on the left 7 columns:

- Heading, Plex Sans 64 weight 700: `Fraud Radar`
- Sub-head directly under it, Plex Sans 48 weight 400, colour `#c3c7cc`: `Post-Purchase Value Flow`
- Body, Plex Sans 36, colour `#e8e6e1`, max 2 lines: `We trace where in-game value goes after the payment clears.`
- A row of four tokens in Plex Mono 28, colour `#9aa0a8`, separated by middle dots: `trade · gift · marketplace sale · key redeem`

Source line: `github.com/xsolla-baku-gametech-hackathon/team-UNECom`

### 02 · The problem

Eyebrow: `02 · THE PROBLEM`. Team mark at right.

Three numbers in one horizontal row, equal columns, baselines aligned, each with a caption under it. This is the slide where tabular figures matter.

| Number (Plex Mono 200, `#e8e6e1`) | Caption (Plex Sans 36, `#c3c7cc`, max 2 lines) | Tag |
|---|---|---|
| `3.41%` | `Roblox bookings lost to fraud chargebacks, FY2024` | `SOURCED` |
| `≈ $149M` | `the same figure in dollars, on $4.37B of bookings` | `SOURCED` |
| `0.26%` | `cross-industry average chargeback rate` | `SOURCED` |

Under the row, one line, Plex Sans 48 weight 600, colour `#e8e6e1`, left-aligned:

`A tradeable economy is 13× more exposed.`

The `13×` in that line is the slide's one "hot" number: set it in Plex Mono, colour `#e0913f`.

Source line: `Roblox FY2024 Form 10-K (SEC) · Sift Q4 2025 Digital Trust Index`

### 03 · Live demo

Ground `#0a0b0d`. No eyebrow, no team mark, no source line. The screen will cut from this slide to the live dashboard; the slide exists so the cut is invisible. Put one small marker at the bottom-left, Plex Mono 28, colour `#4b5058`:

`03 · live`

Nothing else. Resist filling it.

### 04 · Features & users

Eyebrow: `04 · FEATURES & USERS`. Team mark at right.

A three-row, two-column table with hairline dividers, no header row, column widths 7 / 5. Left cell Plex Sans 36 `#e8e6e1`; right cell Plex Sans 36 with the role in weight 600 and the rest in `#c3c7cc`. Code-like tokens (`/events`) in Plex Mono.

| What | Who |
|---|---|
| `Value-flow graph · Louvain rings · sensitivity slider` | `Trust & Safety analyst` — `Rockstar is hiring this role now` |
| `Claude-written case · human decision · nothing auto-banned` | `Payments / risk lead` — `at a merchant of record` |
| `Drag-and-drop CSV today · same /events API in production` | `Game economy / live-ops lead` |

At the far left of the table, one small monochrome glyph per row is permitted **only** if drawn from the product's own graph vocabulary (a filled node `#33383f`, an outlined hub node `#2b2f36` with 2 px `#e8e6e1` stroke, a 2 px red edge `#b0473f`). No icon-set icons. If in doubt, omit the glyphs.

Source line: `Rockstar Games — Trust & Safety Senior Enforcement Analyst, open role (themuse.com)`

### 05 · Monetization

Eyebrow: `05 · MONETIZATION`. Team mark at right.

Three numbers stacked vertically, left-aligned, each on its own hairline-separated row; number in the left 4 columns, explanation in the right 8. This is the slide where the `ASSUMPTION` tag must be unmissable.

| Number (Plex Mono 120) | Explanation (Plex Sans 36) | Tag next to the number |
|---|---|---|
| `$149M` | `Roblox, FY2024, fraud chargebacks — the victim's own SEC filing` | `SOURCED` |
| `$10M / yr` | `a 1% dispute rate on the $1B of PC direct-to-consumer volume Xsolla published for 2025` | `ASSUMPTION` (amber) — and directly under the explanation, Plex Mono 28 `#9a8038`: `1% is our assumption, inside the sourced 0.26%–3.41% band` |
| `$60K / yr → 2.4 months` | `platform fee, under Sift's $150K median contract; a $50M-bookings studio pays it back in 2.4 months, 7.1 months if our detection is 3× worse` | `SOURCED` on `$150K`; nothing on `2.4` |

Source line: `Roblox FY2024 10-K · PocketGamer.biz, Jun 2026 · Sift Q4 2025 · Vendr (Sift contract data) · ROI model: business-case.md §5`

### 06 · Team + ask

Eyebrow: `06 · TEAM`. Team mark at right.

Three elements, top to bottom:

1. **Team row** — four columns, one person each. Name in Plex Sans 36 weight 600 (use the literal placeholder `(name)` for all four; the team will fill them in), role beneath in Plex Sans 28 `#c3c7cc`:
   - `Engine / detection` · `Python · FastAPI`
   - `API / data layer` · `Node · Fastify · Prisma`
   - `Dashboard / UX` · `React · Vite`
   - `Data generation & evaluation`
2. **One line in Plex Mono 28, colour `#9aa0a8`**, with a `MEASURED` tag at its left:
   `docs/accuracy.md · hub recall at default sensitivity: 0% · published, not patched`
3. **The ask** — the largest text in the whole deck and the only use of `#c8792e`. Plex Mono 120 weight 600, left-aligned, one line, sitting in the lower half of the content zone with generous space above it:
   `$5,000 · 90 days · one labelled dataset`

Source line: `github.com/xsolla-baku-gametech-hackathon/team-UNECom · pricing: business-case.md §4`

No "Thank you". No "Questions?". The ask is the last thing on screen.

---

## 6. The graph on 01b

If the user has attached a screenshot of the dashboard, use it exactly as supplied (dimmed per §5, never cropped to a "nice" region, never recoloured).

If no screenshot is attached, draw the graph procedurally on the artboard from this specification, in the product's own vocabulary. It must look like real force-directed output, not like a network icon:

- 122 nodes total. Node radius 4–7 px, fill `#33383f`, no stroke.
- One dense cluster of 35 nodes toward the right-centre of the frame; the rest scattered with organic, uneven spacing and a few small satellite groups of 3–6.
- Inside the cluster, one node drawn larger (radius 11 px) with fill `#2b2f36` and a 2 px stroke `#e8e6e1`: the cash-out hub. Most cluster edges point into it.
- Edges: 1 px `#3a4048`, roughly 380 of them, following the layout (short within clusters, a few long ones between groups). About 30 edges inside the cluster are 2 px `#b0473f` (flagged).
- No labels, no glow, no gradient fades, no vignette. Then dim the whole drawing so nothing exceeds `#24282f` in brightness.

---

## 7. Numbers registry — the only numbers permitted anywhere in the deck

`2019` · `3.41%` · `$4.37B` · `≈ $149M` / `$149M` · `0.26%` · `13×` · `$1B` · `2025` · `2026` (only inside the source-line date `Jun 2026`) · `1%` · `0.26%–3.41%` · `$10M / yr` · `$60K / yr` · `$150K` · `$50M` · `2.4 months` · `7.1 months` · `3×` · `0%` · `$5,000` · `90 days` · `FY2024` · `Q4 2025` · slide numbers `01–06` · document section labels `§4`, `§5` on source lines · `122` and `380` only as counts inside §6's drawing spec, never as text.

If you find yourself typing any other number, stop: it is not in the brief and must not appear.

---

## 8. Before you finish — self-check, in this order

1. Seven artboards, 1920×1080, named and ordered exactly as §2.
2. Every string on every slide appears verbatim in §5. Search each slide for words not in §5; delete them.
3. Every number on every slide is in §7. Every sourced number has its source on the slide's source line. The `ASSUMPTION` tag is on 05 next to `$10M / yr` and nowhere else.
4. Orange `#c8792e` occurs exactly once (06, the ask). `#e0913f` occurs at most once per slide (02 `13×`). Red, amber and green occur only as tags or graph elements.
5. No gradient, shadow, blur, emoji, icon-set icon, illustration, or radius above 3 px anywhere. No typeface outside Plex Sans / Plex Mono / Barlow Semi Condensed.
6. Eyebrow, team mark and source line sit at the same coordinates on 01b, 02, 04, 05, 06.
7. Smallest text is 22 px (eyebrows) and nothing that carries meaning is below 28 px. Weights are 400 / 600 / 700 only.
8. Slides 02, 04, 05 have no more than three content elements.
9. 01a and 03 contain only what §5 lists for them.
10. Nothing sits outside the artboard frame; nothing overlaps; every number's decimal aligns with its neighbours where stacked.

---

## 9. Out of scope

Do not write speaker notes, do not add slides, do not propose alternative palettes, do not create a light version, do not animate, do not "enhance" copy, do not generate imagery. If a constraint here seems to conflict with good taste, the constraint wins: the jury is judging trust, not flair.
