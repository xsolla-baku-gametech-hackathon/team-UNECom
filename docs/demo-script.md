# Demo ssenarisi — 3 dəqiqə pitch + 2 dəqiqə Q&A

Bu sənəd jüri qarşısında dəqiq nə deyiləcəyini və dashboard-da hansı klikin
ediləcəyini addım-addım təsbit edir. Məqsəd: heç kim səhnədə "indi harda idi"
deyə axtarmasın.

## Hazırlıq (pitch-dən əvvəl, jüri girmədən)

- [ ] `cd web && npm run dev` işə salınıb, brauzer tab açıq, tam ekran (F11).
- [ ] Sensitivlik sürüşdürücüsü **50%**-də saxlanılıb (defolt).
- [ ] Heç bir halqa seçilməyib (investigation panel bağlıdır).
- [ ] Backend (`/api` + `/engine`) canlıdırsa yaxşıdır, deyilsə problem
      deyil — dashboard "demo data" bayrağı ilə mock ssenari üzərində işə
      düşür və vizual olaraq eynidir.
- [ ] Zoom/pan qrafiki mərkəzləşdirilib (səhifə yenilənəndə avtomatik olur).

## Ssenarinin arxa planı (özünüz üçün, jüriyə demə)

Qrafda görünən dünya: ~120 hesab, son 24 saatda ~390 əməliyyat, ~$33K
dövriyyə. Bunun içində:
- **Fərma halqası** (`ring_farm_01`): son 72 saatda yaranmış 50 "mule"
  hesabı, hər biri STORE-dan valyuta alıb (alışların ~70%-i ödəniş
  provayderi tərəfindən oğurlanmış kart şübhəsi ilə bayraqlanıb) və
  dəqiqələr içində 2 "hub" hesaba köçürüb. Risk skoru ~94%.
- **"Whale" hesabı** (`ring_whale_watch`): 320 gün əvvəl yaranmış, 12 fərqli
  tərəfdaşla yüksək dəyərli ticarət edən **real** oyunçu. Xam həcmə görə
  orta-yüksək risk skoru (~58%) alır — sırf statistik oxşarlıq fərma
  hesablarına bənzəyir, amma yaş və payment_flagged siqnalları fərqlidir.

## Pitch strukturu (3:00)

### 0:00–0:35 — Sağlam iqtisadiyyat (Problem + What you built girişi)

**De:** "Hər gün minlərlə oyunçu bir-biri ilə ticarət edir, hədiyyə göndərir,
bazarda satır. Bu — sağlam bir iqtisadiyyatdır." *(Dashboard-a işarə et:
StatsBar-dakı 120+ aktiv hesab, ~390 günlük əməliyyat, ~$33K dövriyyə)*
"Amma bunun içində gizlənən fırıldaq halqalarını tapmaq — insan gözü ilə
mümkün deyil. Biz bunu tapan alət qurduq."

**Klik:** heç nə — qraf sakit dayanır, əksəriyyəti yaşıl.

### 0:35–1:15 — Fərma halqası "canlı" aktivləşir (Solution)

**De:** "Bax, bu qırmızı topa diqqət et. Son 72 saat ərzində 50 yeni hesab
yaranıb, hər biri mağazadan valyuta alıb və dəqiqələr içində 2 mərkəz
hesaba köçürüb. Bu klassik 'gold farming' halqasıdır — və sistemimiz bunu
avtomatik aşkarlayıb, qırmızı işıqlandırıb, risk skoru 94%."

**Klik:** fərma halqasındakı istənilən qırmızı node üzərinə klik et
(qrafikin sağ-yuxarı hissəsindəki sıx qırmızı topa) → investigation panel
açılır, "ring_farm_01" görünür.

**De (panel açılanda):** "Hər bir bayraqlanmış halqaya klikləyəndə,
araşdırmaçı üçün tam kontekst açılır." *(siqnallar siyahısına işarə et)*

Panel-i bağla (və ya açıq saxla, növbəti addıma keç).

### 1:15–2:00 — Sensitivlik sürüşdürücüsü: real oyunçu səhvən bağlanmır

**De:** "İndi diqqət et — bu sarı/narıncı hesab. Yüksək həcmli ticarət edir,
statistik olaraq şübhəli görünür. Amma bu **real, sadiq bir oyunçudur** —
320 gün əvvəl qeydiyyatdan keçib, heç bir ödənişi bayraqlanmayıb."

**Klik:** narıncı "whale" node üzərinə klik → panel onun izahatını göstərir:
"320 gün əvvəl yaradılıb, fərma hesabları adətən 3 gündən azdır..."

**De:** "Sensitivliyi aşağı salaq." **Klik/sürüşdür:** sürüşdürücünü ~50%-dən
~30%-ə endir. "Bax — bayraqlanmış halqa sayı 2-dən 1-ə düşdü. Real oyunçu
artıq yanlış bağlanmır, amma fərma halqası hələ də qırmızıdır, çünki onun
risk skoru həssaslıqdan asılı olmayaraq kifayət qədər yüksəkdir."

*(Whale node-un qırmızı konturu itir, fərma halqası qırmızı qalır —
StatsBar-dakı "Bayraqlanmış halqa" 2 → 1 dəyişir.)*

### 2:00–2:35 — Claude izahatı oxunur (AI-native fərqlilik)

**De:** "Hər bayraqlanmış halqa üçün Claude insan-dilində izahat yazır —
analitik hər dəfə xam rəqəmlərlə boğulmur." *(Fərma halqasına klik et,
panel-dəki "Claude izahatı" mətnini ucadan oxu, ya da xülasə et:)*
"'Bu 52 hesablıq qrup klassik gold farming halqasına bənzəyir... ümumi
risk altında olan dəyər: $X.' Sonra tövsiyə: mule hesablarını dondur, hub-ları
araşdırmaya göndər."

**Klik:** "Fırıldaqdır" düyməsini bas → status təsdiqlənir, panel "Fırıldaq
kimi təsdiqləndi" göstərir.

### 2:35–3:00 — Bağlanış (Monetization + Team girişi)

**De:** "Nəticə: saniyələr içində, minlərlə hesab arasından, kim fırıldaqçı,
kim real oyunçu — insan izahı ilə ayırd edilir. Bu, geri qaytarma
itkilərini azaldır, dəstək komandasının vaxtına qənaət etdirir və ən
əsası — real oyunçuları yanlış bloklamır." *(Komandanı təqdim et.)*

## Q&A üçün hazır cavablar (2:00)

- **"Bu real datadır?"** — Demoda sintetik, ssenarili data istifadə
  olunur (`data-generator/`), amma format istənilən real oyun
  hadisə axını ilə eynidir (`event_id, type, from/to_account_id,
  value_usd_estimate, payment_flagged...`). API canlı olanda eyni
  dashboard heç bir dəyişiklik olmadan real datanı göstərir.
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

Əgər `/api` və ya `/engine` demo anında ayaqda deyilsə: dashboard bunu
avtomatik hiss edir və "demo data" bayrağı ilə eyni ssenarini yerli mock
data üzərində göstərir — vizual fərq yoxdur, pitch dayanmır.
