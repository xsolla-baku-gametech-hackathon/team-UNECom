# Q&A müdafiəsi — 2 dəqiqə

**Team UNECom · GameTech Bootcamp Baku 2026**

Pitch-dən sonra **2 dəqiqə Q&A** — praktikada 3–5 sual. Hər cavab **2–3 cümlə**,
~15 saniyə. Uzun cavab ikinci suala yer qoymur.

**Dil qaydası:** izahlar Azərbaycanca, **cavablar İngiliscə**, dırnaqda, olduğu
kimi oxunacaq formada.

---

## ⭐ ƏZBƏR BİLİNMƏLİ 3 — təzyiq altında yalnız qalın cümlə deyilir

Bu üç sual gələcək. Hər cavabın **birinci cümləsi** tək başına tam cavabdır —
qalanı vaxt varsa. Tam mətn aşağıda (№1, №2, №10).

| # | Sual | Birinci cümlə — bunu de, sonra nəfəs al |
|---|---|---|
| **№1** | "How is this different from Sift / Magify?" | **"They all score the payment. We start ninety seconds later, when the goods move."** |
| **№2** | "Your doc says hub recall is 0%. So you don't detect hubs?" | **"Correct — at the default threshold our harness catches zero percent of hubs, and we published that number ourselves."** |
| **№10** | "How much would you charge?" | **"Sixty thousand a year for a mid-size studio, deliberately under Sift's hundred-and-fifty-thousand median contract."** |

Slayd 6-nın son iki cümləsi ("hub recall is zero at default" + ask) Q&A-nı
məhz №2 və №10-a çəkir. №1 isə toggle-dan sonra hər halda gəlir.

---

## Üç qızıl qayda

1. **Fərziyyəni fərziyyə kimi de.** "That's our assumption, inside a sourced
   band" — bu altı söz bizi bir sualla yıxılmaqdan qoruyur. Şişirtmə bizim ən
   böyük riskimizdir, məlumatsızlıq deyil.
2. **Zəifliyi əvvəlcə özün de.** Hub recall 0%, sintetik data, 100%
   precision-ın niyə real olmadığı — jüri bunları bizdən əvvəl deyərsə, mövqe
   itir.
3. **Bilmirsənsə, "bilmirik" de.** `business-case.md`-də `[NOT FOUND]` etiketi
   var və bu bizim üstünlüyümüzdür. Uydurma rəqəm bir sualda pitch-i bitirir.

---

## İki mexanizmi qarışdırma — hər cavabdan əvvəl bunu bil

| | `docs/accuracy.md` (eval harness) | Dashboard (ekranda) |
|---|---|---|
| Nəyi ölçür/bayraqlayır | **hesabı** öz risk skoruna görə | **halqanı** halqa risk skoruna görə |
| Slider nəyə təsir edir | hesab-səviyyəli hədd | halqa-səviyyəli hədd |
| "Hub recall 0% → 100%" | **burada doğrudur** | node rəngi sabit bantlardır, dəyişmir |
| Datası | 5 seed, 352 hesab / 2,624 hadisə | demo faylı, 122 hesab / 388 hadisə |

**Ona görə səhnədə "zero" yalnız bir dəfə, Slayd 6-da deyilir: "the doc that
says our hub recall is zero at default"** — "the dashboard shows" yox. Demo
beat-i (3d) isə "precision still one hundred **at the account level**" deyir —
üç son söz məhz bu cədvəlin ekvivalentidir. Jüri fərqi qaldırsa, bu cədvəli
danış: bu, tutulmuş səhv deyil, ölçmə metodologiyasıdır.

---

## 1 · "How is this different from Sift or Kount — or from Magify?"

**Fakt:** Sift, Kount, Chargeflow, Coinflow, Justt — hamısı ödəniş anına baxır.
Magify-ın öz bootcamp slaydında yazılıb: *"Stop Fraud in Subscriptions &
Purchases, server-side validation"* — bu, tam olaraq ödəniş anıdır.
`paymentMomentView.ts` bu fərqi **iddia deyil, hesablanmış nəticə** kimi ekrana
çıxarır: ödəniş anı aləti yalnız bayraqlanmış ödənişin `to` tərəfini görə bilər.

**De (EN):**
> **"They all score the payment. We start ninety seconds later, when the goods
> move.** Magify's own slide says 'stop fraud in subscriptions and purchases,
> server-side validation' — that's the payment moment. And we don't
> assert that difference, we compute it: the toggle you just saw masks the graph
> down to exactly what a payment-time tool can see, from your data, not ours.
> We're an add-on to Sift, not a replacement — that's also why we price under
> them."

