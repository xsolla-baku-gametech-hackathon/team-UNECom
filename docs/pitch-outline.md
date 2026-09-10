# Pitch outline — 6 slayd / 180 saniyə

**Team UNECom · GameTech Bootcamp Baku 2026 · 11 sentyabr, 15:00**

Format: **3 dəqiqə pitch + 2 dəqiqə Q&A**. Jüri beynəlxalq Xsolla komandasıdır —
**səhnədə deyilən hər cümlə İngiliscədir**. İzahlar, səhnə göstərişləri və
"niyə belə" qeydləri komandanın öz istifadəsi üçün Azərbaycancadır.

Saniyə-saniyə klik ssenarisi → [`demo-script.md`](./demo-script.md).
Q&A cavabları → [`qa-defence.md`](./qa-defence.md).

> **Bu sənəddəki hər rəqəm ölçülüb.** Dashboard rəqəmləri repo-dakı demo faylı
> (`data-generator/output/events.csv`) engine-dən keçirilərək 10.09.2026-da
> yoxlanılıb. Dəqiqlik rəqəmləri [`accuracy.md`](./accuracy.md)-dən, biznes
> rəqəmləri [`business-case.md`](./business-case.md)-dəndir.

---

## Vaxt büdcəsi — cəmi 180 saniyə

| # | Slayd | Vaxt | Müddət | Söz |
|---|---|---|---|---|
| 1 | What you built | 0:00–0:20 | 20 s | 43 |
| 2 | The problem | 0:20–0:51 | 31 s | 71 |
| 3 | Your solution — **canlı demo** | 0:51–2:07 | 76 s | 175 |
| 4 | Features & users | 2:07–2:22 | 15 s | 35 |
| 5 | Monetization | 2:22–2:47 | 25 s | 56 |
| 6 | Your team | 2:47–3:00 | 13 s | 29 |
| | **CƏMİ** | | **180 s** | **409 söz** |

409 söz ÷ 180 saniyə = **136 söz/dəqiqə** — normal təqdimat sürəti (130–150).
Demo kliklərinin pauzaları saniyə büdcəsinin içindədir. **Yeni cümlə əlavə
etmək = başqa bir cümləni silmək.** Məşq edərkən sekundomer işlət.

---

## Slayd 1 — What you built · 0:00–0:20

**Ekranda:** Layihə adı böyük — *Post-Purchase Value Flow · Fraud Radar*,
altında bir sətir: "We trace where in-game value goes after the payment clears."
Komanda adı: **UNECom**. Fon: dashboard qrafının tutqun ekran görüntüsü.

**De (EN):**
> "We built Fraud Radar. It traces where in-game value goes after the payment
> clears — trades, gifts, marketplace sales, key transfers — and finds the
> laundering rings hiding in that flow. Every tool on the market stops at the
> payment. We start there."

*(43 söz · ~19 s)*

**Niyə belə:** İlk 20 saniyədə jüri "bu nədir?" sualının cavabını almalıdır. Son
iki cümlə bütün pitch-in mövqe cümləsidir — sonrakı hər şey onu sübut edir.

---

## Slayd 2 — The problem · 0:20–0:51

**Ekranda:** Üç rəqəm, böyük, mənbə adı ilə:

| | |
|---|---|
| **3.41%** | Roblox fraud chargebacks, FY2024 — *SEC 10-K* |
| **≈ $149M** | həmin faizin dollar qarşılığı ($4.37B bookings) |
| **0.26%** | sənaye ortalaması — *Sift Q4 2025* |

Altda sitat qutusu: *"nearly all key purchases that end up being traded or sold
on the marketplace are believed to be fraud-sourced"* — Valve, Oktyabr 2019.

**De (EN):**
> "Roblox told the SEC that 3.41 percent of its 4.37 billion dollars of FY2024
> bookings — about 149 million dollars — was lost to fraud chargebacks, and
> named our exact threat model: stolen cards, in-game currency, discounted
> resale off-platform. The cross-industry average is 0.26 percent. Tradeable
> economies are thirteen times more exposed. Valve's fix in 2019 was to delete
> CS:GO key trading entirely. We're the alternative to amputating your own
> economy."

*(71 söz · ~32 s)*

**Niyə belə:** Rəqəmlərin heç biri bizim deyil — qurbanın öz SEC sənədindəndir.
"13×" bazarın niyə mövcud olduğunu bir cümlədə izah edir. Valve isə
"alternativi nədir?" sualını bağlayır: alternativ öz iqtisadiyyatını kəsib
atmaqdır. **"Amputation" sözünü udma** — jüri bu metaforanı xatırlayacaq.

---

## Slayd 3 — Your solution · 0:51–2:07 · **EKRAN CANLI DASHBOARD-A KEÇİR**

Bu slayd təsvir deyil, **76 saniyəlik canlı demodur**. Dəqiq klik ardıcıllığı və
gözlənilən ekran vəziyyəti [`demo-script.md`](./demo-script.md)-dədir.

