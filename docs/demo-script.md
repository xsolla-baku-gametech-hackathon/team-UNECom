# Demo ssenarisi — saniyə-saniyə

**3 dəqiqə pitch + 2 dəqiqə Q&A · 11 sentyabr 2026, 15:00**

Bu sənəd səhnədə **hansı fayl, hansı klik, hansı rəqəm, nə deyilir** sualını
bağlayır. Heç kim "indi harda idi?" deməsin.

**Dil qaydası:** göstərişlər Azərbaycanca, **jüriyə deyilən hər cümlə İngiliscə**,
dırnaqda, olduğu kimi oxunacaq formada.

Slayd strukturu və saniyə büdcəsi → [`pitch-outline.md`](./pitch-outline.md) ·
Səhnədə əldə tutulan vərəq → [`speaker-script.md`](./speaker-script.md) · Q&A →
[`qa-defence.md`](./qa-defence.md).

**Bir spiker** — slaydlar, demo, ask. 0:44–0:48: ekran dashboard-a keçir,
spiker klaviaturaya keçir, danışmır (4 s büdcədədir). Üç sənəddəki İngilis
cümlələr hərfən eynidir.

---

## 0 · ⚠️ ƏN VACİB QAYDA — DEMO FAYLI

> ## Repo-dakı `data-generator/output/events.csv` faylını işlət.
> ## Yeni fayl **GENERASİYA ETMƏ**.

**Səbəb (ölçülüb, 10.09.2026):** dashboard halqanı **halqa risk skoru ≥ hədd**
qaydası ilə bayraqlayır (`web/src/lib/deriveGraph.ts`). Defolt slider 0.5 →
hədd **0.56**.

| Fayl | Ən yüksək halqa riski | Slider 0.5-də |
|---|---|---|
| **`output/events.csv`** (repo-dakı, 388 hadisə / 122 hesab) | **0.59** | ✅ **1 halqa bayraqlanır** |
| `python generate.py` ilə yeni defolt fayl (2,626 hadisə / 352 hesab) | 0.50 | ❌ **0 halqa** — boş ekran |

Böyük defolt datasetdə halqa riski həddin **altına** düşür, çünki 300 təmiz
hesab siqnalı seyreldir. Səhnədə boş case queue = pitch bitdi.

**Əgər nədənsə böyük fayl işlədilməlidirsə:** slider-i **0.6-da** aç (hədd 0.49),
0.5-də yox. Ölçülüb: 0.6 → 1 halqa, 0.8 → 2 halqa.

---

## 1 · Hazırlıq checklist-i (jüri otağa girməzdən əvvəl)

Pitch-dən **ən azı 10 dəqiqə əvvəl**, sırayla.

- [ ] **Engine ayaqdadır** — `cd engine && .venv/bin/uvicorn app.main:app --port 8000`,
      `/health` cavab verir.
- [ ] **API ayaqdadır və verilənlər bazası BOŞDUR.** `GET /events` heç nə
      qaytarmamalıdır. Dolu qalıbsa: `npm run prisma:migrate reset` (və ya DB
      faylını sil + `npm run prisma:push`).
      **Niyə:** qraf jürinin gözü qarşısında dolmalıdır — boş ekrandan tam
      şəbəkəyə keçid demonun ən güclü ilk 10 saniyəsidir.
- [ ] **Web dev server açıqdır** — `cd web && npm run dev`, brauzer tab hazır.
- [ ] **`data-generator/output/events.csv` MASAÜSTÜNƏ kopyalanıb**, adı qısa və
      görünən. Ehtiyat: eyni qovluqdakı `events.json` da yanında.
      ⚠️ **Bu qovluq `.gitignore`-dadır** (`data-generator/.gitignore` →
      `output/`). Fayl repo-da YOXDUR, yalnız ölçmənin aparıldığı maşındadır.
      Demo başqa laptopdan gedirsə, faylı USB/mesajla apar — `git clone`
      gətirmir, `generate.py` isə başqa fayl verir (bax bölmə 0).
