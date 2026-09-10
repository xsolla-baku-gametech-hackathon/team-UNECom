# Q&A müdafiəsi — 2 dəqiqə

**Team UNECom · GameTech Bootcamp Baku 2026**

Pitch-dən sonra **2 dəqiqə Q&A** var — praktikada 3–5 sual. Hər cavab
**2–3 cümlə**, ~15 saniyə. Uzun cavab ikinci suala yer qoymur.

**Dil qaydası:** izahlar Azərbaycanca, **cavablar İngiliscə**, dırnaqda, olduğu
kimi oxunacaq formada.

---

## Üç qızıl qayda

1. **Fərziyyəni fərziyyə kimi de.** "That's our assumption, inside a sourced
   band" cümləsi bizi bir sualla yıxılmaqdan qoruyur. Şişirtmə bizim ən böyük
   riskimizdir — məlumatsızlıq deyil.
2. **Zəifliyi əvvəlcə özün de.** Hub recall 0%, sintetik data, 100% precision-ın
   niyə real olmadığı — bunları jüri bizdən əvvəl deyərsə, mövqe itir.
3. **Bilmirsənsə, "bilmirik" de.** `business-case.md`-də `[NOT FOUND]` etiketi
   var və bu bizim üstünlüyümüzdür. Uydurma rəqəm bir sualda pitch-i bitirir.

---

## 1 · "How is this different from Sift or Kount — or from Magify?"

**Arxasındakı fakt:** Sift, Kount, Chargeflow, Coinflow, Justt — hamısı ödəniş
anına baxır. Magify-ın öz bootcamp slaydında yazılıb: *"Stop Fraud in
Subscriptions & Purchases, server-side validation"* — bu, tam olaraq ödəniş
anıdır. Bizim `paymentMomentView.ts` faylı bu fərqi **iddia deyil, hesablanmış
nəticə** kimi ekrana çıxarır: ödəniş anı aləti yalnız bayraqlanmış ödənişin `to`
tərəfini görə bilər.

**De (EN):**
> "They all score the payment. Magify's own slide says 'stop fraud in
> subscriptions and purchases, server-side validation' — that's the payment
> moment. We start ninety seconds later, when the goods move. And we don't
> assert that difference, we compute it: the contrast toggle you just saw masks
> the graph down to exactly what a payment-time tool can see, from your data,
> not ours. We're an add-on to Sift, not a replacement — that's also why we
> price under them."

**Vaxt varsa:** toggle-ı 5 saniyəyə yenidən göstər. Sözdən güclüdür.

---

## 2 · "Your own doc says hub recall is 0%. So you don't detect hubs?" 🔴

> **Bu bizim ən güclü cavabımızdır. Sual gəlməsə belə, Slayd 6-dan sonra özümüz
> ora aparırıq.**

**Arxasındakı fakt** (`docs/accuracy.md`): hub `seed 42`-də risk 45.6 — taint
0.630, **velocity 0.005**, imbalance 0.689, in/out 38/7. Velocity skorun 25%-idir
və hub konstruksiyaya görə orada sıfır alır (80–120 günlük hesabdır). Üstəlik
hub-un cash-out satışları in/out balansını normallaşdırır — yəni **fırıldağın
özü hub-un risk skorunu aşağı salır**.

**De (EN):**
> "Correct — at the default threshold we catch zero percent of hubs, and we
> published that number ourselves. Here's why it matters: a hub is an aged
> account with no velocity, balanced in-out degree, and it never touches a
> flagged card. Every per-account heuristic on the market calls that a normal
> player — that's precisely why per-account scoring can't find the cash-out
> point. Only the structure of the flow can. Push the slider to 0.8 and hub
> recall goes to one hundred percent with precision still at one hundred. And
> ring membership doesn't depend on the threshold at all — Louvain puts the hub
> inside the ring at 94.9 percent purity even when its own score is below the
> cut-off."

**Əlavə (soruşsalar "niyə düzəltmədiniz?"):**
> "Because changing the scoring to improve the metric would have invalidated the
> metric. It's reported, not patched. The fix — stop charging aged accounts a
> velocity penalty — is written down as weakness number one."

---

## 3 · "What's your false positive rate?"

