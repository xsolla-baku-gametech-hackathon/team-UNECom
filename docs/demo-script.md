# Demo ssenarisi — saniyə-saniyə

**3 dəqiqə pitch + 2 dəqiqə Q&A · 11 sentyabr 2026, 15:00**

Bu sənəd səhnədə **hansı düymə, hansı klik, nə deyilir** sualını dəqiq bağlayır.
Heç kim "indi harda idi?" deməsin.

**Dil qaydası:** göstərişlər Azərbaycanca, **jüriyə deyilən hər cümlə İngiliscə**,
dırnaqda, olduğu kimi oxunacaq formada.

Slayd strukturu üçün → [`pitch-outline.md`](./pitch-outline.md).
Q&A üçün → [`qa-defence.md`](./qa-defence.md).

---

## 1 · Hazırlıq checklist-i (jüri otağa girməzdən əvvəl)

Bunları **pitch-dən ən azı 10 dəqiqə əvvəl** yoxla. Sırayla.

- [ ] **Engine ayaqdadır** — `cd engine && .venv/bin/uvicorn app.main:app` işləyir,
      `/health` cavab verir.
- [ ] **API ayaqdadır və verilənlər bazası BOŞDUR.** `GET /events` heç nə
      qaytarmamalıdır. Dolu qalıbsa: `npm run prisma:migrate reset` (və ya DB
      faylını sil + `prisma:push`).
      **Niyə:** qraf jürinin gözü qarşısında dolmalıdır — boş ekrandan tam
      şəbəkəyə keçid demonun ən güclü ilk 10 saniyəsidir.
- [ ] **Web dev server açıqdır** — `cd web && npm run dev`, brauzer tab hazır.
- [ ] **Demo faylı MASAÜSTÜNDƏDİR**, adı qısa və görünən:
      `data-generator/output/events.csv` → masaüstünə kopyala.
      Ehtiyat: eyni datanın `events.json` versiyası, yanında.
- [ ] Fayl defolt parametrlərlə generasiya olunub: **352 hesab · 2,624 hadisə ·
      50 mule + 2 hub**. (`python generate.py` — heç bir flag dəyişmə.)
- [ ] **Slider 0.5-dədir** (defolt mövqe).
- [ ] **"Ödəniş anı görünüşü" toggle SÖNÜKDÜR.**
- [ ] **Investigation panel bağlıdır**, heç bir case seçilməyib, upload banner-i
      təmizdir.
- [ ] **Tam ekran (F11).** Brauzer bookmark bar-ı, bildirişlər, Slack — hamısı
      bağlı. Ekran parlaqlığı maksimum (proyektorda tünd tema solğun görünür).
- [ ] Masaüstü fon şəkli neytraldır, fayl adları oxunaqlıdır.
- [ ] Bir dəfə **tam quru məşq** — sekundomerlə, ucadan. Demonun özü 74 saniyədir;
      75-i keçirsə, kəsmə sırasına (bölmə 8) bax.
