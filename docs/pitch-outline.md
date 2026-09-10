# Pitch outline — 6 slayd / 180 saniyə / 1 spiker

**Team UNECom · GameTech Bootcamp Baku 2026 · 11 sentyabr, 15:00**

Format: **3 dəqiqə pitch + 2 dəqiqə Q&A**. Jüri beynəlxalq Xsolla komandasıdır —
**səhnədə deyilən hər cümlə İngiliscədir**. İzahlar, səhnə göstərişləri və
"niyə belə" qeydləri komandanın öz istifadəsi üçün Azərbaycancadır.

Üç sənəd, üç iş:

| Sənəd | Nə üçündür |
|---|---|
| **bu fayl** | slayd məzmunu, saniyə büdcəsi, "niyə belə" |
| [`demo-script.md`](./demo-script.md) | rejissor ssenarisi: klik-klik, backup planları, kəsmə sırası |
| [`speaker-script.md`](./speaker-script.md) | **səhnədə əldə tutulan yeganə vərəq** — yalnız İngilis mətn |
| [`qa-defence.md`](./qa-defence.md) | Q&A cavabları |

**Üç sənəddəki İngilis cümlələr hərfən eynidir.** Birini dəyişsən, üçünü dəyiş.

> **Bu sənəddəki hər rəqəm ölçülüb.** Dashboard rəqəmləri demo faylı
> (`data-generator/output/events.csv`) engine-dən keçirilərək 10.09.2026-da
> yoxlanılıb. Dəqiqlik rəqəmləri [`accuracy.md`](./accuracy.md)-dən, biznes
> rəqəmləri [`business-case.md`](./business-case.md)-dəndir.

---

## Spiker — bir nəfər

Pitch-i **bir spiker** aparır: slaydlar, demo, ask — hamısı. Klaviatura onun
qabağındadır, demo cümlələrini klik edən adam özü deyir.

**Kritik an: 0:39–0:49.** Slayd 3 (texnologiya) 6 saniyə danışılır, spiker bu
vaxt laptopa doğru gedir; son söz "ring" → klik → ekran dashboard-a → əl siçana,
faylı masaüstündə tap. **Bu 3 saniyə büdcədədir — danışma, tələs də yox.** Səhnədə ən çox itirilən vaxt "hardadır
fayl?" anıdır; masaüstündə faylı əvvəlcədən görünən yerə qoy
(`demo-script.md` §1).

**Execution & Teamwork meyarı** iki spikerlə yox, Slayd 6-nın komanda cədvəli və
repo-dakı rol bölgüsü ilə göstərilir (engine / API / dashboard / evaluation).
Q&A-da komandanın başqa üzvləri öz sahələrinin sualına cavab verə bilər —
bu, "komanda" mesajını ötürmə riski olmadan verir.

---

## Vaxt büdcəsi — cəmi 180 saniyə

### Qayda

- **Danışıq: maksimum 350 söz.** 350 ÷ 135 söz/dəq = **156 saniyə**.
- **Qəsdən boşluq: 24 saniyə.** Bunlar itki deyil, büdcədir:

| Boşluq | s |
|---|---|
| qraf render (fayl atıldıqdan sonra) | 2 |
| callout-u tapıb ekrandan oxumaq | 2 |
| slider çəkmək | 3 |
| ekran dashboard-a keçir, klaviaturaya keçmək | 3 |
| slayd keçidləri (6 × 1 s) | 6 |
| bir büdrəmə ehtiyatı | 5 |
| açılış / bağlanış nəfəsi | 3 |
| **cəmi** | **24** |

**Niyə 350, 409 yox** (hazırda 346)**:** köhnə büdcə 409 söz / 180 s = 136 söz/dəq idi — yəni
sıfır fasilə, sıfır klik vaxtı, sıfır büdrəmə. Real məşqdə o pitch 3:15–3:35
çəkir və kəsilən şey həmişə son slayd — yəni ask — olur. İndi ask-ın 22
saniyəsi qorunur.