### 3a · Sıfır quraşdırma — canlı CSV upload · 0:51–1:02 (11 s)

**Ekranda:** Boş dashboard → fayl sürüşdürülür → qraf gözün qabağında qurulur.
**Gözlənilən nəticə (ölçülüb):** 388 hadisə, 122 hesab, $26,814 dövriyyə.

**De (EN):**
> "No integration, no API key. A raw event log — trade, gift, marketplace, key
> redeem — dropped straight into the browser. 122 accounts, 388 events."

*(25 söz)*

### 3b · Halqa özü çıxır · 1:02–1:12 (10 s)

**Ekranda:** Bir halqa bayraqlanır (`ring_3`, UI risk **0.59**, 35 hesab,
$6,616, 26 bayraqlanmış alış). Hub konturlu və daha iri node kimi görünür.

**De (EN):**
> "The graph builds itself. Louvain pulls the ring out of the noise — our
> harness measures 94.9 percent purity across five seeds."

*(22 söz)*

### 3c · **"Ödəniş anı görünüşü" — ƏSAS FƏRQLƏNDİRİCİ** · 1:12–1:33 (21 s)

**Ekranda:** Toggle basılır. Yalnız bayraqlanmış ödənişin `to` tərəfindəki
hesablar işıqlı qalır, köçürmə kənarları tamamilə sönür, sağda callout açılır.

**Gözlənilən callout (0.5-də ölçülüb):** görür **33** · görmür **9** ·
**$7,607** · gözdən qaçan hub **1 / 1** (`hub_1`).

**De (EN):**
> "Now the differentiator. This toggle leaves lit only what a payment-moment
> tool can ever see — the receiving end of a flagged card. Transfer edges go
> dark. It sees 33 accounts. It misses 9, holding seven thousand six hundred
> dollars, including a cash-out hub that never touched one."

*(48 söz)*

> **Rəqəmləri ekrandan oxu.** Yuxarıdakılar bu fayl üçün ölçülüb, amma callout
> həmişə yüklənmiş datadan hesablayır — hardcode yoxdur. Jüri öz faylını
> yükləsə, öz rəqəmlərini görür. Bu faktı Q&A üçün saxla.

### 3d · Həddi qaldır — **ən zəif rəqəmimiz sübuta çevrilir** · 1:33–2:00 (27 s)

**Ekranda:** Toggle söndürülür, slider 0.5-dən 0.8-ə çəkilir.
**Gözlənilən nəticə (ölçülüb):** bayraqlanmış halqa **1 → 2**; ikinci halqa
(`ring_5`, UI risk 0.42, 16 hesab) peyda olur və **içində `hub_2` var**.

**De (EN):**
> "Here's our weakest number, used as proof. A hub is an aged account, no
> velocity, balanced degree, never touching a flagged card — so per-account
> scoring calls it a normal player. Our harness measures zero percent hub
> recall at the default, and we publish that. Raise the threshold: a second
> ring surfaces with the second hub inside it, precision still one hundred."

*(62 söz)*

**Niyə belə (bunu oxu, sonra unutma):** Best Code münsifləri repo-nu oxuyacaq və
`docs/accuracy.md`-də "Hub recall 0.0%" sətrini tapacaqlar. Biz onlardan əvvəl
deyirik — və zəiflik arqumentə çevrilir: *hub-u per-account skorlama tapa
bilmir, çünki hub davranışca normal oyunçudur; onu yalnız axının strukturu
tapır.* Bazarın satdığı şey məhz per-account skorlamadır.

> ⚠️ **Dəqiqlik qeydi — bunu qarışdırma.** "Hub recall 0% → 100%" rəqəmi
> `eval/evaluate.py`-nin **hesab-səviyyəli** ölçüsüdür. Dashboard isə
> **halqa-səviyyəsində** bayraqlayır — ona görə ekranda "hub-lar rəngini
> dəyişir" yox, **ikinci halqa (və onun hub-u) peyda olur**. Yuxarıdakı cümlə
> qəsdən "our harness measures" deyir. Ekranda baş verməyən bir şeyi vəd etmə.

### 3e · Claude izahatı + insan qərarı · 2:00–2:07 (7 s)

**Ekranda:** Investigation panel açıq — ölçülmüş sübutlar, Claude izahatı,
confidence, tövsiyə. Sonra **F** → **Enter**.

**De (EN):**
> "Claude writes the case in plain language — evidence, confidence,
> recommendation. It never decides. The analyst does. Confirmed."

*(18 söz)*

---

## Slayd 4 — Features & users · 2:07–2:22

**Ekranda:** İki sütun, mətn minimum.