**Vaxt varsa:** toggle-ı 5 saniyəyə yenidən göstər (**slider 0.5-də**). Sözdən
güclüdür.

---

## 2 · "Your own doc says hub recall is 0%. So you don't detect hubs?" 🔴

> **Bu bizim ən güclü cavabımızdır. Sual gəlməsə belə, Slayd 6-dan sonra özümüz
> ora aparırıq.**

**Fakt** (`docs/accuracy.md`, seed 42): hub risk **45.6** — taint 0.630,
**velocity 0.005**, imbalance 0.689, in/out **38/7**. Velocity skorun 25%-idir və
hub konstruksiyaya görə orada sıfır alır (80–120 günlük hesabdır). Üstəlik hub-un
cash-out satışları in/out balansını normallaşdırır — yəni **fırıldağın özü hub-un
risk skorunu aşağı salır**. Amma halqa üzvlüyü hədddən asılı deyil: Louvain
`acct_0044`-i **0.5-də də** halqanın içində saxlayır.

**De (EN):**
> **"Correct — at the default threshold our harness catches zero percent of hubs,
> and we published that number ourselves.** Here's why it matters: a hub is an
> aged account with no velocity, balanced in-out degree, and it never touches a
> flagged card. Every per-account heuristic on the market calls that a normal
> player — which is exactly why per-account scoring can't find the cash-out
> point. Only the structure of the flow can. And ring membership doesn't depend
> on the threshold at all: the hub sits inside the flagged ring at the default
> setting, at 94.9 percent measured ring purity, even though its own score is
> below the cut-off. Raise the threshold and the second ring and second hub
> surface too, with precision still at one hundred."

**Əlavə — "niyə düzəltmədiniz?"**
> "Because changing the scoring to improve the metric would have invalidated the
> metric. It's reported, not patched. The fix — stop charging aged accounts a
> velocity penalty — is written down as weakness number one."

---

## 3 · "What's your false positive rate?"

**Fakt:** default 0.5-də hesab-səviyyəli false positive rate **0.0% ± 0.0**,
5 seed, 300 təmiz hesabın heç biri bayraqlanmır; seed 42-də ən yüksək təmiz
hesab **31.2** — 56 həddindən çox aşağı. Amma `accuracy.md` bunu özü rədd edir:
sintetik təmiz populyasiyada power trader, reseller, guild bank yoxdur.

**De (EN):**
> "Zero percent across five seeds — and we will not sell you that number. Our
> synthetic clean population has no power traders, no resellers, no gifting
> guilds, which are exactly the legitimate patterns that would generate false
> positives. Read the hundred percent as 'the planted ring is separable in this
> dataset', not as a false-positive rate we can promise a studio. That's why the
> product ships a slider and a human decision instead of an auto-ban."

### 🔴 False-positive power move — yalnız təkid edilsə

Jüri "göstərin" desə: slider-i **0.8**-ə çək, toggle-ı aç. Callout **4 hub**
sayacaq — onlardan **`acct_0095` və `acct_0089` təmiz hesablardır**
(`hub_candidates` sırf degree-imbalance evristikasıdır, halqa üzvlüyü deyil).
Bunu gizlətmə, **özün göstər**:

**De (EN):**
> "Here — at a wider threshold the tool names four cash-out candidates, and two
> of them are ordinary accounts that just happen to receive more than they send.
> That's a false positive, on screen, in front of you. It's also exactly why
> there's an analyst between this panel and any enforcement action, and why we
> report ring purity at 94.9 percent instead of claiming a hundred."

Bu, Q&A-nın ən yaddaqalan 15 saniyəsi ola bilər — **planlı** dürüstlük
gizlədilmiş qüsurdan qat-qat güclüdür.

---

## 4 · "Is this real data?"

**Fakt:** sintetik (`data-generator/generate.py`). Eval harness: 5 seed,
**352 hesab / 2,624 hadisə** per run, 52 əkilmiş pozitiv. Səhnədəki demo faylı:
**122 hesab / 388 hadisə / $26,814**. Sxem real hadisə axını ilə eynidir —
`event_id, type, from/to_account_id, value_usd_estimate, payment_flagged, …`.

**De (EN):**
> "Synthetic, and we label it as synthetic everywhere in the repo. But the schema
> is a real event stream — event id, type, from and to account, value, payment
> flagged — which is why we could drag the file straight in with no conversion.
> Validating against a real labelled incident set from a live economy is the
> necessary next step, and we haven't done it. What these numbers do prove is
> internal consistency: the pipeline recovers the structure it was built to
> recover, and the slider behaves monotonically across five seeds."