### Cədvəl

| # | Slayd | Vaxt | Söz | Danışıq s | Boşluq s | Cəmi s | Boşluğun tərkibi |
|---|---|---|---|---|---|---|---|
| 1 | Soyuq açılış + What you built | 0:00–0:26 | 51 | 23 | 3 | 26 | açılış nəfəsi 2 · keçid 1 |
| 2 | The problem | 0:26–0:39 | 28 | 12 | 1 | 13 | keçid 1 |
| 3·0 | Your solution · **texnologiya** | 0:39–0:49 | 14 | 6 | 4 | 10 | keçid 1 · **klaviaturaya keçmək 3** |
| 3a | Demo · CSV upload | 0:49–1:00 | 17 | 8 | 3 | 11 | render 2 · büdrəmə 1 |
| 3b | Demo · halqa çıxır | 1:00–1:08 | 18 | 8 | 0 | 8 | — |
| 3c | Demo · **toggle + 28%** | 1:08–1:41 | 66 | 30 | 3 | 33 | callout oxu 2 · büdrəmə 1 |
| 3d | Demo · slider 0.5→0.8 | 1:41–1:57 | 28 | 12 | 4 | 16 | slider 3 · büdrəmə 1 |
| 3e | Demo · Claude + qərar | 1:57–2:06 | 14 | 6 | 3 | 9 | büdrəmə 2 · keçid 1 |
| 4 | Features & users | 2:06–2:18 | 25 | 11 | 1 | 12 | keçid 1 |
| 5 | Monetization | 2:18–2:37 | 40 | 18 | 1 | 19 | keçid 1 |
| 6 | Team + **ask** | 2:37–3:00 | 45 | 22 | 1 | 23 | bağlanış nəfəsi 1 |
| | **CƏMİ** | | **346** | **156** | **24** | **180** | |

Danışıq saniyəsi = söz ÷ 135 × 60, tam ədədə yuvarlaqlanıb. Slayd 6-nın 45 sözü
22 s-yə uzadılıb (~123 söz/dəq) — ask cümləsi qəsdən yavaş deyilir; 3c 29.3 → 30. Demo hissəsi (3a–3e):
**0:49–2:06, 77 s**.

**Yeni cümlə əlavə etmək = başqa bir cümləni silmək.** Söz sayını yoxlamaq:

```bash
awk '/^\*\*De \(EN\)/{f=1;buf="";next} f&&/^>/{sub(/^> /,"");buf=buf" "$0;next} \
     f&&!/^>/{n=split(buf,a," ");t+=n;print n; f=0} END{print "CƏMİ:",t}' \
     docs/pitch-outline.md
```

---

## Slayd 1 — Soyuq açılış + What you built · 0:00–0:26

### 1a · Soyuq açılış (ilk build, 0:00–0:10)

**Ekranda:** Qara fon. Yalnız bir sitat, böyük:
*"nearly all key purchases that end up being traded or sold on the marketplace
are believed to be fraud-sourced"* — Valve, Oktyabr 2019. Başqa heç nə.

**De (EN):**
> "In 2019, Valve's answer to fraud was amputation: delete CS:GO key trading. Still the state of the art. We built the alternative."

*(22 söz · ~10 s)*

**Niyə belə:** Köhnə açılış tərif idi — jüri ilk 5 saniyədə "daha bir fraud
dashboard" qərarını verib telefona baxır. İndi ilk cümlə bir faktdır (mənbəli),
ikinci cümlə iddia, üçüncü cümlə biz. "Amputation" sözü qəsdən buradadır —
Slayd 2-dən köçürülüb, jüri bu metaforanı 3 dəqiqə sonra da xatırlayır. Söz
xərci sıfır: Valve cümləsi Slayd 2-dən çıxıb.

### 1b · What you built (ikinci build, klik, 0:10–0:23)