**Arxasındakı fakt:** default 0.5-də false positive rate **0.0% ± 0.0**, 5 seed,
300 təmiz hesabın heç biri bayraqlanmır. Amma `accuracy.md` bunu özü rədd edir:
sintetik təmiz populyasiyada power trader, reseller, guild bank, hədiyyə zənciri
yoxdur. `seed 42`-də ən yüksək təmiz hesab 31.2 — 56 həddindən çox aşağı.

**De (EN):**
> "Zero percent across five seeds — and we will not sell you that number. Our
> synthetic clean population has no power traders, no resellers, no gifting
> guilds, which are exactly the legitimate patterns that would generate false
> positives. Read the hundred percent as 'the planted ring is separable in this
> dataset', not as a false-positive rate we can promise a studio. That's why the
> product ships a slider and a human decision instead of an auto-ban."

---

## 4 · "Is this real data?"

**Arxasındakı fakt:** sintetik (`data-generator/generate.py`), 5 seed, 352 hesab
/ 2,624 hadisə, 52 əkilmiş pozitiv. Sxem real hadisə axını ilə eynidir —
`event_id, type, from/to_account_id, value_usd_estimate, payment_flagged, …`.

**De (EN):**
> "Synthetic, and we label it as synthetic everywhere in the repo. But the schema
> is a real event stream — event id, type, from and to account, value, payment
> flagged — which is why we could drag the file straight in with no conversion.
> Validating against a real labelled incident set from a live economy is the
> necessary next step, and we haven't done it. What these numbers do prove is
> internal consistency: the pipeline recovers the structure it was built to
> recover, and the slider behaves monotonically."

**Jüri "öz faylımızı ata bilərikmi?" deyərsə:** bəli, at. Callout rəqəmləri
onların datasından hesablanır. Halqa tapılmasa, bunu qələbə kimi çərçivələ:
> "If it finds nothing, that's the system being right — it doesn't flag
> everything."

---

## 5 · "Why hasn't Xsolla built this already?"

**Arxasındakı fakt:** Rauf Aliyev-in (Backend Developer, Xsolla) bu bootcamp-dakı
öz workshop slaydı "retry and abuse protection"-u **hələ tikilməmiş** hissə kimi
göstərir. Xsolla-nın 2026-dakı açıq fəaliyyəti isə genişlənmə formasındadır —
Vyetnam alışı, ödəniş provayderləri portalı.

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

**Arxasındakı fakt:** Mansur Mustafayev-in bootcamp slaydı birbaşa deyir ki, real
oyunçuları banlamaq bu sistemləri öldürür. Bizim UI-da avtomatik hərəkət yoxdur —
qərar düymələri (Fırıldaqdır / Real oyunçudur) təsdiq addımı tələb edir və panel
hərfən yazır: "Heç nə avtomatik bloklanmır."

**De (EN):**
> "No — and that's a design decision, not a missing feature. Mansur's own slide
> in this bootcamp says banning real players kills these systems. Our output is
> a case with evidence and a recommendation; a human presses fraud or real
> player, and the panel says in plain text that nothing is auto-blocked. Our
> measured false-negative rate is a third of mules at the default setting —
> that's a tool you review with, not a tool you enforce with."

---

## 7 · "Does this scale?"

**Arxasındakı fakt:** qraf `react-force-graph` üzərində WebGL-canvas ilə render
olunur; ağır analiz (taint propagation, velocity, degree imbalance, Louvain)
Python engine tərəfindədir; frontend yalnız nəticəni göstərir. API Fastify +
Prisma-dır və eyni `/events` endpoint həm upload, həm real-vaxt push üçündür.

**De (EN):**
> "The visualisation is WebGL canvas, so thousands of nodes render fine in the
> browser; the heavy analysis — taint propagation, community detection — runs in
> the Python engine, and the front end only draws the result. The same /events
> endpoint takes a dropped file or a live push from a game backend, so scaling
> is an engine and ingestion question, not a UI one. What we have not done is
> load-test it at platform volume, and we're not going to claim we have."

---

## 8 · "Why not blockchain / on-chain provenance?"

**Arxasındakı fakt:** Mansur-un öz bootcamp slaydı bu fikri qısa bağlayır:
*"the fraud was never in the items."* Problem əşyanın mənşəyinin izlənməzliyi
deyil — problem **ödənişin oğurlanmış kartla edilməsi və dəyərin sonradan
yuyulmasıdır**. Ledger bunların heç birini dayandırmır.