- [ ] Klaviatura qısayolları yadda: **J/K** növbədə hərəkət · **Enter** təsdiq ·
      **F** fırıldaq · **R** real oyunçu · **/** axtarış · **Esc** ləğv.

---

## 2 · Ssenarinin arxa planı (özün üçün — jüriyə demə)

Yüklənən fayldakı dünya (`data-generator/generate.py` defoltları):

- **300 təmiz hesab**, ~2,500 fon hadisəsi — adi ticarət, hədiyyə, bazar satışı.
  Təmiz populyasiyada ~1% təsadüfi bayraqlanma var.
- **50 `mule_XXX` hesabı** — son saatlarda yaranıb, STORE-dan valyuta alıb
  (alışların **70%-i** ödəniş provayderi tərəfindən bayraqlanıb), dəqiqələr
  içində köçürüb.
- **2 `hub_N` hesabı** — 80–120 gün əvvəl yaranmış, **heç vaxt bayraqlanmış karta
  toxunmayan**, yalnız qəbul edən və sonra bazarda satan cash-out nöqtəsi.

**Ölçülmüş nəticələr** (`docs/accuracy.md`, 5 seed):
default 0.5 → precision 100%, recall 64.6%, **hub recall 0%**;
0.8 → recall 74.2%, **hub recall 100%**, precision hələ də 100%.
Halqa səviyyəsində: purity 94.9%, coverage 80.0%.

**Bu demoda göstərilən hekayənin bir cümləsi:** *hub-u tapmaq üçün slider lazımdır,
çünki hub davranışca normal oyunçudur — və bu, bizim öz ölçmələrimizlə sübutludur.*

---

## 3 · Demo axını — saniyə-saniyə

> Slayd 1 və 2 (0:00–0:51) statik slaydlardır — mətnləri
> [`pitch-outline.md`](./pitch-outline.md)-dədir. **0:51-də ekran dashboard-a
> keçir** və aşağıdakı başlayır.

### ⏱ 0:51–1:04 · Canlı CSV upload — sıfır quraşdırma (13 s)

**Ekran vəziyyəti:** dashboard boşdur, qraf yoxdur, statistika sıfırdır.

**Hərəkət:** Masaüstündəki `events.csv`-i bir anlıq göstər → **sürüşdürüb
yükləmə zonasına burax** (və ya upload modalını aç, faylı seç).

**De (EN) — fayl sürüşərkən:**
> "No integration, no API key. A raw event log — trade, gift, marketplace, key
> redeem — dropped straight into the browser."

**Görünəcək (~2 s):** yaşıl banner — hadisə və unikal hesab sayı; qraf boşdan
tam şəbəkəyə animasiya ilə açılır; StatsBar dolur.

**De (EN) — banner görünəndə, rəqəmləri EKRANDAN OXU:**
> "352 accounts, 2,624 events."

> ⚠️ **Rəqəmləri ekrandan oxu, əzbərdən demə.** Fayl fərqli seed ilə
> generasiya olunubsa rəqəm dəyişər — ekranda nə yazılıbsa, onu de.

---

### ⏱ 1:04–1:13 · Halqa özü çıxır (9 s)

**Hərəkət:** Heç nə klikləmə. Qırmızı klasteri kursorla dövrələ. Sol paneldəki
case queue-nun risk sırası ilə dolduğunu göstər.

**De (EN):**
> "The graph builds itself. Louvain pulls one dominant ring out of the noise —
> 94.9 percent pure, measured across five seeds."

**Görünəcək:** force-directed qraf oturur; hub-lar konturlu node kimi seçilir;
legend risk rənglərini izah edir.

---

### ⏱ 1:13–1:34 · **"Ödəniş anı görünüşü" — ƏSAS AN** (21 s)

**Hərəkət:** Qrafın yuxarısındakı **"Ödəniş anı görünüşü"** toggle-ına klik.

**Görünəcək:**
- Yalnız bayraqlanmış ödənişin `to` tərəfindəki hesablar işıqlı qalır.
- **Bütün köçürmə kənarları tamamilə sönür** — ödəniş prosessoru onları heç vaxt
  görmür.
- Sağda callout açılır: görülən hesab sayı, görülməyən hesab sayı, onların
  əlindəki dəyər, və **heç vaxt bayraqlanmış karta toxunmamış hub sayı** —
  gözdən qaçan hub ID-ləri ayrıca siyahı kimi.

**De (EN) — toggle basılan anda:**
> "Now the differentiator. This toggle leaves lit only what a payment-moment
> tool can ever see — the receiving end of a flagged card. Transfer edges go
> dark."

**De (EN) — callout-u EKRANDAN oxuyaraq:**
> "It sees [N] accounts. It misses [M], holding [$V], including cash-out hubs
> that never touched a flagged card."

> **[N], [M], [$V] — hamısı ekrandan oxunur.** Bu rəqəmlər yüklənmiş datadan
> hesablanır, hardcode deyil. Bu faktı Q&A üçün saxla: jüri öz faylını yükləsə,
> öz rəqəmlərini görəcək.

**Hərəkət (bitirərkən):** Toggle-ı **söndür** — tam dəyər axını geri qayıdır.
Bu geri-keçid vizual olaraq "bax, bazar bunun yalnız bu qədərini görür"
mesajını möhkəmləndirir.

---

### ⏱ 1:34–1:58 · Slider 0.5 → 0.8 — zəif rəqəm sübuta çevrilir (24 s)

**Hərəkət:** Sağ-aşağıdakı **Sensitivity slider**-ə (Sərt ↔ Geniş) əlini qoy,
amma hələ tərpətmə.

**De (EN) — slider-ə əl qoyanda:**
> "Here's our weakest number, used as proof. Measured hub recall at the default
> setting is zero percent — we publish that. A hub is an aged account, no
> velocity, balanced degree: every per-account heuristic calls it a normal
> player."

**Hərəkət:** Slider-i **0.5-dən 0.8-ə** yavaş çək. Hub node-larının işıqlandığını
barmaqla göstər; slider yanındakı bayraqlanmış halqa/hesab sayının canlı
artdığını göstər.

**De (EN) — slider hərəkət edərkən:**
> "Slider to 0.8 — hub recall zero to one hundred, precision stays at one
> hundred."

**Görünəcək:** bayraqlanan hesab sayı ~33.6 → ~38.6 (ölçülmüş orta), hub-lar
qırmızı zonaya keçir, yeni yanlış pozitiv yoxdur.

> **Bu demonun mərkəzi anıdır.** Əgər vaxt daralırsa, başqa hər şeyi kəs, bunu
> kəsmə (bax bölmə 8). Səbəb: bu, "zəifliyi gizlətmirik" mesajını **canlı sübut**
> edir və Best Code münsifinin repo-da tapacağı "Hub recall 0.0%" sətrini
> qabaqlayır.

**Hərəkət:** Slider-i **0.5-ə qaytar** (növbəti addım defolt vəziyyətdə daha
təmiz görünür). Vaxt darsa qaytarma — kritik deyil.

---

### ⏱ 1:58–2:05 · Claude izahatı + insan qərarı (7 s)

**Hərəkət:** Case queue-nun ən yuxarısındakı case-ə klik (və ya **J** ilə seç,
**Enter**). Investigation panel açılır.

**Göstər (barmaqla, oxumadan):** ölçülmüş sübutlar → Claude izahatı → confidence
→ tövsiyə → halqadakı hesablar (hub-lar konturlu).

**De (EN):**
> "Claude writes the case in plain language — evidence, confidence,
> recommendation. It never decides. The analyst does."

**Hərəkət:** **F** (və ya "Fırıldaqdır" düyməsi) → təsdiq ekranı açılır →
**Enter** (və ya "Bəli — fırıldaq") → status "Fırıldaq kimi qeydə alındı".

**De (EN) — təsdiq anında:**
> "Confirmed. Nothing is auto-banned — this is a record for the payments team."

> **Səhv qərar verdinsə:** təsdiq ekranındaykən **Esc** (və ya "Ləğv et") qərarı
> geri qaytarır. Təsdiq artıq basılıbsa geri dönüş yoxdur — **"Növbəti case →"**
> ilə davam et, dayanıb düzəltməyə çalışma.

---

### ⏱ 2:05–3:00 · Slayd 4, 5, 6-ya qayıt

Ekranı slaydlara qaytar. Mətnlər [`pitch-outline.md`](./pitch-outline.md)-dədir:
Features & users (15 s) → Monetization (25 s) → Team (15 s).

**Dashboard-ı bağlama** — Q&A-da geri qayıtmaq lazım ola bilər. Alt+Tab ilə keçid
məşq et.

---

## 4 · Q&A-da dashboard-a qayıtmaq (2 dəqiqə)

Bu üç sualda ekranı yenidən göstərmək cavabı ikiqat gücləndirir:

| Sual | Nə göstər |
|---|---|
| "How is this different from Sift/Kount/Magify?" | **"Ödəniş anı görünüşü"** toggle — 5 saniyə, sözsüz sübut |
| "So you don't detect hubs?" | Slider 0.5 → 0.8, hub-ların işıqlanması |
| "Would it work on our data?" | Upload modalı — "drop your own file" təklifi |

**Jüri öz faylını atmaq istəsə:** qəbul et, amma əvvəlcə de (EN):
> "Happy to — and if the columns don't match, the parser will tell you which
> line and which column. Whatever it finds will be your data's real pattern,
> not our demo's."

---

## 5 · Backup planı — backend ayaqda deyilsə

Dashboard backend-in olmadığını avtomatik hiss edir və eyni ssenarini **yerli
demo data** ilə göstərir. Amma **canlı fayl yükləmə mock rejimdə işləmir** —
upload düyməsi həmişə əsl backend-i sınayır, səssiz mock-a keçmir.

**Nə et:**
1. **0:51–1:04 upload addımını tamamilə atla.**
2. Birbaşa 1:04 beat-indən başla — qraf artıq doludur.
3. **De (EN)** — üzr istəmədən, bir cümlə ilə:
   > "We're running on the local demo dataset here; the upload path pushes the
   > same events through the API."
4. Qazanılan ~13 saniyəni **slider beat-inə** (1:34–1:58) əlavə et — orada
   nəfəs almaq olar.
5. Toggle və slider beat-ləri mock datada da tam işləyir — **əsas mesaj
   itmir.**

---

## 6 · Backup planı — upload uğursuz olarsa (backend var, amma fayl keçmir)

**Görünəcək:** qırmızı xəta banner-i, dashboard əvvəlki vəziyyətdə qalır —
heç nə sınmır.

**Nə et:** Dayanma, izah etmə, təkrar cəhd etmə. Bir cümlə de və davam et.

**De (EN):**
> "The parser is strict about columns — that's deliberate. Let's look at the
> data that's already loaded."

Sonra `events.json` ehtiyat faylını **bir dəfə** sına. O da keçməzsə, mock
rejimlə davam et (bölmə 5).

> **Qayda:** səhnədə eyni şeyi **iki dəfədən çox sınama.** Üçüncü cəhd 15 saniyə
> yeyir və jüri gözündə "işləmir" mesajı qoyur. İki cəhd, sonra irəli.

---

## 7 · Backup planı — Claude API cavab vermirsə

İzahat gecikirsə və ya boş gəlirsə, investigation panel-dəki **ölçülmüş
sübutları** göstər (taint, velocity, imbalance, in/out degree) və de (EN):

> "The evidence is computed locally — the language model only writes it up. The
> case stands without it."

Bu, həm də doğru mesajdır: Claude bizim detection-umuz deyil, izahat qatımızdır.

---

## 8 · KƏSMƏ SIRASI — vaxt çatmasa nə atılır

3 dəqiqə çox qısadır. Səhnədə qərar verməli olsan, **bu sıra ilə** at:

### Birinci atılanlar (mesaj itmir)

1. **1:34-dəki "slider-i 0.5-ə qaytar" hərəkəti** — 2 s. Heç bir itki.
2. **1:04–1:13 "halqa özü çıxır" beat-i** — 9 s. Toggle beat-i onsuz da qrafı
   izah edir; sadəcə purity rəqəmi itir.
3. **Slayd 4 (Features & users)** — 15 s. Bütün məzmunu slaydda qalır, jüri
   oxuyur; demo onsuz da xüsusiyyətləri canlı göstərdi.
4. **1:58–2:05 Claude beat-inin ikinci cümləsi** ("Confirmed. Nothing is
   auto-banned…") — 4 s. Bu fikir Q&A 6-cı sualda onsuz da var.

### İkinci atılanlar (ağrılı, amma mümkün)

5. **0:51–1:04 canlı upload** — 13 s. "Sıfır quraşdırma" mesajı itir, amma
   Slayd 4-də və Q&A-da qalır. Backend problemi olsa onsuz da atılır.
6. **Slayd 2-dəki Valve cümləsi** — 6 s. Rəqəmlər (3.41% / 13×) qalır.

### HEÇ VAXT ATILMAYANLAR

> Bu üçü pitch-in özüdür. Onları atsan, çıxışın səbəbi qalmır.

- 🔴 **1:13–1:34 · "Ödəniş anı görünüşü" toggle.** Bizim yeganə görünən
  fərqləndiricimiz. Bunsuz biz "daha bir fraud dashboard"-uq.
- 🔴 **1:34–1:58 · Slider 0.5 → 0.8 və hub recall reframe-i.** Həm ən güclü
  texniki arqumentimiz, həm də dürüstlük mövqeyimiz.
- 🔴 **Slayd 2-nin ilk cümləsi (3.41% / $149M / Roblox 10-K).** Problemin real
  olduğunun yeganə xarici sübutu.
- 🔴 **Slayd 5-in "$60K, 2.4 ay" cümləsi.** "Monetization" təşkilatçıların
  tələb etdiyi slayddır — rəqəmsiz keçmək qiymət itkisidir.

### Əksinə — vaxt ARTIQ qalsa

Slider beat-indən sonra bir cümlə əlavə et (EN):
> "Ring detection is threshold-independent — the ring is found by structure even
> when its members score below the cut-off."

*(Mənbə: `docs/accuracy.md` — ring coverage 80.0%, purity 94.9%.)*

---

## 9 · Səhnə vərəqi — bir baxışda

```
0:00  S1  "We built Fraud Radar…"                          20s
0:20  S2  3.41% / $149M / 13× / Valve                      31s
0:51  ▶  DASHBOARD
0:51      CSV drop  →  "No integration, no API key…"       13s
1:04      Ring appears  →  "94.9 percent pure…"             9s
1:13   🔴 TOGGLE  →  "Now the differentiator…"             21s
1:34   🔴 SLIDER 0.5→0.8  →  "our weakest number…"         24s
1:58      Claude + F + Enter  →  "It never decides."        7s
2:05  ◀  SLAYDLAR
2:05  S4  Features & users                                 15s
2:20  S5  $1B → $10M → $60K → 2.4 ay                       25s
2:45  S6  Team + "hub recall is zero at default"           15s
3:00  ■  Q&A → qa-defence.md
```