**Ekranda:** Layihə adı böyük — *Post-Purchase Value Flow · Fraud Radar*,
altında bir sətir: "We trace where in-game value goes after the payment clears."
Komanda adı: **UNECom**. Kiçik: trade · gift · marketplace sale · key redeem.

**De (EN):**
> "Fraud Radar traces where in-game value goes after the payment clears, and finds the laundering rings in that flow. Every other tool stops at the payment. We start there."

*(29 söz · ~13 s)*

**Niyə belə:** Son iki cümlə bütün pitch-in mövqe cümləsidir — sonrakı hər şey
onu sübut edir. Hadisə tipləri (trade, gift, ...) səhnədən çıxıb slayda keçdi:
oxunur, deyilmir.

---

## Slayd 2 — The problem · 0:26–0:39

**Ekranda:** Üç rəqəm, böyük, mənbə adı ilə — **maksimum 3 element**:

| | |
|---|---|
| **3.41%** | Roblox fraud chargebacks, FY2024 — *SEC 10-K* ($4.37B bookings) |
| **≈ $149M** | həmin faizin dollar qarşılığı |
| **0.26%** | sənaye ortalaması — *Sift Q4 2025* → **13×** |

**De (EN):**
> "Roblox told the SEC that 3.41 percent of its 2024 bookings, 149 million dollars, went to fraud chargebacks. Industry average: 0.26 percent. Tradeable economies: thirteen times more exposed."

*(28 söz · ~12 s)*

**Niyə belə:** Rəqəmlərin heç biri bizim deyil — qurbanın öz SEC sənədindəndir.
"13×" bazarın niyə mövcud olduğunu bir cümlədə izah edir. $4.37B artıq
deyilmir — slaydda qalır, jüri oxuyur; səhnədə iki böyük rəqəm bir cümlədə
büdrəmə yeridir. Valve buradan çıxıb açılışa keçdi. **Threat-model cümləsi
("stolen cards, in-game currency, resale off-platform") səhnədən çıxıb slayda
keçdi** — 11 sözü Slayd 3-ün texnologiya cümləsinə verdik; slaydda 3.41%-in
altındakı caption kimi qalır.

**Son söz "exposed" → klik → Slayd 3.** 0:39.

---

## Slayd 3 — Your solution · 0:39–2:06 · texnologiya slaydı + **CANLI DASHBOARD**

Təşkilatçının şablonu (Nikita-nın participant deck-i) Slayd 3-ü belə təsvir edir:
*"How it solves the problem, what makes it unique and innovative, **and which
technologies you used**."* Ona görə Slayd 3 iki hissədir: 10 saniyəlik statik
texnologiya slaydı, sonra **77 saniyəlik canlı demo**. Klik ardıcıllığı
[`demo-script.md`](./demo-script.md)-dədir.

### 3·0 · Necə işləyir — texnologiya slaydı · 0:39–0:49 (6 s danışıq + 4 s boşluq)

**Ekranda:** Mansur Mustafayev-in workshop slaydlarının formatında — böyük
başlıq, **Problem:** / **Build:** iki sətir, sağda onun "How money moves in a
game" hunisi (bizim yerimiz 7-ci və 8-ci pillə arasında), altda stack sətri.
Dəqiq məzmun [`deck-design-prompt.md`](./deck-design-prompt.md) §5 / 03.

**De (EN):**
> "Four signals per account: tainted value, velocity, degree imbalance, community. Louvain finds the ring."

*(14 söz · ~6 s)*

**Niyə belə:** Köhnə versiyada Slayd 3 qara "▶ live" kartı idi və texnologiya
heç yerdə deyilmirdi — Technical Feasibility meyarında boş xana. Cümlə koddan
gəlir: `risk_scoring.py` çəkiləri taint 0.40 · velocity 0.25 · imbalance 0.20 ·
community 0.15 (slaydda yazılır, səhnədə deyilmir), `community.py` Louvain.
Söz xərci Slayd 2-nin threat-model cümləsi ilə ödənildi.