- [ ] **Fayl yenidən generasiya EDİLMƏYİB** (bax bölmə 0).
- [ ] **Slider 0.5-dədir.**
- [ ] **"Ödəniş anı görünüşü" toggle SÖNÜKDÜR.**
- [ ] **"Yalnız bayraqlanmış halqalar" toggle SÖNÜKDÜR** (qraf tam görünsün).
- [ ] **Investigation panel bağlıdır**, case seçilməyib, upload banner-i təmizdir.
- [ ] **Tam ekran (F11).** Bookmark bar, bildirişlər, Slack — hamısı bağlı.
      Ekran parlaqlığı maksimum (proyektorda tünd tema solğun görünür).
- [ ] Masaüstü fonu neytral, fayl adları oxunaqlı.
- [ ] **Spikerin əlində [`speaker-script.md`](./speaker-script.md) çapı var**
      (və ya telefonda `speaker-script.html`). Başqa vərəq yoxdur.
- [ ] **Bir dəfə tam quru məşq** — sekundomerlə, ucadan, klaviaturaya keçid
      daxil. Demo hissəsi (3a–3e) **77 saniyədir (0:48–2:05)**. 82-ni keçirsə →
      kəsmə sırası (bölmə 8). Bütün pitch 3:00-ı keçirsə → son cümlə (ask)
      mütləq deyilir, kəsilən şey Slayd 4-dür.
