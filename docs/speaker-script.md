# SPEAKER SCRIPT — səhnədə əldə tutulan yeganə vərəq

**UNECom · 11 Sep 2026 · 15:00 · 3:00 pitch · file: `events.csv` on Desktop · slider 0.5 · toggle OFF**

Oxu: yuxarıdan aşağı. Mötərizədə yalnız (vaxt · klik · ekrandan oxunan rəqəm).
`[…]` = qəsdən fasilə, büdcədədir. *tələffüz:* sətri = rəqəmi belə de.

---

## SPEAKER A · 0:00–0:44

**(0:00 · qara slayd, Valve sitatı · klik yoxdur)**

> "In 2019, Valve's answer to fraud was amputation: delete CS:GO key trading. Still the state of the art. We built the alternative."

`[nəfəs, 2 s · klik → başlıq slaydı]`

**(0:10 · S1 başlıq · klik yoxdur)**

> "Fraud Radar traces where in-game value goes after the payment clears, and finds the laundering rings in that flow. Every other tool stops at the payment. We start there."

`[klik → S2]`

**(0:26 · S2 üç rəqəm · klik yoxdur)**

> "Roblox told the SEC that 3.41 percent of its 2024 bookings, 149 million dollars, went to fraud chargebacks, and described our threat model: stolen cards, in-game currency, resale off-platform. Industry average: 0.26 percent. Tradeable economies: thirteen times more exposed."

*tələffüz:* 3.41 → **three point four one** · 149 → **one hundred forty-nine** · 0.26 → **zero point two six** · 2024 → **twenty twenty-four**

`[son söz "exposed" · ekran → dashboard · A geri, B irəli · 4 s]`

═══════════════════ ÖTÜRMƏ 0:44 → 0:48 ═══════════════════

## SPEAKER B · 0:48–3:00

**(0:48 · DRAG events.csv → yükləmə zonası)**

> "No integration, no API key. A raw event log, dropped into the browser."

`[gözlə — qraf qurulur, 2 s]`

**(0:57 · oxu: 122 · 388)**

> "122 accounts, 388 events."

**(0:59 · klik yoxdur · kursorla qırmızı klasteri dövrələ · oxu: ring_3 · 0.59)**

> "The graph builds itself. Louvain pulls the ring out of the noise: 94.9 percent measured purity, five seeds."

*tələffüz:* 94.9 → **ninety-four point nine** · Louvain → **loo-VAN**

**(1:07 · TOGGLE "Ödəniş anı görünüşü" ON)**

> "Now the differentiator. This toggle shows a payment-moment tool's entire view: the receiving end of a flagged card."

`[callout-u tap, 2 s]`

**(1:14 · oxu: 33 / 9 / $7,607 / 1 hub)**

> "It sees 33 accounts. It misses 9, holding seven thousand six hundred dollars, including a cash-out hub that never touched a card."

*tələffüz:* 33 → **thirty-three** · 9 → **nine** · ekranda $7,607 görünür, **"seven thousand six hundred"** de — "six-oh-seven" yox

**(1:26 · kursor → StatsBar $26,814)**

> "Twenty-eight percent of every dollar here lands in accounts a payment-time tool cannot see. The file is small. The blind spot behind Roblox's 149 million is not."

*tələffüz:* 28.4% ekranda yoxdur, hesablanıb — **"twenty-eight"** de, "point four" demə

**(1:40 · TOGGLE OFF · əl slider-ə)**

> "A hub is aged, low-velocity, never flagged: invisible to per-account scoring."

`[slider 0.5 → 0.8, yavaş, 3 s]`

**(1:49 · oxu: 2 halqa · ring_5 · hub_2 içində)**

> "Raise the threshold: a second ring surfaces, hub inside, precision still one hundred at the account level."

`[slider → 0.5 (vaxt varsa)]`

**(1:56 · J → Enter · panel açılır)**

> "Claude writes the case: evidence, confidence, recommendation. It never decides. The analyst does."

**(2:03 · F → Enter)**

> "Confirmed."

`[Alt+Tab → slaydlar]`

**(2:05 · S4)**

> "Built for a Trust and Safety analyst; Rockstar is hiring that role now. Drag-and-drop is the trial door; production pushes the same events to our API."

**(2:18 · S5)**

> "Xsolla published a billion dollars of PC direct-to-consumer volume. A one percent dispute rate, our assumption inside a sourced 0.26 to 3.41 band, is ten million a year. We charge 60 thousand. A 50-million-bookings studio pays that back in 2.4 months."

*tələffüz:* 0.26 to 3.41 → **zero point two six to three point four one** · 60 → **sixty thousand** · 50-million-bookings → **fifty-million-bookings** · 2.4 → **two point four months**

**(2:37 · S6)**

> "Team UNECom. Everything's in the repo, including the doc that says our hub recall is zero at default."

`[nəfəs · yavaşla]`

**(2:45 · S6 · ASK — pitch-in son cümləsi)**

> "We're not asking you to believe synthetic numbers. Give us one labelled dataset from a live economy, ninety days, five thousand dollars, and we'll show you where your money went."

`[1 s sükut · "Thank you" DEMƏ · Q&A]`

---

## PANİKA XƏTTİ

1. **Backend yoxdur** → upload atlanır, 0:48-də birbaşa: *"We're running on the local demo dataset here; the upload path pushes the same events through the API."* → sonra "The graph builds itself…" (rəqəmləri EKRANDAN oxu, əzbərdən yox).
2. **Upload keçmədi** → dayanma: *"The parser is strict about columns — that's deliberate. Let's look at the data that's already loaded."* → `events.json`-u BİR dəfə sına → keçməsə bənd 1.
3. **Vaxt bitir / moderator kəsir** → Slayd 4-ü at, S5-in "We charge 60 thousand…" cümləsini de, və nə olursa olsun ASK: *"We're not asking you to believe synthetic numbers. Give us one labelled dataset from a live economy, ninety days, five thousand dollars, and we'll show you where your money went."*