**Xoreoqrafiya:** cümlə deyilərkən spiker artıq laptopa doğru gedir. Son söz
"ring" → klik → ekran dashboard-a → əl siçana. 0:45–0:49, danışma.

### 3a · Sıfır quraşdırma — canlı CSV upload · 0:49–1:00 (8 s danışıq + 3 s boşluq)

**Ekranda:** Boş dashboard → fayl sürüşdürülür → qraf gözün qabağında qurulur.
**Gözlənilən nəticə (ölçülüb):** 388 hadisə, 122 hesab, $26,814 dövriyyə.

**De (EN):**
> "No integration, no API key. A raw event log, dropped into the browser. 122 accounts, 388 events."

*(17 söz)*

### 3b · Halqa özü çıxır · 1:00–1:08 (8 s)

**Ekranda:** Bir halqa bayraqlanır (`ring_3`, UI risk **0.59**, 35 hesab,
$6,616, 26 bayraqlanmış alış). Hub konturlu və daha iri node kimi görünür.

**De (EN):**
> "The graph builds itself and pulls the ring out of the noise: 94.9 percent measured purity, five seeds."

*(18 söz)*

### 3c · **"Ödəniş anı görünüşü" + miqyas körpüsü — ƏSAS AN** · 1:08–1:41 (30 s + 3 s)

**Ekranda:** Toggle basılır. Yalnız bayraqlanmış ödənişin `to` tərəfindəki
hesablar işıqlı qalır, köçürmə kənarları tamamilə sönür, sağda callout açılır.

**Gözlənilən callout (0.5-də ölçülüb):** görür **33** · görmür **9** ·
**$7,607** · gözdən qaçan hub **1 / 1** (`hub_1`).

**De (EN):**
> "The differentiator. This toggle shows a payment-moment tool's entire view: the receiving end of a flagged card. It sees 33 accounts. It misses 9, holding seven thousand six hundred dollars, including a cash-out hub that never touched a card. Twenty-eight percent of every dollar here lands in accounts a payment-time tool cannot see. The file is small. The blind spot behind Roblox's 149 million is not."

*(66 söz · ~30 s)*

> **Rəqəmləri ekrandan oxu.** Callout həmişə yüklənmiş datadan hesablayır —
> hardcode yoxdur. Jüri öz faylını yükləsə, öz rəqəmlərini görür. Bu faktı Q&A
> üçün saxla.

**Niyə belə — miqyas körpüsü:** Köhnə versiyada 0:31-də "149 million", 1:22-də
"seven thousand six hundred" deyilirdi və aralarında heç nə yox idi — demo
oyuncaq görünürdü. İndi üç cümlə körpü qurur:

1. **"Twenty-eight percent of every dollar here"** — $7,607 ÷ $26,814 = 28.4%,
   səhnədə aşağı yuvarlaqlanıb. Bu, miqyasdan asılı olmayan nisbətdir və
   Slayd 2 ilə eyni dildə (faiz) danışır.
2. **"The file is small. The blind spot ... is not."** — dollar rəqəmini
   özümüz kiçik adlandırırıq, jüri yox.
3. **"...behind Roblox's 149 million"** — Slayd 2-nin rəqəminə qayıdış. Roblox
   10-K-də mexanizmi özü yazıb: oğurlanmış kart → Robux → kənar satış. Bu, məhz
   alışdan sonrakı dəyər hərəkətidir.

**Redaktor qərarı — audit "apply that shape to the billion dollars Xsolla
published" təklif etmişdi, tətbiq ETMƏDİM.** Səbəb: "28 percent" və "one
billion" eyni nəfəsdə deyiləndə jüri başında 280 milyon vurur, və bir sual
("are you claiming 28% of Xsolla's volume is laundered?") pitch-i yıxır. Bizim
sintetik faylda 122 hesabın 50-si mule-dur — real iqtisadiyyatın sıxlığı deyil.
Nisbət *bizim faylın* nisbətidir; körpü isə Slayd 2-nin artıq deyilmiş 149M-inə
atılır, Slayd 5-in hələ deyilməmiş $1B-nə yox. $1B Slayd 5-də təzə qalır.