- [ ] Klaviatura qısayolları: **J/K** növbədə hərəkət · **Enter** təsdiq ·
      **F** fırıldaq · **R** real oyunçu · **/** axtarış · **Esc** ləğv.

---

## 2 · Gözlənilən ekran vəziyyəti — hamısı ölçülüb

Bunları əzbərlə. Ekranda başqa rəqəm görsən, **ekrandakını de** — amma bu
cədvəldən kənara çıxırsa, fayl səhvdir (bax bölmə 0).

### Yükləmədən sonra (StatsBar)

| | |
|---|---|
| Hadisə | **388** |
| Hesab | **122** |
| Ümumi dəyər | **$26,814** |
| Bayraqlanmış ödəniş | 33 |
| Hadisə tipləri | trade 130 · gift 80 · marketplace_sale 77 · purchase 75 · key_redeem 26 |

### Halqalar (engine çıxışı)

| Halqa | UI risk | Hesab | Dəyər | Bayraqlı alış | Hub namizədi |
|---|---|---|---|---|---|
| `ring_3` | **0.59** | 35 | $6,616 | 26 | `hub_1` |
| `ring_5` | 0.42 | 16 | $2,591 | 6 | `acct_0000`, `acct_0026`, `hub_2` |
| `ring_4` | 0.27 | 3 | $281 | 0 | — |

### Slider hansı halqanı açır

| Slider | Hədd | Bayraqlanan halqa |
|---|---|---|
| **0.5** (açılış) | 0.56 | `ring_3` — **1 halqa** |
| 0.6 | 0.49 | `ring_3` — 1 halqa |
| **0.7 / 0.8** | 0.42 / 0.34 | `ring_3` + `ring_5` — **2 halqa** |

### "Ödəniş anı görünüşü" callout-u

| Slider | Görür | Görmür | Dəyər | Gözdən qaçan hub |
|---|---|---|---|---|
| **0.5** | **33** | **9** | **$7,607** | **1 / 1** (`hub_1`) |
| 0.7 / 0.8 | 33 | 19 | $10,571 | 4 / 4 |

**Miqyas körpüsü (0.5-də):** $7,607 ÷ $26,814 = **28.4%** → səhnədə
"twenty-eight percent", aşağı yuvarlaqlanıb. "Every dollar here" = StatsBar-dakı
ümumi dəyər. Callout dəyəri halqa dəyərindən ($6,616) niyə böyükdür →
[`qa-defence.md`](./qa-defence.md) №11.

> 🔴 **0.7+-də callout `acct_0000` və `acct_0026`-nı da "cash-out hub" kimi
> adlandırır — bunlar təmiz hesablardır.** `hub_candidates` sırf
> degree-imbalance evristikasıdır, halqa üzvlüyü deyil. Ona görə **toggle-ı
> yalnız 0.5-də göstər**, slider hərəkətini toggle sönük vəziyyətdə et. Jüri
> özü 0.8-də toggle-ı açsa, bu bir zəiflik deyil — hazır cavabımız var
> ([`qa-defence.md`](./qa-defence.md) №3, "false positive power move").

---

## 3 · Ssenarinin arxa planı (özün üçün — jüriyə demə)

- **~70 təmiz hesab**, adi ticarət/hədiyyə/bazar fəaliyyəti.
- **50 `mule_XXX`** — yeni yaranıb, STORE-dan alıb (alışların ~70%-i ödəniş
  provayderi tərəfindən bayraqlanıb), dəqiqələr içində köçürüb.
- **2 `hub_N`** — 80–120 gün əvvəl yaranmış, **heç vaxt bayraqlanmış karta
  toxunmayan**, yalnız qəbul edən və sonra bazarda satan cash-out nöqtəsi.

**Ölçülmüş dəqiqlik** (`docs/accuracy.md`, 5 seed, hesab-səviyyəli):
0.5 → precision 100%, recall 64.6%, **hub recall 0%**;
0.8 → recall 74.2%, **hub recall 100%**, precision 100%.
Halqa səviyyəsində: purity 94.9%, coverage 80.0%.

> ⚠️ **Bu iki mexanizmi qarışdırma.** `accuracy.md` **hesabı** öz risk skoruna
> görə ölçür. Dashboard isə **halqanı** halqa skoruna görə bayraqlayır və node
> rəngi sabit bantlardır (`riskColor`, 0.75 / 0.5) — **slider node rəngini
> dəyişmir**. Ekranda "hub-lar işıqlanır" baş vermir; **ikinci halqa peyda
> olur, hub_2 onun içindədir**. Səhnədə deyilən cümlə qəsdən "precision still
> one hundred **at the account level**" formasındadır — son üç söz bu fərqin
> özüdür. "Zero percent" demo beat-ində deyilmir, yalnız Slayd 6-da.

---

## 4 · Demo axını — saniyə-saniyə

> Slayd 1 və 2 (0:00–0:44) statikdir — mətnlər
> [`pitch-outline.md`](./pitch-outline.md)-dədir. **0:44-də "exposed" deyilir,
> ekran dashboard-a keçir, spiker klaviaturaya keçir. 0:48-də danışıq davam
> edir.** Bu 4 saniyə büdcədədir — tələsmə, amma boş da dayanma: bu 4 saniyədə
> faylı masaüstündə tap və kursoru üstünə qoy.

### ⏱ 0:48–0:59 · Canlı CSV upload — sıfır quraşdırma (8 s danışıq + 3 s boşluq)

**Ekran:** dashboard boşdur, qraf yoxdur, statistika sıfırdır.

**Hərəkət:** Masaüstündəki `events.csv`-i **sürüşdürüb yükləmə zonasına burax**.

**De (EN) — fayl sürüşərkən:**
> "No integration, no API key. A raw event log, dropped into the browser."

**`[gözlə — qraf qurulur, 2 s]`** yaşıl banner; qraf boşdan tam şəbəkəyə açılır;
StatsBar dolur — **388 hadisə · 122 hesab · $26,814**.

**De (EN) — banner görünəndə, EKRANDAN OXU:**
> "122 accounts, 388 events."

---

### ⏱ 0:59–1:07 · Halqa özü çıxır (8 s)

**Hərəkət:** Heç nə klikləmə. Qırmızı klasteri kursorla dövrələ. Sol paneldəki
case queue-nun dolduğunu göstər — **bir case: `ring_3`, risk 0.59, 35 hesab**.
`hub_1` daha iri və konturlu node kimi görünür.

**De (EN):**
> "The graph builds itself. Louvain pulls the ring out of the noise: 94.9 percent measured purity, five seeds."

---

### ⏱ 1:07–1:40 · **"Ödəniş anı görünüşü" + miqyas körpüsü — ƏSAS AN** (30 s + 3 s)

**Hərəkət:** Qrafın üstündəki **"Ödəniş anı görünüşü"** toggle-ına klik.
**Slider 0.5-də olmalıdır** (bax bölmə 2-dəki xəbərdarlıq).

**Görünəcək:**
- Yalnız bayraqlanmış ödənişin `to` tərəfindəki hesablar işıqlı qalır.
- **Bütün köçürmə kənarları tamamilə sönür.**
- Callout: **görür 33 · görmür 9 · $7,607 · gözdən qaçan hub 1 (1 hub-dan)**,
  altda `hub_1` etiketi.

**De (EN) — toggle basılan anda:**
> "Now the differentiator. This toggle shows a payment-moment tool's entire view: the receiving end of a flagged card."

**`[callout-u tap, 2 s]`** — sağdakı panelə bax, rəqəmləri oxu:

**De (EN) — callout-u EKRANDAN oxuyaraq:**
> "It sees 33 accounts. It misses 9, holding seven thousand six hundred dollars, including a cash-out hub that never touched a card."

**De (EN) — miqyas körpüsü, kursor StatsBar-dakı $26,814-ə:**
> "Twenty-eight percent of every dollar here lands in accounts a payment-time tool cannot see. The file is small. The blind spot behind Roblox's 149 million is not."

> Bu rəqəmlər yüklənmiş datadan hesablanır, hardcode deyil — jüri öz faylını
> yükləsə, öz rəqəmlərini görür. Bu faktı Q&A üçün saxla. "Never touched a
> card" ölçülüb: `hub_1`/`hub_2` STORE-dan heç alış etməyib.

**Hərəkət (bitirərkən):** Toggle-ı **söndür**. Tam dəyər axını geri qayıdır.

---

### ⏱ 1:40–1:56 · Həddi qaldır — ikinci halqa (12 s + 4 s)

**Hərəkət:** Sağ-aşağıdakı **Sensitivity slider**-ə (Sərt ↔ Geniş) əl qoy, hələ
tərpətmə. Toggle **sönük** olmalıdır.

**De (EN) — slider-ə əl qoyanda:**
> "A hub is aged, low-velocity, never flagged: invisible to per-account scoring."

**`[slider 0.5 → 0.8, yavaş, 3 s]`**

**Görünəcək (ölçülüb):** bayraqlanmış halqa sayı **1 → 2**; ikinci halqa
(`ring_5`, 16 hesab) rənglənir; **`hub_2` onun içindədir**; case queue-da ikinci
case peyda olur.

**De (EN) — ikinci halqa görünəndə:**
> "Raise the threshold: a second ring surfaces, hub inside, precision still one hundred at the account level."

> 🔴 **Bu demonun mərkəzi anıdır.** Vaxt daralsa belə kəsmə (bölmə 8).
> "Zero percent" burada DEYİLMİR — Slayd 6-da "the doc that says our hub recall
> is zero at default" cümləsi ilə bir dəfə, düzgün çərçivədə deyilir və Q&A-nı
> [`qa-defence.md`](./qa-defence.md) №2-yə çəkir. Səbəb `pitch-outline.md`
> 3d-dədir. **"At the account level"** üç sözü udma — 0.8-də toggle açılsa
> callout 4 hub sayır, 2-si təmizdir (№3).

**Hərəkət:** Slider-i **0.5-ə qaytar** (növbəti addım daha təmiz görünür). Vaxt
darsa qaytarma — kritik deyil.

---

### ⏱ 1:56–2:05 · Claude izahatı + insan qərarı (6 s + 3 s)

**Hərəkət:** Case queue-nun ən yuxarısındakı `ring_3` case-inə klik (və ya **J**,
sonra **Enter**). Investigation panel açılır.

**Göstər (barmaqla, oxumadan):** ölçülmüş sübutlar → Claude izahatı →
confidence → tövsiyə → halqadakı hesablar (`hub_1` konturlu).

**De (EN):**
> "Claude writes the case: evidence, confidence, recommendation. It never decides. The analyst does. Confirmed."

**Hərəkət:** **F** (və ya "Fırıldaqdır") → təsdiq ekranı → **Enter** (və ya
"Bəli — fırıldaq") → status **"Fırıldaq kimi qeydə alındı"**. "Confirmed" sözü
Enter-lə eyni anda deyilir.

> **Səhv qərar verdinsə:** təsdiqdən ƏVVƏL **Esc** (və ya "Ləğv et") geri
> qaytarır. Təsdiq basılıbsa geri dönüş yoxdur — **"Növbəti case →"** ilə davam
> et, dayanıb düzəltməyə çalışma.

---

### ⏱ 2:05–3:00 · Slayd 4, 5, 6-ya qayıt

Ekranı slaydlara qaytar: Features & users (13 s) → Monetization (19 s) →
Team + ask (23 s). Mətnlər [`pitch-outline.md`](./pitch-outline.md)-dədir.

**Son cümlə ask-dır, "Thank you" deyilmir.** Son söz "went", 1 saniyə sükut,
Q&A.

**Dashboard-ı bağlama** — Q&A-da qayıtmaq lazım ola bilər. **Alt+Tab** keçidini
məşq et.

---

## 5 · Q&A-da dashboard-a qayıtmaq (2 dəqiqə)

| Sual | Nə göstər |
|---|---|
| "How is this different from Sift/Kount/Magify?" | **"Ödəniş anı görünüşü"** toggle, slider 0.5-də — 5 saniyə, sözsüz sübut |
| "So you don't detect hubs?" | Slider 0.5 → 0.8, ikinci halqa + `hub_2` |
| "What's your false positive rate?" | Slider 0.8 + toggle → `acct_0000`/`acct_0026` (bax `qa-defence.md` №3) |
| "Would it work on our data?" | Upload modalı — "drop your own file" |
| "Why is the missed value bigger than the ring's value?" | Heç nə göstərmə — `qa-defence.md` №11, 5 saniyəlik cavab |

**Jüri öz faylını atmaq istəsə** — qəbul et, əvvəlcə de (EN):
> "Happy to — and if the columns don't match, the parser will tell you which
> line and which column. Whatever it finds will be your data's real pattern,
> not our demo's."

---

## 6 · Backup — backend ayaqda deyilsə

Dashboard bunu avtomatik hiss edir və eyni ssenarini **yerli demo data** ilə
göstərir. Amma **canlı fayl yükləmə mock rejimdə işləmir** — upload düyməsi
həmişə əsl backend-i sınayır.

1. **0:48–0:59 upload addımını tamamilə atla.**
2. Birbaşa 0:59 beat-indən başla — qraf artıq doludur.
3. **De (EN)** — üzr istəmədən, bir cümlə:
   > "We're running on the local demo dataset here; the upload path pushes the
   > same events through the API."
4. Qazanılan ~11 saniyəni **slider beat-inə** əlavə et — və ya bölmə 8-in
   "vaxt artıq qalsa" cümlələrindən birini de.
5. **Mock datanın rəqəmləri bölmə 2-dəkindən fərqlidir** — ekrandan oxu,
   əzbərdən demə. Toggle və slider beat-ləri mock-da da işləyir, əsas mesaj
   itmir.

---

## 7 · Backup — upload uğursuz olarsa / Claude cavab verməsə

**Upload xətası:** qırmızı banner çıxır, dashboard əvvəlki vəziyyətdə qalır —
heç nə sınmır. Dayanma, izah etmə.

**De (EN):**
> "The parser is strict about columns — that's deliberate. Let's look at the
> data that's already loaded."

Sonra `events.json` ehtiyatını **bir dəfə** sına. O da keçməsə → bölmə 6.

> **Qayda:** eyni şeyi **iki dəfədən çox sınama.** Üçüncü cəhd 15 saniyə yeyir
> və jüri gözündə "işləmir" mesajı qoyur.

**Claude izahatı gecikirsə/boşdursa:** panel-dəki **ölçülmüş sübutları** göstər
(taint, velocity, imbalance, in/out degree) və de (EN):
> "The evidence is computed locally — the language model only writes it up. The
> case stands without it."

Bu həm də doğru mesajdır: Claude bizim detection-umuz deyil, izahat qatımızdır.

---

## 8 · KƏSMƏ SIRASI — vaxt çatmasa nə atılır

Yeni büdcədə (349 söz, 156 s danışıq + 24 s boşluq) kəsməyə ehtiyac az
olmalıdır. Amma məşqdə 3:00-ı keçirsə, bu sıra ilə:

### Birinci atılanlar (mesaj itmir)

1. **Slider-i 0.5-ə qaytarmaq** (1:56-dakı) — 2 s. Heç bir itki.
2. **0:59–1:07 "halqa özü çıxır" beat-i** — 8 s. Toggle beat-i qrafı onsuz da
   izah edir; yalnız purity rəqəmi itir.
3. **Slayd 4 (Features & users)** — 13 s. Məzmun slaydda qalır, jüri oxuyur.
4. **Claude beat-inin "Confirmed" hissəsi** — 2 s. Q&A №6-da onsuz da var.

### İkinci atılanlar (ağrılı, amma mümkün)

5. **0:48–0:59 canlı upload** — 11 s. "Sıfır quraşdırma" mesajı Slayd 4-də və
   Q&A-da qalır. Backend problemi olsa onsuz da atılır.
6. **3c-nin son cümləsi** ("The file is small. The blind spot behind Roblox's
   149 million is not.") — 6 s. 28% rəqəmi qalır, körpünün yalnız
   Roblox-a qayıdan yarısı itir.

### HEÇ VAXT ATILMAYANLAR

> Bu beşi pitch-in özüdür.

- 🔴 **0:00 · Soyuq açılış (Valve).** Onsuz pitch tərif ilə başlayır və ilk
  5 saniyə itir. Zatən keçmişdə qalır — kəsilə bilməz.
- 🔴 **1:07–1:40 · "Ödəniş anı görünüşü" toggle + 28%.** Yeganə görünən
  fərqləndiricimiz və miqyas körpüsü. Bunsuz biz "daha bir fraud dashboard"-uq.
- 🔴 **1:40–1:56 · Slider 0.5 → 0.8, ikinci halqa.** Ən güclü texniki
  arqumentimiz; "at the account level" daxil.
- 🔴 **Slayd 2-nin ilk cümləsi (3.41% / $149M / Roblox 10-K).** Problemin real
  olduğunun yeganə xarici sübutu — və 3c-nin körpüsü ona qayıdır.
- 🔴 **Slayd 6-nın ask cümləsi.** "We're not asking you to believe synthetic
  numbers…" — pitch-in yadda qalan son cümləsi. Vaxt bitirsə belə, moderator
  kəssə belə, **bu cümlə deyilir**. Slayd 5-in "$60K, 2.4 ay" cümləsi də
  onun qabağındadır — ikisi bir yerdə 30 saniyədir, 2:30-da hələ Slayd 4-dəsənsə
  Slayd 4-ü at, 5 və 6-nı de.

### Vaxt ARTIQ qalsa

Sırayla, hər biri bir cümlə (EN):

1. Slayd 5-in sonuna, downside case (səhnədən qəsdən çıxarılıb, slaydda var):
   > "And if our detection is three times worse than we assume, still under seven months."
2. Slider beat-indən sonra:
   > "Ring detection is threshold-independent — the ring is found by structure even when its members score below the cut-off."
   *(Mənbə: `accuracy.md` — ring coverage 80.0%, purity 94.9%.)*

---

## 9 · Səhnə vərəqi — bir baxışda

Tam mətn (yalnız İngilis, çap üçün) → [`speaker-script.md`](./speaker-script.md).

```
FAYL: data-generator/output/events.csv   ·   SLIDER: 0.5   ·   TOGGLE: OFF
BİR SPİKER   ·   0:44–0:48 EKRAN → DASHBOARD, KLAVİATURAYA KEÇ (4 s, danışma)

0:00  S1a  Valve 2019 "amputation" → "We built the alternative."   10s
0:10  S1b  "Fraud Radar traces…" · "We start there."               13s+3
0:26  S2  3.41% / $149M / 0.26% / 13× → son söz "exposed"        17s+5
0:44  ▶  DASHBOARD · klaviaturaya keç (4 s)
0:48  3a  CSV drop [qraf 2s] → 388 · 122 · $26,814                8s+3
0:59  3b  1 halqa: ring_3, 0.59 → "94.9 percent measured purity"  8s
1:07  3c  🔴 TOGGLE → 33 / 9 / $7,607 / 1 hub → 28% → 149M        30s+3
1:40  3d  🔴 SLIDER 0.5→0.8 [3s] → 2 halqa, hub_2 · "account level" 12s+4
1:56  3e  J → Enter → panel → F → Enter → "Confirmed."              6s+3
2:05  ◀  SLAYDLAR
2:05  S4  T&S analyst / Rockstar / trial door → API               12s+1
2:18  S5  $1B → 1% (assumption) → $10M → $60K → 2.4 ay            18s+1
2:37  S6  "hub recall is zero at default" → ASK: $5,000 · 90 days 22s+1
3:00  ■  son söz "went" → Q&A → qa-defence.md (əzbər 3: №1, №2, №10)
```
