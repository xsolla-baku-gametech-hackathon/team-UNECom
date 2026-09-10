# Pitch outline — 6 slayd / 180 saniyə

**Team UNECom · GameTech Bootcamp Baku 2026 · 11 sentyabr, 15:00**

Format: **3 dəqiqə pitch + 2 dəqiqə Q&A**. Jüri beynəlxalq Xsolla komandasıdır —
**səhnədə deyilən hər cümlə İngiliscədir**. Bu sənəddəki izahlar, səhnə
göstərişləri və "niyə belə" qeydləri komandanın öz istifadəsi üçün Azərbaycancadır.

Q&A cavabları üçün → [`qa-defence.md`](./qa-defence.md).
Saniyə-saniyə klik ssenarisi üçün → [`demo-script.md`](./demo-script.md).

---

## Vaxt büdcəsi — cəmi 180 saniyə

| # | Slayd | Vaxt | Müddət | Deyiləcək söz |
|---|---|---|---|---|
| 1 | What you built | 0:00–0:20 | 20 s | 42 |
| 2 | The problem | 0:20–0:51 | 31 s | 71 |
| 3 | Your solution — **canlı demo** | 0:51–2:05 | 74 s | 169 |
| 4 | Features & users | 2:05–2:20 | 15 s | 33 |
| 5 | Monetization | 2:20–2:45 | 25 s | 57 |
| 6 | Your team | 2:45–3:00 | 15 s | 28 |
| | **CƏMİ** | | **180 s** | **400 söz** |

400 söz ÷ 180 saniyə = **133 söz/dəqiqə** — normal təqdimat sürəti (130–150).
Demo kliklərinin pauzaları artıq saniyə büdcəsinin içindədir. **Yeni cümlə
əlavə etmək = başqa bir cümləni silmək.** Məşq edərkən sekundomer işlət.

---

## Slayd 1 — What you built · 0:00–0:20

**Ekranda:** Layihə adı böyük — *Post-Purchase Value Flow · Fraud Radar*,
altında bir sətir: "We trace where in-game value goes after the payment clears."
Komanda adı: **UNECom**. Fon: dashboard-dan götürülmüş qraf ekran görüntüsü,
tutqun.

**De (EN):**
> "We built Fraud Radar. It traces where in-game value goes after the payment
> clears — trades, gifts, marketplace sales, key transfers — and finds the
> laundering rings hiding in that flow. Every tool on the market stops at the
> payment. We start there."

*(42 söz · ~19 s)*

**Niyə belə:** İlk 20 saniyədə jüri "bu nədir?" sualının cavabını almalıdır.
Son iki cümlə bütün pitch-in mövqe cümləsidir — sonrakı hər şey bunu sübut edir.

---

## Slayd 2 — The problem · 0:20–0:51

**Ekranda:** Üç rəqəm, böyük, mənbə adı ilə:

| | |
|---|---|
| **3.41%** | Roblox fraud chargebacks, FY2024 — *SEC 10-K* |
| **≈ $149M** | həmin faizin dollar qarşılığı ($4.37B bookings) |
| **0.26%** | sənaye ortalaması — *Sift Q4 2025* |

Altda bir sitat qutusu: *"nearly all key purchases that end up being traded or
sold on the marketplace are believed to be fraud-sourced"* — Valve, Oktyabr 2019.

**De (EN):**
> "Roblox told the SEC that 3.41 percent of its 4.37 billion dollars of FY2024
> bookings — about 149 million dollars — was lost to fraud chargebacks, and
> named our exact threat model: stolen cards, in-game currency, discounted
> resale off-platform. The cross-industry average is 0.26 percent. Tradeable
> economies are thirteen times more exposed. Valve's fix in 2019 was to delete
> CS:GO key trading entirely. We're the alternative to amputating your own
> economy."

*(71 söz · ~32 s)*

**Niyə belə:** Bu bizim ən güclü slaydımızdır və rəqəmlərin heç biri bizim
deyil — qurbanın öz SEC sənədindəndir. "13×" müqayisəsi bazarın niyə mövcud
olduğunu bir cümlədə izah edir. Valve isə "alternativi nədir?" sualını bağlayır:
alternativ öz iqtisadiyyatını kəsib atmaqdır.

**Diqqət:** "Amputation" sözünü udma — jüri bu metaforanı xatırlayacaq.

---

## Slayd 3 — Your solution · 0:51–2:05 · **EKRAN CANLI DASHBOARD-A KEÇİR**

Bu slayd bir təsvir deyil, **74 saniyəlik canlı demodur**. Dəqiq klik ardıcıllığı
[`demo-script.md`](./demo-script.md)-dədir; aşağıdakı dörd beat onun xülasəsidir.

### 3a · Sıfır quraşdırma — canlı CSV upload · 0:51–1:04 (13 s)

**Ekranda:** Boş dashboard → fayl sürüşdürülür → qraf gözün qabağında qurulur.

**De (EN):**
> "No integration, no API key. A raw event log — trade, gift, marketplace, key
> redeem — dropped straight into the browser. 352 accounts, 2,624 events."

*(25 söz)*

### 3b · Halqa özü çıxır · 1:04–1:13 (9 s)

**Ekranda:** Qırmızı klaster, hub-lar konturlu.