**Qeyd:** ask cümləsi ("We're not asking you to believe synthetic numbers…")
bu sualı sual gəlməmiş qismən cavablayıb. Sual yenə gəlsə, yuxarıdakı cavab
olduğu kimi — "synthetic" sözü ilə başla, "next step" ilə bitir.

**Jüri "öz faylımızı ata bilərik?" deyərsə:** bəli. Callout rəqəmləri onların
datasından hesablanır. Halqa tapılmasa, qələbə kimi çərçivələ:
> "If it finds nothing, that's the system being right — it doesn't flag
> everything."

### 🟢 "Blind test" — Q&A-nın əsas silahı (header-dəki düymə)

"Is this real data / is this canned?" gələn kimi faylı müdafiə etmə — **münsifə
öz halqasını qurdur.** Header → **Blind test**:

1. "Give me any number." Münsifin dediyi rəqəmi *Your number*-a yaz.
2. Parametrlərə toxunma (30 mule · 1 hub · a little · 40 players). Vaxt varsa
   *How careful is the fraudster* → **very careful** — ən güclü hekayə budur.
3. **Generate & run.** Brauzer jurnalı yaradır, hər hesab `p_####` (mule/hub
   sözü yoxdur), bazanı sıfırlayır, yalnız jurnalı göndərir. Replay gedir;
   Space ilə keç.
4. Sağ üstdə **hesab kartı**: tutulan halqa hesabları, tutulan hub-lar, səhv
   bayraqlanan real oyunçular, bayraqlanmış case-lərdəki halqa dəyəri. Slider
   ilə canlı dəyişir.

**De (EN):**
> "Pick any number. The browser builds a ring with that seed — every account
> is just p-something, no labels — wipes the database and sends the log
> alone. Who is a mule and who is a hub never leaves this browser. Now we
> compare what the engine flagged with what was planted."

**Ölçülmüş (11.09, lokal):** defolt parametrlərlə seed 1 / 777 / 2026 / 4821 →
0.5-də **87–94 %** halqa hesabı, hub **1/1**, yalan pozitiv **0–1 / 40**.
*Very careful* + seed 4821 → 0.5-də **10 %**, hub 0/1; slider 0.8 → **100 %**,
hub 1/1, yalan pozitiv 1/40. Bunu gizlətmə, göstər:
> "At the default bar a careful ring hides — three accounts, no hub. This is
> what the slider is for: at eighty, the whole ring and the hub, one real
> player wrongly flagged out of forty. That one is why an analyst decides,
> not the model."

**Qayda:** kartda 0 % görünsə panikə yox — kartın öz düyməsi var:
**Raise sensitivity →**. Bir klik = +10 %.

---

## 5 · "Why hasn't Xsolla built this already?"

**Fakt:** Rauf Aliyev-in (Backend Developer, Xsolla) bu bootcamp-dakı öz workshop
slaydı "retry and abuse protection"-u **hələ tikilməmiş** hissə kimi göstərir.
Xsolla-nın 2026-dakı açıq fəaliyyəti genişlənmə formasındadır — Vyetnam alışı,
ödəniş provayderləri portalı.

**De (EN):**
> "Your own workshop slide in this bootcamp listed retry and abuse protection as
> a gap that isn't built yet — that's where we're aiming. Everything Xsolla
> announced publicly in 2026 is expansion-shaped: the Vietnam licence, the
> payment-provider portal. Graph forensics competes for engineering time against
> revenue expansion and loses every planning cycle. Also, you see the payment —
> the trades and gifts happen inside a thousand different games, so the hard part
> is a cross-studio event contract, which is a vendor's job, not a merchant of
> record's."

---

## 6 · "Would you auto-ban accounts?"

**Fakt:** Mansur Mustafayev-in bootcamp slaydı birbaşa deyir ki, real oyunçuları
banlamaq bu sistemləri öldürür. UI-da avtomatik hərəkət yoxdur — qərar düymələri
təsdiq addımı tələb edir və panel hərfən yazır: "Heç nə avtomatik bloklanmır."

**De (EN):**
> "No — and that's a design decision, not a missing feature. Mansur's own slide
> in this bootcamp says banning real players kills these systems. Our output is
> a case with evidence and a recommendation; a human presses fraud or real
> player, and the panel says in plain text that nothing is auto-blocked. At the
> default setting we miss about a third of the mules — that's a tool you review
> with, not a tool you enforce with."

---

## 7 · "Does this scale?"

**Fakt:** qraf `react-force-graph` üzərində WebGL-canvas ilə render olunur; ağır
analiz (taint propagation, velocity, degree imbalance, Louvain) Python engine
tərəfindədir. Eyni `/events` endpoint həm upload, həm real-vaxt push üçündür.