| Product | Who uses it |
|---|---|
| Value-flow graph (taint · velocity · degree imbalance) | Trust & Safety / enforcement analyst |
| Louvain ring detection + risk-sıralı case queue | Payments / risk lead at a merchant of record |
| Sensitivity slider + per-case threshold override | Game economy / live-ops lead |
| Claude explanation, human decision, nothing auto-banned | |
| Drag-and-drop CSV/JSON · same `/events` API in production | |

**De (EN):**
> "Case queue, keyboard-driven, built for a Trust and Safety analyst — a role
> Rockstar is hiring for right now. Drag-and-drop is the trial door; in
> production the game pushes the same events to our API."

*(35 söz · ~15 s)*

**Niyə belə:** Rockstar-ın açıq vakansiyası personanın uydurma olmadığının
sübutudur. Fayl yükləmənin "production yolu deyil" olduğunu özümüz deməsək,
jüri soruşacaq.

---

## Slayd 5 — Monetization · 2:22–2:47

**Ekranda:** `business-case.md` §8-in beş bulleti, qısaldılmış:

1. **$149M** — Roblox, FY2024, öz SEC sənədindən; threat model hərfən bizimkidir
2. **13×** — 3.41% vs 0.26% sənaye ortalaması
3. **Valve 2019** — həll yolu iqtisadiyyatı silmək oldu; biz alternativik
4. **$10M/il** — Xsolla-nın açıqladığı $1B PC D2C həcmində 1% dispute
   *(1% bizim fərziyyəmizdir, mənbəli 0.26%–3.41% aralığının içində)*
5. **$60K/il** — Sift-in $150K median müqaviləsindən aşağı; geri ödəmə **2.4 ay**

**De (EN):**
> "Xsolla published one billion dollars of PC direct-to-consumer volume for
> 2025. A one percent dispute rate — our assumption, inside a sourced 0.26 to
> 3.41 band — is ten million a year. We charge 60 thousand. A 50-million-
> bookings studio pays that back in 2.4 months, seven months if we're three
> times worse than we assume."

*(56 söz · ~25 s)*

**Niyə belə:** "our assumption, inside a sourced band" — bu altı söz bizi "rəqəm
uyduran komanda" kateqoriyasından çıxarır. **Onları udma.** Downside case-i
özümüz demək jürinin ən sevimli sualını əlindən alır.

---

## Slayd 6 — Your team · 2:47–3:00

**Ekranda:** Komanda üzvləri, rol, GitHub handle. Aşağıda repo linki.

| Ad | Rol |
|---|---|
| _(doldur)_ | Engine / detection (Python · FastAPI) |
| _(doldur)_ | API / data layer (Node · Fastify · Prisma) |
| _(doldur)_ | Dashboard / UX (React · Vite) |
| _(doldur)_ | Data generation & evaluation |

**De (EN):**
> "Team UNECom. Engine, API, dashboard and evaluation harness are all in the
> repo — including the accuracy doc that says our hub recall is zero at
> default. Thank you."

*(29 söz · ~13 s)*

**Niyə belə:** Son cümlə qəsdən zəifliyimizi təkrarlayır. Best Code münsifi üçün
bu bir dəvətdir: "repo-nu aç, biz nəyi gizlətdiyimizi yox, nəyi ölçdüyümüzü
görəcəksən." Q&A-nın ilk sualını da ən hazır olduğumuz sahəyə çəkir.

---

## Rəqəmlərin qaynaqları — səhnədə səhv etməmək üçün

| Səhnədə deyilən | Mənbə | Tip |
|---|---|---|
| 3.41% · $4.37B · ≈$149M | Roblox FY2024 10-K | SOURCED |
| 0.26% · 13× | Sift Q4 2025 Digital Trust Index | SOURCED |
| Valve "nearly all … fraud-sourced" | blog.counter-strike.net, Okt 2019 | SOURCED |
| $1B PC D2C 2025 | PocketGamer.biz, İyun 2026 | SOURCED |
| 1% dispute rate | **bizim fərziyyəmiz**, 0.26–3.41 aralığında | ASSUMPTION |
| $60K/il · Sift median $150K | Vendr (anonim müqavilə datası) | SOURCED (secondary) |
| 2.4 ay · 7 ay downside | `business-case.md` §5 ROI modeli | arithmetic |
| 94.9% ring purity · hub recall 0% (default) → 100% (0.8) | `accuracy.md`, 5 seed, hesab-səviyyəli | MEASURED (sintetik) |
| 122 hesab · 388 hadisə · $26,814 | repo-dakı demo faylı, engine ölçüsü | MEASURED |
| görür 33 · görmür 9 · $7,607 · 1 hub | həmin fayl, sensitivity 0.5 | MEASURED |
| Rockstar T&S vakansiyası | themuse.com elanı | SOURCED |

**Qayda:** bu cədvəldə olmayan heç bir rəqəmi səhnədə demə. Jüri mənbə soruşsa,
cavab bir sətirdir — hamısı yuxarıdadır.