**De (EN):**
> "Mansur's slide put it better than we can: the fraud was never in the items.
> A ledger tells you an item moved — our event log already tells us that. It
> doesn't tell you the card was stolen, and it doesn't tell you which cluster of
> accounts is a cash-out ring. Immutable provenance of a laundered asset is just
> a permanent record of the laundering."

---

## 9 · "Who exactly is your customer?"

**Arxasındakı fakt:** birinci hədəf **Persona B** — merchant of record / ödəniş
platformasında risk lideri, çünki chargeback birbaşa onların üzərinə düşür və bir
inteqrasiya yüzlərlə oyunu əhatə edir. İkinci: ticarət edilə bilən iqtisadiyyatı
olan orta studiolar. Persona A (T&S analitiki) real roldur — Rockstar-ın açıq
"Trust & Safety Senior Enforcement Analyst" vakansiyası sübutdur.

**De (EN):**
> "First customer is a merchant of record — Xsolla — because as merchant of
> record the chargeback lands on you, not on the studio, and one integration
> covers a thousand titles. Second is mid-size studios with a tradeable economy
> and no in-house trust and safety team. The user inside both is an enforcement
> analyst — an operator, not a data scientist, which is why the output is a
> written case, not a risk vector. Rockstar has that exact job open right now."

---

## 10 · "How much would you charge?"

**Arxasındakı fakt (`business-case.md` §4–5):** $60K/il platform haqqı, Sift-in
$150K median müqaviləsindən qəsdən aşağı — çünki biz əvəzedici deyil, əlavə
modulyuq. $50M bookings studio üçün ROI 5.1×, geri ödəmə **2.4 ay**; detection
fərz etdiyimizdən 3× pis olsa **7.1 ay**. Giriş: 90 günlük $5,000 pilot.

**De (EN):**
> "Sixty thousand a year for a mid-size studio, deliberately under Sift's
> hundred-and-fifty-thousand median contract, because we're a module next to
> your payment fraud tooling, not a replacement for it. On a fifty-million-
> bookings studio that pays back in 2.4 months — and if our detection turns out
> to be three times worse than we assume, still under seven. We land with a
> five-thousand-dollar ninety-day pilot so nobody needs a committee to sign it."

---

## Gözlənilməyən suallar üçün ehtiyat cavablar

| Sual | De (EN) |
|---|---|
| "What's the market size?" | "We deliberately don't quote an RMT black-market number — there's no credible recent public estimate and we refused to invent one. We size it on victim-side loss instead: Roblox lost a hundred and forty-nine million in one year, at one company." |
| "How do you trust the Claude explanation?" | "It doesn't decide anything. The evidence is computed locally — taint, velocity, degree imbalance — and the model only writes it up for a human. The case stands without it." |
| "What if fraudsters adapt?" | "They will. The slider and the per-case threshold override let an analyst retune without a model rewrite. Our honest limit is that recall tracks the upstream flag rate — at a thirty percent flag rate recall drops to twenty. That's the number to fix next." |
| "Will you continue after the hackathon?" | "The gap is real and the repo is a working pipeline, not a mock. What it needs next is one labelled dataset from a live economy — that's the conversation we'd want to have with you." |
| "Why should we pick you for Best Code?" | "Read docs/accuracy.md. It's an evaluation harness over five seeds that reports our own hub recall as zero and doesn't patch the scoring to hide it, plus a regression test that pins the floors." |

---

## Ən zəif nöqtəmiz — komanda bunu bilsin

**Ən zəif olduğumuz sual: №4, "Is this real data?"** Cavabımız dürüstdür, amma
heç bir real-dünya validasiyamız yoxdur və bunu gizlədə bilmərik. Bütün digər
suallarda ya ölçülmüş rəqəm, ya mənbəli sitat, ya da canlı ekran sübutu var —
burada yalnız metodologiya var.

**Ona görə cavabın strukturunu dəyişmə:** əvvəlcə "sintetik" de, sonra sxem
arqumentinə keç, sonuncu cümləni **növbəti addım** üzərində bitir. Müdafiə
etməyə çalışsan uzanır və zəiflik böyüyür; bir cümləyə sığdırıb irəli getsən,
dürüstlük kimi oxunur.
