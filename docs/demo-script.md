# Demo ssenarisi — 3 dəqiqə pitch + 2 dəqiqə Q&A

Bu sənəd jüri qarşısında dəqiq nə deyiləcəyini və dashboard-da hansı klikin
ediləcəyini addım-addım təsbit edir. Məqsəd: heç kim səhnədə "indi harda idi"
deyə axtarmasın.

## Hazırlıq (pitch-dən əvvəl, jüri girmədən)

- [ ] `cd web && npm run dev` işə salınıb, brauzer tab açıq, tam ekran (F11).
- [ ] Demo faylı hazır və asan tapılan yerdədir (məs. masaüstü):
      `data-generator/output/events.csv` — ehtiyat nüsxə də `events.json`
      formatında (əgər CSV drag-and-drop nədənsə keçmirsə).
- [ ] **Backend `/api` + `/engine` boş verilənlər bazası ilə başladılıb**
      (fayl atılana qədər `GET /events` heç nə qaytarmamalıdır) — məqsəd,
      qrafın **canlı, jürinin gözü qarşısında** dolmasıdır. Əgər backend
      artıq doludursa, `npm run prisma:migrate reset` (və ya DB faylını
      sil + `prisma:push`) ilə sıfırla.
- [ ] Sensitivlik sürüşdürücüsü **50%**-də saxlanılıb (defolt).
- [ ] Heç bir halqa seçilməyib (investigation panel bağlıdır), upload
      nəticə banner-i təmizdir.
- [ ] Backend ayaqda deyilsə problem deyil — bax aşağıda "Texniki backup
      planı": dashboard avtomatik mock ssenariyə keçir, eyni hekayəni
      danışmaq mümkündür, sadəcə canlı-yükləmə addımı atlanır.

## Ssenarinin arxa planı (özünüz üçün, jüriyə demə)

Yüklənəcək fayldakı dünya: ~120 hesab, ~390 əməliyyat, ~$33K dövriyyə.
Bunun içində:
- **Fərma halqası** (`ring_farm_01`): son 72 saatda yaranmış 50 "mule"
  hesabı, hər biri STORE-dan valyuta alıb (alışların ~70%-i ödəniş
  provayderi tərəfindən oğurlanmış kart şübhəsi ilə bayraqlanıb) və
  dəqiqələr içində 2 "hub" hesaba köçürüb. Risk skoru ~94%.
- **"Whale" hesabı** (`ring_whale_watch`): 320 gün əvvəl yaranmış, 12 fərqli
  tərəfdaşla yüksək dəyərli ticarət edən **real** oyunçu. Xam həcmə görə
  orta-yüksək risk skoru (~58%) alır — sırf statistik oxşarlıq fərma
  hesablarına bənzəyir, amma yaş və payment_flagged siqnalları fərqlidir.

## Pitch strukturu (3:00)

### 0:00–0:30 — Sıfır quraşdırma: canlı fayl yükləmə (açılış)

**De:** "Heç bir inteqrasiya, heç bir API açarı, heç bir sənədləşmə oxumaq
lazım deyil." *(Ekran boş/demo-data vəziyyətindədir.)* "Bizim komandanın
öz oyun analitikası ixracını götürüb — bax, adi CSV faylı" *(faylı Finder/
Explorer-də bir anlıq göstər)* "— birbaşa brauzerə atıram."

**Klik:** CSV faylını header-dəki yükləmə zonasına sürüşdür (və ya klikləyib
seç). *(İstəsən jürinin özünə "istəsəniz öz faylınızı da atın" təklifini
elə bura, ehtiyat plan kimi saxla — nəticə qarışıq ola bilər, əsas demo
öz hazırladığımız fayldır.)*

**De (yüklənərkən, ~2 san):** "Sistemin özü faylı oxuyub, hesabları
tanıyıb, risk analizini işə salır." *(Yaşıl banner görünür: "388 hadisə
yükləndi, 122 unikal hesab aşkarlandı" — qraf boş/az node-dan tam
şəbəkəyə animasiya ilə keçir.)*

### 0:30–1:00 — Sağlam iqtisadiyyat (Problem)

**De:** "Bax — saniyələr içində 120+ hesab, minə yaxın əməliyyat, $33K
dövriyyə." *(StatsBar-a işarə et.)* "Hər gün minlərlə oyunçu ticarət edir,
hədiyyə göndərir, bazarda satır. Bu sağlam bir iqtisadiyyatdır. Amma
bunun içində gizlənən fırıldaq halqalarını insan gözü ilə tapmaq mümkün
deyil."

### 1:00–1:35 — Fərma halqası qırmızı işıqlanır (Solution)

**De:** "Bax, bu qırmızı topa diqqət et. Yüklədiyimiz datanın içində 50
yeni hesab var idi — hər biri mağazadan valyuta alıb, dəqiqələr içində 2
mərkəz hesaba köçürüb. Sistem bunu avtomatik aşkarlayıb: klassik 'gold
farming' halqası, risk skoru 94%."