**"Never touched a card" (flagged yox):** ölçülüb — `hub_1` və `hub_2`
STORE-dan heç bir alış etməyib. Hub heç bir karta toxunmur, bayraqlısına da yox.

### 3d · Həddi qaldır — ikinci halqa · 1:41–1:57 (12 s + 4 s)

**Ekranda:** Toggle söndürülür, slider 0.5-dən 0.8-ə çəkilir.
**Gözlənilən nəticə (ölçülüb):** bayraqlanmış halqa **1 → 2**; ikinci halqa
(`ring_5`, UI risk 0.42, 16 hesab) peyda olur və **içində `hub_2` var**.

**De (EN):**
> "A hub is aged, low-velocity, never flagged: invisible to per-account scoring. Raise the threshold: a second ring surfaces, hub inside, precision still one hundred at the account level."

*(28 söz · ~12 s)*

**Redaktor qərarı — "zero percent" səhnədən ÇIXARILDI, Slayd 6-da QALDI.**
Köhnə 3d 27 saniyə idi — efirin 15%-i öz zəifliyimizin izahına gedirdi. Reframe
düzgün idi, yeri səhv: repo oxumayan münsif 30 saniyəlik çərçivəni yox, sadəcə
"zero" sözünü eşidir, və onu demo ekranındakı ikinci halqa ilə bağlaya bilmir
(harness hesab-səviyyəli, dashboard halqa-səviyyəli — bax xəbərdarlıq aşağıda).

Rəqəmin işlədiyi yeganə kontekst **"we publish it"** cümləsidir — o da Slayd
6-dadır: "including the doc that says our hub recall is zero at default". Orada
rəqəm zəiflik yox, dəvətdir. Tam reframe [`qa-defence.md`](./qa-defence.md)
№2-də hazırdır və Slayd 6 Q&A-nı ora çəkir. 3d-də qalan: hub-un *niyə*
per-account skorlama üçün görünməz olduğu (bir cümlə) + ekranda baş verən şey
(bir cümlə). Qazanc: 15 saniyə.

**"At the account level" (dürüstlük tikişi):** "precision still one hundred"
harness-in hesab-səviyyəli ölçüsüdür və doğrudur. Amma eyni slider mövqeyində
(0.8) toggle açılsa, callout **4 hub** sayır və 2-si təmiz hesabdır. Münsif
sonradan alətlə oynasa, "səhnədə 100% dedilər" kimi xatırlamasın deyə üç söz
əlavə olunub. Toggle 0.8-də **göstərilmir** — bu, planlı Q&A "power move"-udur
(№3).

> ⚠️ **Dəqiqlik qeydi — bunu qarışdırma.** "Hub recall 0% → 100%" rəqəmi
> `eval/evaluate.py`-nin **hesab-səviyyəli** ölçüsüdür. Dashboard isə
> **halqa-səviyyəsində** bayraqlayır və node rəngi sabit bantlardır
> (`riskColor`, 0.75 / 0.5) — slider node rəngini **dəyişmir**. Ekranda
> "hub-lar işıqlanır" yox, **ikinci halqa (və onun hub-u) peyda olur**.
> Səhnədə "hub-lar işıqlanır" DEMƏ.

### 3e · Claude izahatı + insan qərarı · 1:57–2:06 (6 s + 3 s)

**Ekranda:** Investigation panel açıq — ölçülmüş sübutlar, Claude izahatı,
confidence, tövsiyə. Sonra **F** → **Enter**.

**De (EN):**
> "Claude writes the case: evidence, confidence, recommendation. It never decides. The analyst does. Confirmed."

*(14 söz)*

---

## Slayd 4 — Features & users · 2:06–2:18