**De (EN):**
> "The graph builds itself. Louvain pulls one dominant ring out of the noise —
> 94.9 percent pure, measured across five seeds."

*(21 söz)*

### 3c · **"Ödəniş anı görünüşü" toggle — ƏSAS FƏRQLƏNDİRİCİ** · 1:13–1:34 (21 s)

**Ekranda:** Toggle basılır. Bayraqlanmış kartın `to` tərəfindəki hesablardan
başqa hər şey solur, köçürmə kənarları tamamilə sönür. Sağda callout canlı
rəqəmləri yazır.

**De (EN):**
> "Now the differentiator. This toggle leaves lit only what a payment-moment
> tool can ever see — the receiving end of a flagged card. Transfer edges go
> dark. It sees [N] accounts. It misses [M], holding [$V], including cash-out
> hubs that never touched a flagged card."

*(46 söz)*

> **[N] / [M] / [$V] ekrandan oxunur, əzbərlənmir.** Callout hər üç rəqəmi
> yüklənmiş datadan hesablayır — hardcode yoxdur. Jüri öz faylını yükləsə,
> öz rəqəmlərini görür. Bunu Q&A-da vurğula.

### 3d · Slider 0.5 → 0.8 — **ən zəif rəqəmimiz sübuta çevrilir** · 1:34–1:58 (24 s)

**Ekranda:** Toggle söndürülür, slider 0.5-dən 0.8-ə çəkilir, hub node-ları
işıqlanır, bayraqlanmış hesab sayı canlı artır.

**De (EN):**
> "Here's our weakest number, used as proof. Measured hub recall at the default
> setting is zero percent — we publish that. A hub is an aged account, no
> velocity, balanced degree: every per-account heuristic calls it a normal
> player. Slider to 0.8 — hub recall zero to one hundred, precision stays at
> one hundred."

*(54 söz)*

**Niyə belə (bunu oxu, sonra unutma):** Best Code münsifləri repo-nu oxuyacaq və
`docs/accuracy.md`-də "Hub recall 0.0%" yazısını tapacaqlar. Onlar bunu tapmazdan
əvvəl biz özümüz deyirik — və bu, zəiflikdən arqumentə çevrilir: *hub-u
per-account skorlama tapa bilmir, çünki hub davranışca normal oyunçudur; onu
yalnız axının strukturu tapır.* Bazarın satdığı şey məhz per-account skorlamadır.

### 3e · Claude izahatı + insan qərarı · 1:58–2:05 (7 s)

**Ekranda:** Investigation panel açıq, Claude mətni + confidence + tövsiyə,
sonra "Fırıldaqdır" → təsdiq.

**De (EN):**
> "Claude writes the case in plain language — evidence, confidence,
> recommendation. It never decides. The analyst does."

*(23 söz — yuxarıdakı cümlə + klik anındakı "Confirmed.")*

---

## Slayd 4 — Features & users · 2:05–2:20

**Ekranda:** İki sütun, mətn minimum.

| Product | Who uses it |
|---|---|
| Value-flow graph (taint · velocity · degree imbalance) | Trust & Safety / enforcement analyst |
| Louvain ring detection + per-ring case queue | Payments / risk lead at a merchant of record |
| Sensitivity slider + per-case threshold override | Game economy / live-ops lead |
| Claude explanation, human decision, nothing auto-banned | |
| Drag-and-drop CSV/JSON · same `/events` API in production | |

**De (EN):**
> "Case queue, keyboard-driven, built for a Trust and Safety analyst — a role
> Rockstar is hiring for right now. Drag-and-drop is the trial door; in
> production the game pushes the same events to our API."

*(33 söz · ~15 s)*

**Niyə belə:** Rockstar-ın açıq vakansiyası personanın uydurma olmadığının
sübutudur — bir cümləyə sığır və "kim istifadə edəcək?" sualını qabaqlayır.
Fayl yükləmənin "production yolu deyil" olduğunu özümüz deməsək, jüri soruşacaq.

---

## Slayd 5 — Monetization · 2:20–2:45

**Ekranda:** `docs/business-case.md` §8-in beş bulleti, qısaldılmış:

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

*(57 söz · ~26 s)*

**Niyə belə:** "our assumption, inside a sourced band" — bu altı söz bizi
"rəqəm uyduran komanda" kateqoriyasından çıxarır. **Onları udma.**
Downside case-i özümüz demək jürinin ən sevimli sualını əlindən alır.

---

## Slayd 6 — Your team · 2:45–3:00

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

*(28 söz · ~13 s)*

**Niyə belə:** Son cümlə qəsdən zəifliyimizi təkrarlayır. Best Code münsifi üçün
bu bir dəvətdir: "repo-nu aç, biz nəyi gizlətdiyimizi yox, nəyi ölçdüyümüzü
görəcəksən." Q&A-nın ilk sualını da bu yönə çəkir — ora ən hazır olduğumuz
sahədir.

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
| 352 hesab / 2,624 hadisə / 94.9% purity / hub recall 0% → 100% | `docs/accuracy.md`, 5 seed | MEASURED (sintetik) |
| Rockstar T&S vakansiyası | themuse.com elanı | SOURCED |

**Qayda:** bu cədvəldə olmayan heç bir rəqəmi səhnədə demə. Jüri mənbə soruşsa,
cavab bir sətirdir — hamısı yuxarıdadır.