**De (EN):**
> "The visualisation is WebGL canvas, so thousands of nodes render fine in the
> browser; the heavy analysis — taint propagation, community detection — runs in
> the Python engine, and the front end only draws the result. The same /events
> endpoint takes a dropped file or a live push from a game backend, so scaling is
> an engine and ingestion question, not a UI one. What we have not done is
> load-test it at platform volume, and we're not going to claim we have."

---

## 8 · "Why not blockchain / on-chain provenance?"

**Fakt:** Mansur-un öz bootcamp slaydı bu fikri qısa bağlayır: *"the fraud was
never in the items."* Problem əşyanın izlənməzliyi deyil — problem **ödənişin
oğurlanmış kartla edilməsi və dəyərin sonradan yuyulmasıdır.**

**De (EN):**
> "Mansur's slide put it better than we can: the fraud was never in the items.
> A ledger tells you an item moved — our event log already tells us that. It
> doesn't tell you the card was stolen, and it doesn't tell you which cluster of
> accounts is a cash-out ring. Immutable provenance of a laundered asset is just
> a permanent record of the laundering."

---

## 9 · "Who exactly is your customer?"

**Fakt:** birinci hədəf **Persona B** — merchant of record / ödəniş
platformasında risk lideri: chargeback birbaşa onların üzərinə düşür və bir
inteqrasiya yüzlərlə oyunu əhatə edir. İkinci: ticarət edilə bilən iqtisadiyyatı
olan orta studiolar. İstifadəçi isə **Persona A** — Rockstar-ın açıq "Trust &
Safety Senior Enforcement Analyst" vakansiyası bu rolun real olduğunun sübutudur.

**De (EN):**
> "First customer is a merchant of record — Xsolla — because as merchant of
> record the chargeback lands on you, not on the studio, and one integration
> covers a thousand titles. Second is mid-size studios with a tradeable economy
> and no in-house trust and safety team. The user inside both is an enforcement
> analyst — an operator, not a data scientist, which is why the output is a
> written case, not a risk vector. Rockstar has that exact job open right now."

---

## 10 · "How much would you charge?"

**Fakt (`business-case.md` §4–5):** $60K/il platform haqqı, Sift-in $150K median
müqaviləsindən qəsdən aşağı — çünki biz əvəzedici deyil, əlavə modulyuq. $50M
bookings studio üçün ROI 5.1×, geri ödəmə **2.4 ay**; detection fərz etdiyimizdən
3× pis olsa **7.1 ay**. Giriş: 90 günlük pilot ($5,000 = illik haqqın 1/12-i; səhnədə deyilmir).

**De (EN):**
> **"Sixty thousand a year for a mid-size studio, deliberately under Sift's
> hundred-and-fifty-thousand median contract.** We're a module next to
> your payment fraud tooling, not a replacement for it. On a fifty-million-
> bookings studio that pays back in 2.4 months — and if our detection turns out
> to be three times worse than we assume, still under seven. We land with a
> ninety-day pilot on one labelled dataset, priced so that a single manager can
> sign it without a committee."

**Qeyd:** pilot artıq pitch-in son cümləsində (ask) deyilib, **dollar rəqəmi
olmadan** — hackathon jürisi müqavilə imzalamır, səhnədə "five thousand dollars"
"bizə pul verin" kimi səslənirdi. Jüri "how much is the pilot?" deyə israr etsə:
"one month of the annual fee, spread over ninety days" — $60K ÷ 12 = $5,000;
`business-case.md` §4-dəki rəqəmdir, mənbəsi yoxdur, bizim seçimimizdir.

---

## 11 · "Why is the missed value bigger than the ring's own value?" — $7,607 vs $6,616

**Fakt (kodda yoxlanılıb, 10.09.2026):** iki rəqəm iki fərqli şeyi sayır.

| | Nəyi toplayır | Haradan |
|---|---|---|
| Halqa dəyəri **$6,616** | halqanın 35 üzvünə daxil olan **köçürmələr** (trade · gift · marketplace · key) | engine, `community.py` → `in_value_usd`; engine qrafında STORE kənarı yoxdur, ona görə **alışlar sayılmır** |
| Callout **$7,607** | 9 gözdən qaçan hesaba daxil olan **hər şey** | `paymentMomentView.ts` → `missedValueUsd`: `snapshot.events` üzərindən, **STORE alışları daxil** |