**Ekranda:** Üç sətir, iki sütun — **maksimum 3 element** (köhnə 5 sətirlik
cədvəl kəsildi; dinlənilən slaydda oxunacaq şey 3-dən çox olmamalıdır).

| Nə | Kim |
|---|---|
| Value-flow graph · Louvain rings · sensitivity slider | **Trust & Safety analyst** — Rockstar bu rolu indi axtarır |
| Claude-written case · human decision · nothing auto-banned | **Payments / risk lead** at a merchant of record |
| Drag-and-drop CSV today · same `/events` API in production | **Game economy / live-ops lead** |

**De (EN):**
> "Built for a Trust and Safety analyst; Rockstar is hiring one now. Drag-and-drop is the trial door; production pushes the same events to our API."

*(25 söz · ~11 s)*

**Niyə belə:** Rockstar-ın açıq vakansiyası personanın uydurma olmadığının
sübutudur. Fayl yükləmənin "production yolu deyil" olduğunu özümüz deməsək,
jüri soruşacaq.

---

## Slayd 5 — Monetization · 2:18–2:37

**Ekranda:** Üç rəqəm — **maksimum 3 element** (köhnə 5 bullet kəsildi: Valve
açılışda, 13× Slayd 2-də deyilib — təkrar idi):

1. **$149M** — Roblox, FY2024, fraud chargebacks *(SEC 10-K)*
2. **$10M / il** — Xsolla-nın açıqladığı $1B PC D2C həcmində 1% dispute
   *(1% bizim fərziyyəmizdir, mənbəli 0.26%–3.41% aralığının içində)*
3. **$60K / il → 2.4 ay** geri ödəmə *(Sift median $150K, Vendr; 3× pis
   ssenaridə 7.1 ay)*

**De (EN):**
> "Xsolla published a billion dollars of direct-to-consumer volume. A one percent dispute rate, our assumption inside a sourced 0.26 to 3.41 band, is ten million a year. We charge 60 thousand. A 50-million-bookings studio pays that back in 2.4 months."

*(40 söz · ~18 s)*

**Niyə belə:** "our assumption, inside a sourced band" — bu altı söz bizi "rəqəm
uyduran komanda" kateqoriyasından çıxarır. **Onları udma.** Downside case
("seven months if we're three times worse") səhnədən çıxıb slayda və
[`qa-defence.md`](./qa-defence.md) №10-a keçdi — 9 söz, 4 saniyə, və ask-ın
yerini alırdı. Vaxt artıq qalsa deyilir (bax `demo-script.md` §8).

---

## Slayd 6 — Team + **ASK** · 2:37–3:00

**Ekranda:** Başlıq = ask (slaydın ən böyük mətni, narıncı), altda komanda —
4 şəkil + ad + rol:

> **One labelled dataset. Ninety days.**

| Ad | Rol |
|---|---|
| _(doldur)_ | Engine / detection (Python · FastAPI) |
| _(doldur)_ | API / data layer (Node · Fastify · Prisma) |
| _(doldur)_ | Dashboard / UX (React · Vite) |
| _(doldur)_ | Data generation & evaluation |

**De (EN) — komanda (2:37–2:45):**
> "Team UNECom. Everything's in the repo, including the doc that says our hub recall is zero at default."

*(18 söz · ~8 s)*

**De (EN) — ASK, pitch-in son cümləsi (2:45–2:59), yavaş:**
> "We're not asking you to believe synthetic numbers. Give us one labelled dataset from a live economy, ninety days, and we'll show you where your money went."

*(27 söz · ~12 s)*

**Niyə belə — komanda cümləsi:** "hub recall is zero at default" QALIR. Best
Code münsifi üçün bu dəvətdir: "repo-nu aç, nəyi gizlətdiyimizi yox, nəyi
ölçdüyümüzü görəcəksən." Və Q&A-nın ilk sualını ən hazır olduğumuz sahəyə
(№2) çəkir. 3d-dən çıxarılan "zero" məhz buraya görə çıxarıldı — bir dəfə,
düzgün çərçivədə.