**Klik:** fərma halqasındakı istənilən qırmızı node üzərinə klik et →
investigation panel açılır, "ring_farm_01" görünür, siqnallara işarə et.

### 1:35–2:15 — Sensitivlik sürüşdürücüsü: real oyunçu səhvən bağlanmır

**De:** "İndi bu sarı/narıncı hesaba bax. Yüksək həcmli ticarət edir,
statistik olaraq şübhəli görünür. Amma bu **real, sadiq bir oyunçudur** —
320 gün əvvəl qeydiyyatdan keçib, heç bir ödənişi bayraqlanmayıb."

**Klik:** narıncı "whale" node üzərinə klik → panel izahatını göstərir.

**De:** "Sensitivliyi aşağı salaq." **Sürüşdür:** ~50%-dən ~30%-ə. "Bax —
bayraqlanmış halqa sayı 2-dən 1-ə düşdü. Real oyunçu artıq yanlış
bağlanmır, amma fərma halqası hələ də qırmızıdır, çünki risk skoru
həssaslıqdan asılı olmayaraq kifayət qədər yüksəkdir."

### 2:15–2:45 — Claude izahatı oxunur (AI-native fərqlilik)

**De:** "Hər bayraqlanmış halqa üçün Claude insan-dilində izahat yazır."
*(Fərma halqasına klik et, "Claude izahatı" mətnini ucadan oxu/xülasə et,
sonra tövsiyəyə işarə et.)*

**Klik:** "Fırıldaqdır" düyməsini bas → status təsdiqlənir.

### 2:45–3:00 — Bağlanış (Monetization + Team)

**De:** "Nəticə: bir CSV faylı atmaqdan saniyələr sonra — kim fırıldaqçı,
kim real oyunçu, insan izahı ilə ayırd edilir. Sıfır quraşdırma, sıfır
inteqrasiya vaxtı." *(Komandanı təqdim et.)*

## Q&A üçün hazır cavablar (2:00)

- **"Bu real datadır?"** — Demoda sintetik, ssenarili data istifadə
  olunur (`data-generator/`), amma format istənilən real oyun hadisə
  axını ilə eynidir (`event_id, type, from/to_account_id,
  value_usd_estimate, payment_flagged...`) — məhz buna görə də onu CSV
  kimi birbaşa yükləyə bildik, heç bir çevirmə lazım olmadan.
- **"Bizim öz faylımızı yükləsək nə olar?"** — Format uyğun gəlsə (yuxarı
  sütunlar), bəli — parser sətir-səviyyəsində xəta göstərir, sütun
  çatışmazlığını dərhal deyir. Nəticə isə sizin datanızdakı əsl
  nümunədən asılıdır (fərma halqası tapılmaya bilər — bu, sistemin
  doğruluğunun sübutudur, hər şeyi fırıldaq kimi bayraqlamır).
- **"Claude izahatını necə etibar edirsiniz?"** — İzahat qərar vermir,
  yalnız insan araşdırmaçıya kontekst verir; son qərar həmişə "Real
  oyunçudur / Fırıldaqdır" düyməsi ilə insanda qalır (human-in-the-loop).
- **"Yeni fırıldaq nümunələrinə necə uyğunlaşır?"** — Sensitivlik
  sürüşdürücüsü və per-ring "sensitivity override" (backend-də saxlanılır)
  komandaya modeli yenidən yazmadan tənzimləmə imkanı verir.
- **"Miqyaslana bilərmi?"** — Qraf vizuallaşdırması WebGL-canvas əsaslı
  (react-force-graph), minlərlə node-u brauzerdə rahat göstərə bilir;
  ağır analiz backend/engine tərəfində aparılır, frontend yalnız nəticəni
  göstərir.

## Texniki backup planı

- **Backend/`engine` ayaqda deyilsə:** dashboard bunu avtomatik hiss edir
  və "demo data" bayrağı ilə eyni ssenarini yerli mock data üzərində
  göstərir. Bu halda **canlı yükləmə addımını (0:00–0:30) atla** — fayl
  yükləmə əsl backend-ə bağlıdır, mock rejimdə uğursuz olacaq (bu,
  bilərəkdən belədir: yükləmə düyməsi həmişə əsl backend-i sınayır, səssiz
  mock-a keçmir). Pitch-ə birbaşa "0:30 — Sağlam iqtisadiyyat" addımından
  başla, mock data ilə eyni hekayəni danış.
- **Fayl yükləmə uğursuz olarsa (canlı backend var, amma vaxt keçir):**
  panel qırmızı xəta banner-i göstərəcək, dashboard əvvəlki vəziyyətdə
  qalacaq (heç nə sınmır) — sakit şəkildə "keçək əsas mənzərəyə" deyib
  növbəti addıma keç, əvvəldən yüklənmiş demo data ilə davam et.