Fərqin mənbəyi, çəkisinə görə: (1) gözdən qaçan mule-ların **bayraqlanmamış**
STORE alışları — kart bayraqlanmayıb, ona görə ödəniş anı aləti onları
görməyib, amma pul həmin hesaba düşüb; (2) halqadan kənar hesabların `acct_0044`-ə
ticarəti. Halqanın köçürmə dəyərinin böyük hissəsi onsuz da bu 9 hesabda —
əsasən hub-da — bitir: hub məhz dəyərin toplandığı yerdir.

Bu, səhv deyil: callout "ödəniş anı alətinin görmədiyi pul"u ölçür, halqa
dəyəri isə "halqa daxilində dövr edən pul"u. Suala 5 saniyəlik cavab:

**De (EN):**
> **"Different denominators.** The ring value counts only account-to-account
> transfers. The callout counts everything that landed in the nine accounts a
> payment-time tool never saw, including store purchases whose card was never
> flagged. Both come from your file, not from us."

**Uzatma.** Jüri "so the number is inflated?" desə:
> "No — it's the honest one. A purchase on a card that was never flagged is
> precisely what a payment-time tool misses. Leaving it out would be
> under-counting the blind spot."

---

## 12 · "How does the scoring actually work?"

**Fakt (koddan, `engine/app/risk_scoring.py` + `community.py`):** hər hesab üçün
dörd müstəqil siqnal hesablanır və çəkili cəmlənir — **taint 0.40** (dəyərin nə
qədəri bayraqlanmış alışlardan gəlir; qraf boyunca "haircut" yayılması,
kripto-forensikadan gələn üsul), **velocity 0.25** (hesab yaranandan ilk çıxışa
qədər vaxt), **imbalance 0.20** (in/out dərəcə balanssızlığı — hub nümunəsi),
**community 0.15** (hesabın icmasının orta riski). Louvain (networkx) icmaları
tapır; halqa riski = üzvlərin orta riski; hub namizədləri ən yüksək imbalance.
Slider halqa-səviyyəli həddir. Claude yalnız izahatı yazır.

**De (EN):**
> **"Four signals per account, weighted and summed: tainted value, forty percent;
> velocity after account creation, twenty-five; in-out degree imbalance, twenty;
> community risk, fifteen.** Taint spreads along the transfer graph by haircut
> propagation, the method crypto forensics uses. Louvain community detection
> groups accounts into rings, a ring's risk is its members' average, and the
> slider is the ring-level threshold. Claude only writes the case; it never
> scores."

**Uzatma — "why those weights?"**
> "Chosen by hand, not learned — we had no labelled data to learn from. That is
> exactly what the pilot is for. The weights are in one dictionary in
> risk_scoring.py, and the evaluation harness reruns in seconds, so retuning is
> a five-line change."

---

## Ehtiyat cavablar

| Sual | De (EN) |
|---|---|
| "What's the market size?" | "We deliberately don't quote an RMT black-market number — there's no credible recent public estimate and we refused to invent one. We size it on victim-side loss instead: Roblox lost a hundred and forty-nine million in one year, at one company." |
| "How do you trust the Claude explanation?" | "It doesn't decide anything. The evidence is computed locally — taint, velocity, degree imbalance — and the model only writes it up for a human. The case stands without it." |
| "What if fraudsters adapt?" | "They will. The slider and the per-case threshold override let an analyst retune without a model rewrite. Our honest limit is that recall tracks the upstream flag rate — at a thirty percent flag rate recall drops to twenty. That's the number to fix next." |
| "Why does the demo dataset look small?" | "The evaluation runs on 352 accounts across five seeds; the demo file is a smaller one so the whole graph is legible on a projector. Both come from the same generator and the same schema." |
| "Will you continue after the hackathon?" | "The gap is real and the repo is a working pipeline, not a mock. What it needs next is one labelled dataset from a live economy — that's the conversation we'd want to have with you." |
| "Why should we pick you for Best Code?" | "Read docs/accuracy.md. It's an evaluation harness over five seeds that reports our own hub recall as zero and doesn't patch the scoring to hide it, plus a regression test that pins the floors." |

---

## Ən zəif nöqtəmiz — komanda bunu bilsin

**№4, "Is this real data?"** Cavabımız dürüstdür, amma heç bir real-dünya
validasiyamız yoxdur. Bütün digər suallarda ya ölçülmüş rəqəm, ya mənbəli sitat,
ya canlı ekran sübutu var — burada yalnız metodologiya var.

**Cavabın strukturunu dəyişmə:** əvvəlcə "sintetik" de, sonra sxem arqumentinə
keç, sonuncu cümləni **növbəti addım** üzərində bitir. Müdafiə etməyə çalışsan
uzanır və zəiflik böyüyür; bir cümləyə sığdırıb irəli getsən, dürüstlük kimi
oxunur.