**Niyə belə — ask:** Köhnə pitch "Thank you" ilə bitirdi. Münsif 3 dəqiqə
dinləyib "məndən nə istəyirsiniz?" sualına cavab almırdı — Business Potential
meyarında birbaşa itki. İndi son cümlə:

- **"not asking you to believe synthetic numbers"** — dürüstlük mövqeyini
  bağlanışa daşıyır; №4-ün ("is this real data?") cavabını sual gəlməmiş verir;
- **"one labelled dataset from a live economy"** — istədiyimiz şey pul deyil,
  datadır; Xsolla üçün bu ucuz, bizim üçün yeganə çatışmayan şeydir;
- **"ninety days"** — vaxt-məhdud pilot; **dollar rəqəmi qəsdən yoxdur**: hackathon
  jürisi müqavilə imzalamır, "five thousand dollars" səhnədə "bizə pul verin" kimi
  səslənirdi. Qiymət soruşulsa Q&A №10-dadır;
- **"where your money went"** — Slayd 1-in "traces where in-game value goes"
  cümləsinə qayıdır; merchant of record üçün chargeback *onların* puludur.

"Thank you" deyilmir. Son söz "went"-dir, sonra 1 saniyə sükut, sonra Q&A.

---

## Rəqəmlərin qaynaqları — səhnədə səhv etməmək üçün

| Səhnədə deyilən | Mənbə | Tip |
|---|---|---|
| Valve 2019 "delete CS:GO key trading" · "nearly all … fraud-sourced" | blog.counter-strike.net, Okt 2019 | SOURCED |
| 3.41% · ≈$149M | Roblox FY2024 10-K ($4.37B bookings — slaydda, deyilmir) | SOURCED |
| 0.26% · 13× | Sift Q4 2025 Digital Trust Index | SOURCED |
| $1B PC D2C 2025 | PocketGamer.biz, İyun 2026 | SOURCED |
| 1% dispute rate → $10M | **bizim fərziyyəmiz**, 0.26–3.41 aralığında | ASSUMPTION |
| $60K/il · Sift median $150K (slaydda) | Vendr (anonim müqavilə datası) | SOURCED (secondary) |
| 2.4 ay · 7.1 ay downside (slaydda) | `business-case.md` §5 ROI modeli | arithmetic |
| **90 gün pilot** (dollar rəqəmi deyilmir, slaydda da yoxdur) | `business-case.md` §4 "Land" | our offer |
| 94.9% ring purity · hub recall 0% (default) → 100% (0.8) · precision 100% | `accuracy.md`, 5 seed, hesab-səviyyəli, sintetik | MEASURED |
| 122 hesab · 388 hadisə · $26,814 | demo faylı, engine ölçüsü, 10.09.2026 | MEASURED |
| görür 33 · görmür 9 · $7,607 · 1 hub | həmin fayl, sensitivity 0.5 | MEASURED |
| **28% ("twenty-eight")** | $7,607 ÷ $26,814 = 28.4%, aşağı yuvarlaqlanıb | arithmetic |
| hub STORE-dan alış etməyib ("never touched a card") | həmin fayl, `hub_1`/`hub_2` üçün 0 alış | MEASURED |
| 4 siqnal · çəkilər 0.40 / 0.25 / 0.20 / 0.15 (slaydda) · Louvain | `engine/app/risk_scoring.py` WEIGHTS, `community.py` | CODE |
| "detect it from the money flow between players, not from the client" · 9 pilləli huni (slaydda) | Mansur Mustafayev, GameTech Bootcamp workshop, 9 sentyabr 2026 | SOURCED (bootcamp slaydı) |
| Rockstar T&S vakansiyası | themuse.com elanı | SOURCED |

**Qayda:** bu cədvəldə olmayan heç bir rəqəmi səhnədə demə. Jüri mənbə soruşsa,
cavab bir sətirdir — hamısı yuxarıdadır.
